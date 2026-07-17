import { createServer } from 'node:http'
import { fetchTicketmasterEvents } from './providers/ticketmaster.mjs'
import { fetchPredictHqEvents } from './providers/predicthq.mjs'
import { fetchOpenAgendaEvents } from './providers/openagenda.mjs'
import { deduplicateEvents } from './utils.mjs'
import { demoPmsData } from './pms/normalize.mjs'
import { mewsStatus, syncMews } from './pms/mews.mjs'
import { deliverMany, notificationStatus } from './notifications/delivery.mjs'

const PORT = Number(process.env.REVPILOT_API_PORT || 4174)
const cache = new Map()
let lastPmsSync = null

function json(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': 'http://127.0.0.1:4173',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
  })
  response.end(JSON.stringify(payload))
}

async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 32_768) throw new Error('Requête trop volumineuse.')
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new Error('Corps JSON invalide.')
  }
}

function parseSearch(url) {
  const latitude = Number(url.searchParams.get('latitude'))
  const longitude = Number(url.searchParams.get('longitude'))
  const radiusKm = Math.min(100, Math.max(1, Number(url.searchParams.get('radiusKm') || 35)))
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !/^\d{4}-\d{2}-\d{2}$/.test(from || '') || !/^\d{4}-\d{2}-\d{2}$/.test(to || '')) {
    throw new Error('Paramètres géographiques ou dates invalides.')
  }
  return { latitude, longitude, radiusKm, from, to }
}

async function loadEvents(search) {
  const providers = [
    {
      name: 'Ticketmaster', configured: Boolean(process.env.TICKETMASTER_API_KEY),
      run: () => fetchTicketmasterEvents(search, process.env.TICKETMASTER_API_KEY),
    },
    {
      name: 'PredictHQ', configured: Boolean(process.env.PREDICTHQ_TOKEN),
      run: () => fetchPredictHqEvents(search, process.env.PREDICTHQ_TOKEN),
    },
    {
      name: 'OpenAgenda', configured: Boolean(process.env.OPENAGENDA_API_KEY && process.env.OPENAGENDA_AGENDA_UIDS),
      run: () => fetchOpenAgendaEvents(search, process.env.OPENAGENDA_API_KEY, process.env.OPENAGENDA_AGENDA_UIDS.split(',').map((value) => value.trim()).filter(Boolean)),
    },
  ]

  const results = await Promise.all(providers.map(async (provider) => {
    if (!provider.configured) return { name: provider.name, configured: false, status: 'missing_key', count: 0 }
    try {
      const events = await provider.run()
      return { name: provider.name, configured: true, status: 'connected', count: events.length, events }
    } catch (error) {
      return { name: provider.name, configured: true, status: 'error', count: 0, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }))
  const events = deduplicateEvents(results.flatMap((result) => result.events ?? []))
  return {
    events,
    providers: results.map(({ events: _events, ...provider }) => provider),
    mode: events.length ? 'live' : 'simulation',
    fetchedAt: new Date().toISOString(),
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || '127.0.0.1'}`)
  if (request.method === 'OPTIONS') return json(response, 204, {})
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return json(response, 200, { status: 'ok', service: 'revpilot-api' })
  }
  if (request.method === 'GET' && url.pathname === '/api/pms/status') {
    const mews = mewsStatus()
    const activeProvider = mews.configured ? 'mews' : null
    return json(response, 200, {
      status: activeProvider ? 'connected' : 'not_configured',
      activeProvider,
      providers: [mews, { id: 'demo', name: 'PMS de démonstration', configured: true }],
      lastSync: lastPmsSync,
    })
  }
  if (request.method === 'GET' && url.pathname === '/api/notifications/status') {
    return json(response, 200, notificationStatus())
  }
  if (request.method === 'POST' && url.pathname === '/api/notifications/test') {
    try {
      const body = await readJson(request)
      const channel = ['email', 'sms', 'whatsapp'].includes(body.channel) ? body.channel : null
      if (!channel) throw new Error('Choisissez email, SMS ou WhatsApp.')
      const results = await deliverMany({
        channels: [channel],
        recipients: { email: body.to, sms: body.to, whatsapp: body.to },
        notification: {
          date: new Date().toISOString().slice(0, 10), level: 'critical',
          title: 'Test de notification réussi',
          message: 'Votre canal est correctement relié à RevPilot. Les futures alertes importantes pourront être envoyées ici.',
        },
        quietHours: false,
        force: true,
      })
      const failed = results.every((result) => result.status === 'failed')
      return json(response, failed ? 400 : 200, { ...(failed ? { error: results[0]?.reason || 'Test impossible.' } : {}), results, testedAt: new Date().toISOString() })
    } catch (error) {
      return json(response, 400, { error: error instanceof Error ? error.message : 'Test impossible.' })
    }
  }
  if (request.method === 'POST' && url.pathname === '/api/notifications/send') {
    try {
      const body = await readJson(request)
      const channels = Array.isArray(body.channels)
        ? [...new Set(body.channels.filter((channel) => ['email', 'sms', 'whatsapp'].includes(channel)))].slice(0, 3)
        : []
      if (!channels.length) throw new Error('Aucun canal externe actif.')
      const notification = body.notification || {}
      if (!notification.title || !notification.message) throw new Error('Le contenu de l’alerte est incomplet.')
      const results = await deliverMany({
        channels,
        recipients: body.recipients || {},
        notification,
        quietHours: body.quietHours !== false,
      })
      return json(response, 200, { results, processedAt: new Date().toISOString() })
    } catch (error) {
      return json(response, 400, { error: error instanceof Error ? error.message : 'Envoi impossible.' })
    }
  }
  if (request.method === 'POST' && url.pathname === '/api/pms/sync') {
    try {
      const body = await readJson(request)
      const provider = body.provider === 'mews' ? 'mews' : body.provider === 'demo' ? 'demo' : null
      if (!provider) throw new Error('Choisissez le connecteur Mews ou le PMS de démonstration.')
      const days = Math.min(90, Math.max(7, Number(body.days) || 90))
      const payload = provider === 'mews'
        ? await syncMews({ days })
        : (() => {
            const syncedAt = new Date()
            const demo = demoPmsData({ days })
            return {
              provider: 'demo', providerName: 'PMS de démonstration',
              sourceName: `PMS de démonstration · synchronisé le ${syncedAt.toLocaleString('fr-FR')}`,
              ...demo, syncedAt: syncedAt.toISOString(),
              warnings: ['Données fictives : utilisez Mews avec les jetons d’un hôtel pour une synchronisation réelle.'],
            }
          })()
      lastPmsSync = payload.syncedAt
      return json(response, 200, payload)
    } catch (error) {
      return json(response, 400, { error: error instanceof Error ? error.message : 'Synchronisation PMS impossible.' })
    }
  }
  if (request.method === 'GET' && url.pathname === '/api/events') {
    try {
      const search = parseSearch(url)
      const key = JSON.stringify(search)
      const cached = cache.get(key)
      if (cached && Date.now() - cached.time < 15 * 60_000) return json(response, 200, { ...cached.payload, cached: true })
      const payload = await loadEvents(search)
      cache.set(key, { time: Date.now(), payload })
      return json(response, 200, { ...payload, cached: false })
    } catch (error) {
      return json(response, 400, { error: error instanceof Error ? error.message : 'Requête invalide.' })
    }
  }
  return json(response, 404, { error: 'Route inconnue.' })
})

server.listen(PORT, '127.0.0.1', () => console.log(`API RevPilot : http://127.0.0.1:${PORT}`))
