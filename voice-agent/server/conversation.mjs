import { addCallMessage, createReservationRequest, endCall, startCall } from './store.mjs'
import { executeTool } from './tools.mjs'

const sessions = new Map()

function detectLanguage(text) {
  if (/\b(hello|room|book|parking|breakfast)\b/i.test(text)) return 'en'
  if (/\b(hola|habitación|reserva|desayuno)\b/i.test(text)) return 'es'
  return 'fr'
}

function extractDates(text) {
  const iso = text.match(/\b20\d{2}-\d{2}-\d{2}\b/g)
  if (iso?.length >= 2) return { checkIn: iso[0], checkOut: iso[1] }
  const french = [...text.matchAll(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d{2})\b/g)].map((match) => `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`)
  return french.length >= 2 ? { checkIn: french[0], checkOut: french[1] } : null
}

function guestsFrom(text) {
  const match = text.match(/(\d+)\s*(personne|personnes|voyageur|voyageurs|people|guest|guests)/i)
  return match ? Number(match[1]) : 2
}

function optionAnswer(text) {
  if (/parking/i.test(text) && /petit.?déjeuner|breakfast|desayuno/i.test(text)) return 'Bien sûr. Le parking sécurisé coûte 14 euros par nuit. Le petit-déjeuner buffet coûte 18 euros par personne et par jour. Voulez-vous que je vous explique l’une de ces options plus en détail ?'
  if (/parking/i.test(text)) return 'Oui. Le parking sécurisé coûte 14 euros par nuit, sur réservation.'
  if (/petit.?déjeuner|breakfast|desayuno/i.test(text)) return 'Le petit-déjeuner buffet coûte 18 euros par personne et par jour.'
  if (/animal|chien|pet/i.test(text)) return 'Les animaux de moins de 10 kilos sont acceptés avec un supplément de 12 euros par nuit.'
  if (/horaire|check.?in|arrivée/i.test(text)) return 'Les chambres sont disponibles à partir de 15 heures et le départ est prévu avant 11 heures.'
  return null
}

export function beginDemoCall() {
  const call = startCall({ channel: 'browser' })
  const session = { callId: call.id, language: 'fr', lastAvailability: null, step: 'ready', draft: {}, lastAssistant: '', confusionCount: 0 }
  sessions.set(call.id, session)
  const message = 'Bonjour et bienvenue au Grand Hôtel Démo. Je suis l’assistante virtuelle de l’hôtel. Comment puis-je vous aider ?'
  addCallMessage(call.id, 'assistant', message)
  session.lastAssistant = message
  return { sessionId: call.id, message, language: 'fr' }
}

export async function respondToDemoCall(sessionId, text) {
  const session = sessions.get(sessionId)
  if (!session) throw new Error('Cette simulation d’appel a expiré.')
  const clean = String(text || '').trim()
  if (!clean) throw new Error('Le message est vide.')
  addCallMessage(session.callId, 'caller', clean)
  session.language = detectLanguage(clean)

  let message
  let action = null
  const info = optionAnswer(clean)
  if (/je ne comprends pas|j.?ai pas compris|explique|reformule|ça veut dire quoi|comment ça|pardon|répète/i.test(clean)) {
    session.confusionCount += 1
    if (session.confusionCount >= 3) {
      const result = await executeTool('transfer_to_reception', { reason: 'Le client ne comprend pas les explications de l’agent', language: session.language }, { callId: session.callId })
      message = 'Je préfère ne pas vous faire perdre de temps. Je demande à la réception de reprendre la conversation avec vous.'
      action = { tool: 'transfer_to_reception', result }
    } else if (session.step === 'awaiting_guest') {
      message = 'Bien sûr. J’ai seulement besoin du nom et du prénom de la personne qui souhaite séjourner à l’hôtel. Par exemple : Marie Dupont.'
    } else if (session.step === 'awaiting_email') {
      message = 'Pas de souci. L’adresse e-mail servira uniquement à recevoir la réponse de la réception. Vous pouvez me la donner comme ceci : marie, arobase, exemple, point com.'
    } else if (session.lastAvailability?.rooms?.[0]) {
      const room = session.lastAvailability.rooms[0]
      message = `Je reformule simplement : ${room.name} est disponible pour les dates demandées. Le séjour coûterait ${room.totalStay} euros au total. Voulez-vous que j’envoie cette demande à la réception, oui ou non ?`
    } else {
      message = 'Bien sûr. Quelle partie n’était pas claire : les dates, le prix, les options de l’hôtel ou la réservation ?'
    }
  } else if (/humain|réception|reception|conseiller|parler\s+(à|avec)\s+(quelqu|un agent)/i.test(clean)) {
    const result = await executeTool('transfer_to_reception', { reason: clean, language: session.language }, { callId: session.callId })
    message = `${result.message} Dans une installation réelle, l’appel serait maintenant redirigé vers le numéro de l’hôtel.`
    action = { tool: 'transfer_to_reception', result }
  } else if (info) {
    message = info
    action = { tool: 'get_hotel_information' }
  } else if (session.step === 'awaiting_guest') {
    session.confusionCount = 0
    session.draft.guestName = clean
    session.step = 'awaiting_email'
    message = `Merci ${clean}. Quelle adresse e-mail dois-je associer à la demande ?`
  } else if (session.step === 'awaiting_email') {
    session.confusionCount = 0
    session.draft.email = clean
    const room = session.lastAvailability?.rooms[0]
    try {
      const result = await executeTool('create_reservation_request', { ...session.draft, roomTypeId: room.roomTypeId, options: [] }, { callId: session.callId })
      message = `C’est noté. Votre demande porte la référence ${result.requestId}. La réception doit encore la confirmer par e-mail.`
      action = { tool: 'create_reservation_request', result }
      session.step = 'ready'
    } catch (error) {
      message = `Je ne peux pas enregistrer la demande : ${error.message} Je vous transfère vers la réception.`
      session.step = 'ready'
    }
  } else {
    const dates = extractDates(clean)
    if (dates) {
      session.confusionCount = 0
      try {
        const availability = await executeTool('check_availability', { ...dates, guests: guestsFrom(clean) }, { callId: session.callId })
        session.lastAvailability = availability
        session.draft = { ...dates, guests: availability.guests }
        const room = availability.rooms[0]
        message = room
          ? `J’ai trouvé ${room.name} à ${room.nightlyRate} euros par nuit, soit ${room.totalStay} euros pour ${availability.nights} nuit${availability.nights > 1 ? 's' : ''}. Souhaitez-vous créer une demande de réservation ?`
          : 'Je suis désolée, aucune chambre correspondant à cette demande n’est disponible. Je peux vous transférer à la réception.'
        action = { tool: 'check_availability', result: availability }
      } catch (error) {
        message = `Je ne peux pas vérifier ces dates : ${error.message}`
      }
    } else if (/oui|réserver|reservation|book/i.test(clean) && session.lastAvailability) {
      session.step = 'awaiting_guest'
      message = 'Très bien. Pour préparer la demande, pouvez-vous me donner votre nom et votre prénom ?'
    } else if (/disponib|chambre|tarif|prix|réserver|book|room/i.test(clean)) {
      message = 'Indiquez-moi la date d’arrivée et la date de départ. Par exemple : du 20/08/2026 au 22/08/2026 pour 2 personnes.'
    } else if (/merci|au revoir|goodbye/i.test(clean)) {
      message = 'Merci de votre appel. Toute l’équipe du Grand Hôtel Démo vous souhaite une excellente journée.'
      endCall(session.callId)
    } else {
      message = 'Je peux vérifier les disponibilités et les tarifs, expliquer les options de l’hôtel ou vous transférer à la réception. Que souhaitez-vous faire ?'
    }
  }

  addCallMessage(session.callId, 'assistant', message)
  session.lastAssistant = message
  return { sessionId, message, language: session.language, action }
}

export function resetDemoSessions() {
  sessions.clear()
}
