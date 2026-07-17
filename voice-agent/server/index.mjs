import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beginDemoCall, respondToDemoCall } from './conversation.mjs'
import { publicHotelConfig } from './hotel.mjs'
import { createRealtimeBridge, validateTwilioSignature } from './realtime-bridge.mjs'
import { listCalls, listHandoffs, listReservationRequests } from './store.mjs'
import { executeTool } from './tools.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const publicDir = join(root, 'public')
const port = Number(process.env.VOICE_PORT || 4180)

const contentTypes = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' }

function json(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  response.end(JSON.stringify(payload))
}

function xml(response, status, payload) {
  response.writeHead(status, { 'content-type': 'text/xml; charset=utf-8' })
  response.end(payload)
}

async function body(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 1_000_000) throw new Error('Requête trop volumineuse.')
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (request.headers['content-type']?.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(raw))
  return raw ? JSON.parse(raw) : {}
}

function serveStatic(pathname, response) {
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1)
  const file = normalize(join(publicDir, relative))
  if (!file.startsWith(publicDir) || !existsSync(file) || !statSync(file).isFile()) return false
  response.writeHead(200, { 'content-type': contentTypes[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' })
  createReadStream(file).pipe(response)
  return true
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
  try {
    if (request.method === 'GET' && url.pathname === '/api/status') return json(response, 200, {
      ready: true,
      mode: process.env.OPENAI_API_KEY && process.env.TWILIO_ACCOUNT_SID ? 'live_ready' : 'demo',
      services: { openai: Boolean(process.env.OPENAI_API_KEY), twilio: Boolean(process.env.TWILIO_ACCOUNT_SID), pms: process.env.PMS_PROVIDER || 'demo' },
    })
    if (request.method === 'GET' && url.pathname === '/api/hotel') return json(response, 200, publicHotelConfig())
    if (request.method === 'GET' && url.pathname === '/api/availability') {
      const result = await executeTool('check_availability', { checkIn: url.searchParams.get('checkIn'), checkOut: url.searchParams.get('checkOut'), guests: Number(url.searchParams.get('guests') || 1) })
      return json(response, 200, result)
    }
    if (request.method === 'GET' && url.pathname === '/api/calls') return json(response, 200, listCalls())
    if (request.method === 'GET' && url.pathname === '/api/reservation-requests') return json(response, 200, listReservationRequests())
    if (request.method === 'GET' && url.pathname === '/api/handoffs') return json(response, 200, listHandoffs())
    if (request.method === 'POST' && url.pathname === '/api/demo/calls') return json(response, 201, beginDemoCall())
    if (request.method === 'POST' && url.pathname === '/api/demo/messages') {
      const payload = await body(request)
      return json(response, 200, await respondToDemoCall(payload.sessionId, payload.message))
    }
    if (request.method === 'POST' && url.pathname === '/api/reservation-requests') {
      const payload = await body(request)
      return json(response, 201, await executeTool('create_reservation_request', payload, { callId: payload.callId }))
    }
    if (request.method === 'POST' && url.pathname === '/api/handoffs') {
      const payload = await body(request)
      return json(response, 201, await executeTool('transfer_to_reception', payload, { callId: payload.callId }))
    }
    if (request.method === 'POST' && url.pathname === '/twilio/voice') {
      const payload = await body(request)
      const publicBase = process.env.PUBLIC_BASE_URL
      const signatureUrl = `${publicBase || `http://${request.headers.host}`}/twilio/voice`
      if (!validateTwilioSignature(request.headers['x-twilio-signature'], signatureUrl, payload)) return xml(response, 403, '<Response><Reject reason="rejected" /></Response>')
      if (!publicBase || !process.env.OPENAI_API_KEY) return xml(response, 200, '<Response><Say language="fr-FR">Le service vocal est en cours de configuration. Nous vous transférons vers la réception.</Say><Dial>' + (process.env.RECEPTION_PHONE_NUMBER || '') + '</Dial></Response>')
      const wsUrl = publicBase.replace(/^http/, 'ws') + '/twilio/media'
      return xml(response, 200, `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="${wsUrl}" /></Connect></Response>`)
    }
    if (request.method === 'POST' && url.pathname === '/twilio/transfer') {
      const payload = await body(request)
      const publicBase = process.env.PUBLIC_BASE_URL
      const signatureUrl = `${publicBase || `http://${request.headers.host}`}/twilio/transfer`
      if (!validateTwilioSignature(request.headers['x-twilio-signature'], signatureUrl, payload)) return xml(response, 403, '<Response><Reject reason="rejected" /></Response>')
      const phone = String(process.env.RECEPTION_PHONE_NUMBER || '').replace(/[^+\d]/g, '')
      return xml(response, 200, phone ? `<Response><Say language="fr-FR">Je vous transfère vers la réception.</Say><Dial>${phone}</Dial></Response>` : '<Response><Say language="fr-FR">La réception est momentanément indisponible.</Say></Response>')
    }
    if (request.method === 'GET' && serveStatic(url.pathname, response)) return
    json(response, 404, { error: 'Route introuvable.' })
  } catch (error) {
    json(response, 400, { error: error instanceof Error ? error.message : 'Erreur inconnue.' })
  }
})

createRealtimeBridge(server)
server.listen(port, '127.0.0.1', () => {
  console.log(`RevPilot Voice : http://127.0.0.1:${port}`)
  console.log(process.env.OPENAI_API_KEY ? 'OpenAI Realtime configuré.' : 'Mode démonstration : clé OpenAI absente.')
})
