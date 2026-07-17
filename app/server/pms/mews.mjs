import { addDays, isoDate, reservationsToDailyData } from './normalize.mjs'

const CLIENT = 'RevPilot 0.2.0'

function configFromEnv() {
  const environment = process.env.MEWS_ENVIRONMENT === 'production' ? 'production' : 'demo'
  return {
    clientToken: process.env.MEWS_CLIENT_TOKEN || '',
    accessToken: process.env.MEWS_ACCESS_TOKEN || '',
    serviceId: process.env.MEWS_SERVICE_ID || '',
    roomCount: Number(process.env.MEWS_ROOM_COUNT || 0),
    defaultRoomRate: Number(process.env.MEWS_DEFAULT_ROOM_RATE || 110),
    baseUrl: environment === 'production' ? 'https://api.mews.com' : 'https://api.mews-demo.com',
    environment,
  }
}

export function mewsStatus() {
  const config = configFromEnv()
  return {
    id: 'mews',
    name: 'Mews',
    configured: Boolean(config.clientToken && config.accessToken),
    environment: config.environment,
  }
}

async function postMews(config, path, payload) {
  const response = await fetch(`${config.baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ClientToken: config.clientToken,
      AccessToken: config.accessToken,
      Client: CLIENT,
      ...payload,
    }),
    signal: AbortSignal.timeout(15_000),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = body.Message || body.message || body.Error?.Message || `HTTP ${response.status}`
    throw new Error(`Mews a refusé la synchronisation : ${message}`)
  }
  return body
}

async function getAllPages(config, path, key, payload) {
  const all = []
  let cursor
  do {
    const body = await postMews(config, path, {
      ...payload,
      Limitation: { Count: 1000, ...(cursor ? { Cursor: cursor } : {}) },
    })
    all.push(...(body[key] || []))
    cursor = body.Cursor
  } while (cursor)
  return all
}

async function resolveStayService(config) {
  if (config.serviceId) return config.serviceId
  const services = await getAllPages(config, '/api/connector/v1/services/getAll', 'Services', { ServiceType: 'Bookable' })
  const stay = services.find((service) => service.IsActive
    && service.Data?.Discriminator === 'Bookable'
    && service.Data?.Value?.TimeUnitPeriod === 'Day')
  if (!stay) throw new Error('Aucun service d’hébergement journalier actif n’a été trouvé dans Mews.')
  return stay.Id
}

async function resolveRoomCount(config) {
  if (config.roomCount > 0) return config.roomCount
  const resources = await getAllPages(config, '/api/connector/v1/resources/getAll', 'Resources', {
    Extent: { Resources: true, Inactive: false },
  })
  const spaces = resources.filter((resource) => resource.IsActive
    && !resource.ParentResourceId
    && resource.Data?.Discriminator === 'Space'
    && !['OutOfOrder', 'OutOfService'].includes(resource.State))
  if (!spaces.length) throw new Error('La capacité de l’hôtel est introuvable. Configurez MEWS_ROOM_COUNT.')
  return spaces.length
}

async function getReservations(config, serviceId, start, end) {
  return getAllPages(config, '/api/connector/v1/reservations/getAll/2023-06-06', 'Reservations', {
    ServiceIds: [serviceId],
    CollidingUtc: { StartUtc: start.toISOString(), EndUtc: end.toISOString() },
    States: ['Confirmed', 'Started', 'Processed'],
  })
}

export async function syncMews({ days = 90 } = {}) {
  const config = configFromEnv()
  if (!config.clientToken || !config.accessToken) {
    throw new Error('Les jetons Mews ne sont pas configurés. Lancez ./configure-pms.sh.')
  }
  const safeDays = Math.min(90, Math.max(7, Number(days) || 90))
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  const end = addDays(start, safeDays)
  const previousStart = new Date(start)
  previousStart.setUTCFullYear(previousStart.getUTCFullYear() - 1)
  const previousEnd = addDays(previousStart, safeDays)
  const [serviceId, roomCount] = await Promise.all([resolveStayService(config), resolveRoomCount(config)])
  const [reservations, previousReservations] = await Promise.all([
    getReservations(config, serviceId, start, end),
    getReservations(config, serviceId, previousStart, previousEnd),
  ])
  const syncedAt = new Date()
  return {
    provider: 'mews',
    providerName: 'Mews',
    sourceName: `Mews · synchronisé le ${syncedAt.toLocaleString('fr-FR')}`,
    rows: reservationsToDailyData({
      reservations,
      previousReservations,
      start,
      days: safeDays,
      roomCount,
      defaultRoomRate: config.defaultRoomRate,
      syncedAt,
    }),
    recordCount: reservations.length,
    roomCount,
    syncedAt: syncedAt.toISOString(),
    warnings: [
      `Le revenu utilise provisoirement le tarif moyen configuré (${config.defaultRoomRate} €).`,
      'Aucun prix n’est écrit dans Mews : cette connexion est en lecture seule.',
    ],
    serviceId,
    period: { from: isoDate(start), to: isoDate(addDays(end, -1)) },
  }
}
