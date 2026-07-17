const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => [...document.querySelectorAll(selector)]

const state = { sessionId: null, startedAt: null, timer: null, recognition: null, speaking: false }
const overlay = $('#callOverlay')
const transcript = $('#transcript')
const input = $('#messageInput')
const trace = $('#toolTrace')

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'content-type': 'application/json', ...(options.headers || {}) }, ...options })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Une erreur est survenue.')
  return payload
}

function toast(message) {
  const element = $('#toast')
  element.textContent = message
  element.classList.add('show')
  setTimeout(() => element.classList.remove('show'), 3200)
}

function addMessage(role, text) {
  const item = document.createElement('div')
  item.className = `message ${role}`
  const avatar = document.createElement('span')
  avatar.textContent = role === 'assistant' ? 'RV' : 'VOUS'
  const bubble = document.createElement('div')
  bubble.className = 'bubble'
  bubble.textContent = text
  item.append(avatar, bubble)
  transcript.append(item)
  transcript.scrollTop = transcript.scrollHeight
}

function preferredVoice(language = 'fr') {
  const voices = speechSynthesis.getVoices()
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(language) && /audrey|amélie|amelie|denise|female/i.test(voice.name))
    || voices.find((voice) => voice.lang.toLowerCase().startsWith(language))
}

function speak(text, language = 'fr') {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'fr-FR'
  utterance.voice = preferredVoice(language)
  utterance.rate = .98
  utterance.pitch = 1.02
  utterance.onstart = () => { state.speaking = true; $('#speakingLabel').textContent = 'L’agent parle' }
  utterance.onend = () => { state.speaking = false; $('#speakingLabel').textContent = 'À votre écoute' }
  speechSynthesis.speak(utterance)
}

function updateTimer() {
  const seconds = Math.floor((Date.now() - state.startedAt) / 1000)
  $('#callTimer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} · aperçu navigateur, voix non définitive`
}

async function startCall() {
  try {
    const result = await api('/api/demo/calls', { method: 'POST', body: '{}' })
    state.sessionId = result.sessionId
    state.startedAt = Date.now()
    clearInterval(state.timer)
    state.timer = setInterval(updateTimer, 1000)
    transcript.innerHTML = ''
    trace.className = 'tool-trace'
    overlay.classList.add('open')
    overlay.setAttribute('aria-hidden', 'false')
    addMessage('assistant', result.message)
    speak(result.message, result.language)
    input.focus()
    await refreshDashboard()
  } catch (error) { toast(error.message) }
}

function closeCall() {
  speechSynthesis?.cancel()
  clearInterval(state.timer)
  overlay.classList.remove('open')
  overlay.setAttribute('aria-hidden', 'true')
  state.sessionId = null
  refreshDashboard()
}

async function sendMessage(message) {
  if (!state.sessionId || !message.trim()) return
  addMessage('caller', message)
  input.value = ''
  $('#speakingLabel').textContent = 'Analyse en cours…'
  try {
    const result = await api('/api/demo/messages', { method: 'POST', body: JSON.stringify({ sessionId: state.sessionId, message }) })
    addMessage('assistant', result.message)
    if (result.action?.tool) {
      const labels = { check_availability: 'PMS consulté en temps réel', get_hotel_information: 'Information hôtelière vérifiée', create_reservation_request: `Demande ${result.action.result?.requestId || ''} créée`, transfer_to_reception: 'Transfert humain demandé' }
      trace.textContent = `✓ ${labels[result.action.tool] || result.action.tool}`
      trace.className = 'tool-trace show'
    }
    speak(result.message, result.language)
    await refreshDashboard()
  } catch (error) { toast(error.message); $('#speakingLabel').textContent = 'À votre écoute' }
}

async function refreshDashboard() {
  try {
    const [status, calls, requests, handoffs] = await Promise.all([api('/api/status'), api('/api/calls'), api('/api/reservation-requests'), api('/api/handoffs')])
    $('#callsCount').textContent = calls.length
    $('#requestsCount').textContent = requests.length
    $('#handoffsCount').textContent = handoffs.length
    $('#openaiStatus').textContent = status.services.openai ? 'Configuré' : 'Non configuré'
    $('#openaiStatus').className = status.services.openai ? 'connected' : ''
    $('#twilioStatus').textContent = status.services.twilio ? 'Configuré' : 'Non configuré'
    $('#twilioStatus').className = status.services.twilio ? 'connected' : ''
    $('#pmsStatus').textContent = status.services.pms === 'demo' ? 'Démo connectée' : status.services.pms
    const badge = $('#modeBadge')
    badge.innerHTML = `<i></i>${status.mode === 'live_ready' ? 'Prêt pour les appels réels' : 'Mode démonstration'}`
    badge.className = `mode-badge ${status.mode === 'live_ready' ? 'live' : ''}`

    const activity = $('#activityList')
    activity.innerHTML = calls.length ? calls.slice(0, 5).map((call) => `<div class="activity-item"><span>☎</span><div><strong>${call.channel === 'twilio' ? 'Appel téléphonique' : 'Simulation navigateur'}</strong><small>${new Date(call.startedAt).toLocaleString('fr-FR')} · ${call.messages.length} message(s)</small></div><b>${call.status === 'in_progress' ? 'En cours' : 'Terminé'}</b></div>`).join('') : '<div class="empty"><span>☎</span><strong>Aucun appel pour le moment</strong><p>Lance une simulation pour voir apparaître la conversation.</p></div>'

    $('#requestsBody').innerHTML = requests.length ? requests.map((request) => `<tr><td><strong>${request.id}</strong></td><td>${request.guestName}<br><small>${request.email}</small></td><td>${formatDate(request.checkIn)} → ${formatDate(request.checkOut)}</td><td>${request.roomTypeId}</td><td><strong>${request.quotedPrice} €</strong></td><td><span class="request-status">À confirmer</span></td></tr>`).join('') : '<tr><td colspan="6" class="table-empty">Aucune demande enregistrée.</td></tr>'
  } catch (error) { toast(`Serveur indisponible : ${error.message}`) }
}

function formatDate(value) { return new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }

function setupRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Recognition) { $('#micButton').title = 'Reconnaissance vocale indisponible dans ce navigateur'; return }
  state.recognition = new Recognition()
  state.recognition.lang = 'fr-FR'
  state.recognition.interimResults = false
  state.recognition.onstart = () => { $('#micButton').classList.add('listening'); $('#speakingLabel').textContent = 'Je vous écoute…' }
  state.recognition.onend = () => { $('#micButton').classList.remove('listening'); if (!state.speaking) $('#speakingLabel').textContent = 'À votre écoute' }
  state.recognition.onerror = () => toast('Le micro n’a pas pu être utilisé. Tu peux écrire le message.')
  state.recognition.onresult = (event) => sendMessage(event.results[0][0].transcript)
}

$$('[data-start-call]').forEach((button) => button.addEventListener('click', startCall))
$('#closeCall').addEventListener('click', closeCall)
$('#endCall').addEventListener('click', closeCall)
$('#refreshButton').addEventListener('click', refreshDashboard)
$('#callForm').addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value) })
$('#quickPrompts').addEventListener('click', (event) => { const message = event.target.dataset.message; if (message) sendMessage(message) })
$('#micButton').addEventListener('click', () => { if (!state.recognition) return toast('Utilise Chrome pour tester le micro, ou écris ta demande.'); speechSynthesis?.cancel(); state.recognition.start() })
overlay.addEventListener('mousedown', (event) => { if (event.target === overlay) closeCall() })

setupRecognition()
speechSynthesis?.addEventListener?.('voiceschanged', () => {})
refreshDashboard()
setInterval(refreshDashboard, 15000)
