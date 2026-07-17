import { createHmac, timingSafeEqual } from 'node:crypto'
import WebSocket, { WebSocketServer } from 'ws'
import { addCallMessage, endCall, startCall } from './store.mjs'
import { executeTool, toolDefinitions } from './tools.mjs'

const SYSTEM_INSTRUCTIONS = `Tu es une réceptionniste expérimentée et chaleureuse du Grand Hôtel Démo à Orange, pas un standard automatique.
Parle comme une personne au téléphone : ton calme, phrases courtes, vocabulaire simple, petites transitions naturelles comme « bien sûr », « je regarde » ou « pas de souci » quand elles conviennent.
Réponds dans la langue du client. Pose une seule question à la fois et laisse le client répondre. Évite les listes et le jargon.
Ne répète jamais mot pour mot une question ou une réponse.
Si le client dit qu'il n'a pas compris, reconnais-le brièvement puis reformule avec des mots plus simples et un exemple concret. Vérifie ensuite si c'est plus clair.
Si une réponse audio est ambiguë, demande précisément l'information manquante au lieu de recommencer tout le parcours.
Après deux incompréhensions sur le même point, propose spontanément la réception.
Tu n'inventes jamais une disponibilité, un prix, une politique ou une confirmation.
Utilise check_availability avant d'annoncer une chambre ou un tarif.
Une demande créée n'est pas une réservation confirmée : dis toujours qu'elle doit être confirmée par la réception.
Avant create_reservation_request, récapitule dates, chambre, prix, nom et e-mail, puis obtiens un accord explicite.
Transfère vers la réception si le client le demande, si une information est absente, en cas de paiement, de plainte, d'urgence ou après deux incompréhensions.
Ne collecte jamais de numéro de carte bancaire.`

function safeEqual(left, right) {
  const a = Buffer.from(left || '')
  const b = Buffer.from(right || '')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function validateTwilioSignature(signature, url, params = {}) {
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!token) return process.env.NODE_ENV !== 'production'
  const payload = url + Object.keys(params).sort().map((key) => `${key}${params[key]}`).join('')
  const expected = createHmac('sha1', token).update(payload).digest('base64')
  return safeEqual(signature, expected)
}

function sendJson(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload))
}

export function createRealtimeBridge(server) {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '/', 'http://localhost')
    if (url.pathname !== '/twilio/media') return socket.destroy()
    const publicBase = process.env.PUBLIC_BASE_URL
    const signatureUrl = publicBase ? `${publicBase.replace(/^http/, 'ws')}${url.pathname}` : `ws://${request.headers.host}${url.pathname}`
    if (!validateTwilioSignature(request.headers['x-twilio-signature'], signatureUrl)) return socket.destroy()
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request))
  })

  wss.on('connection', (twilioSocket) => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      twilioSocket.close(1011, 'OPENAI_API_KEY absente')
      return
    }

    const call = startCall({ channel: 'twilio', caller: 'Appel téléphonique' })
    let streamSid = null
    let callSid = null
    let openAiReady = false
    const pendingAudio = []
    const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime'
    const openAiSocket = new WebSocket(`wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`, {
      headers: { Authorization: `Bearer ${apiKey}`, 'OpenAI-Beta': 'realtime=v1' },
    })

    openAiSocket.on('open', () => {
      openAiReady = true
      sendJson(openAiSocket, {
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: SYSTEM_INSTRUCTIONS,
          voice: process.env.OPENAI_REALTIME_VOICE || 'marin',
          input_audio_format: 'g711_ulaw',
          output_audio_format: 'g711_ulaw',
          input_audio_transcription: { model: 'gpt-4o-mini-transcribe' },
          turn_detection: { type: 'server_vad', threshold: 0.5, silence_duration_ms: 550 },
          temperature: 0.8,
          tool_choice: 'auto',
          tools: toolDefinitions,
        },
      })
      for (const audio of pendingAudio.splice(0)) sendJson(openAiSocket, { type: 'input_audio_buffer.append', audio })
      sendJson(openAiSocket, { type: 'response.create', response: { instructions: 'Salue brièvement le client et demande comment tu peux l’aider.' } })
    })

    openAiSocket.on('message', async (raw) => {
      let event
      try { event = JSON.parse(raw.toString()) } catch { return }

      if (['response.audio.delta', 'response.output_audio.delta'].includes(event.type) && event.delta && streamSid) {
        sendJson(twilioSocket, { event: 'media', streamSid, media: { payload: event.delta } })
      }
      if (event.type === 'input_audio_buffer.speech_started' && streamSid) {
        sendJson(twilioSocket, { event: 'clear', streamSid })
        sendJson(openAiSocket, { type: 'response.cancel' })
      }
      if (['conversation.item.input_audio_transcription.completed'].includes(event.type) && event.transcript) {
        addCallMessage(call.id, 'caller', event.transcript)
      }
      if (['response.audio_transcript.done', 'response.output_audio_transcript.done'].includes(event.type) && event.transcript) {
        addCallMessage(call.id, 'assistant', event.transcript)
      }
      if (event.type === 'response.function_call_arguments.done') {
        try {
          const args = JSON.parse(event.arguments || '{}')
          const result = await executeTool(event.name, args, { callId: call.id, callSid })
          if (event.name === 'transfer_to_reception') result.liveTransferStarted = await redirectTwilioCall(callSid)
          sendJson(openAiSocket, { type: 'conversation.item.create', item: { type: 'function_call_output', call_id: event.call_id, output: JSON.stringify(result) } })
        } catch (error) {
          sendJson(openAiSocket, { type: 'conversation.item.create', item: { type: 'function_call_output', call_id: event.call_id, output: JSON.stringify({ success: false, error: error.message }) } })
        }
        sendJson(openAiSocket, { type: 'response.create' })
      }
      if (event.type === 'error') console.error('[OpenAI Realtime]', event.error?.message || event)
    })

    twilioSocket.on('message', (raw) => {
      let event
      try { event = JSON.parse(raw.toString()) } catch { return }
      if (event.event === 'start') {
        streamSid = event.start?.streamSid
        callSid = event.start?.callSid
      }
      if (event.event === 'media' && event.media?.payload) {
        if (openAiReady) sendJson(openAiSocket, { type: 'input_audio_buffer.append', audio: event.media.payload })
        else pendingAudio.push(event.media.payload)
      }
      if (event.event === 'stop') {
        endCall(call.id)
        openAiSocket.close()
      }
    })

    twilioSocket.on('close', () => {
      endCall(call.id)
      if (openAiSocket.readyState === WebSocket.OPEN || openAiSocket.readyState === WebSocket.CONNECTING) openAiSocket.close()
    })
    openAiSocket.on('error', (error) => console.error('[OpenAI WebSocket]', error.message))
  })

  return wss
}

async function redirectTwilioCall(callSid) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const publicBase = process.env.PUBLIC_BASE_URL
  const reception = process.env.RECEPTION_PHONE_NUMBER
  if (!callSid || !accountSid || !authToken || !publicBase || !reception) return false
  const body = new URLSearchParams({ Url: `${publicBase}/twilio/transfer`, Method: 'POST' })
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callSid}.json`, {
    method: 'POST',
    headers: { authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`, 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) throw new Error(`Le transfert Twilio a échoué (${response.status}).`)
  return true
}
