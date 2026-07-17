import { hotel } from './hotel.mjs'
import { demoPms } from './pms/demo-pms.mjs'
import { createHandoff, createReservationRequest } from './store.mjs'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const toolDefinitions = [
  {
    type: 'function', name: 'check_availability', description: 'Vérifie les chambres et tarifs disponibles dans le PMS.',
    parameters: { type: 'object', properties: { checkIn: { type: 'string', description: 'Date YYYY-MM-DD' }, checkOut: { type: 'string', description: 'Date YYYY-MM-DD' }, guests: { type: 'integer', minimum: 1, maximum: 8 } }, required: ['checkIn', 'checkOut', 'guests'] },
  },
  {
    type: 'function', name: 'get_hotel_information', description: 'Donne une information vérifiée sur les horaires, options ou politiques de l’hôtel.',
    parameters: { type: 'object', properties: { topic: { type: 'string', enum: ['options', 'hours', 'parking', 'breakfast', 'pets', 'cancellation', 'address'] } }, required: ['topic'] },
  },
  {
    type: 'function', name: 'create_reservation_request', description: 'Crée une demande à confirmer par la réception après récapitulatif et accord explicite du client.',
    parameters: { type: 'object', properties: { guestName: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, checkIn: { type: 'string' }, checkOut: { type: 'string' }, guests: { type: 'integer' }, roomTypeId: { type: 'string' }, options: { type: 'array', items: { type: 'string' } } }, required: ['guestName', 'email', 'checkIn', 'checkOut', 'guests', 'roomTypeId'] },
  },
  {
    type: 'function', name: 'transfer_to_reception', description: 'Demande immédiatement un transfert vers un humain.',
    parameters: { type: 'object', properties: { reason: { type: 'string' }, language: { type: 'string' } }, required: ['reason'] },
  },
]

export async function executeTool(name, args = {}, context = {}) {
  if (name === 'check_availability') return demoPms.getAvailability(args)
  if (name === 'get_hotel_information') {
    const data = {
      options: hotel.options,
      hours: { reception: hotel.receptionHours, checkIn: hotel.checkIn, checkOut: hotel.checkOut },
      parking: hotel.options.find((option) => option.id === 'parking'),
      breakfast: hotel.options.find((option) => option.id === 'breakfast'),
      pets: hotel.policies.pets,
      cancellation: hotel.policies.cancellation,
      address: hotel.address,
    }
    return { topic: args.topic, information: data[args.topic] }
  }
  if (name === 'create_reservation_request') {
    if (!args.guestName?.trim()) throw new Error('Le nom du client est obligatoire.')
    if (!emailPattern.test(args.email || '')) throw new Error('Adresse e-mail invalide.')
    const availability = await demoPms.getAvailability(args)
    const room = availability.rooms.find((item) => item.roomTypeId === args.roomTypeId)
    if (!room) throw new Error('Cette chambre n’est plus disponible. Une nouvelle proposition est nécessaire.')
    const request = createReservationRequest({ ...args, quotedPrice: room.totalStay, currency: room.currency, callId: context.callId, pmsStatus: 'pending_reception' })
    return { success: true, requestId: request.id, status: request.status, message: 'Demande transmise à la réception. Elle n’est pas encore une réservation confirmée.' }
  }
  if (name === 'transfer_to_reception') {
    const handoff = createHandoff({ callId: context.callId, callSid: context.callSid, reason: args.reason, language: args.language || 'fr' })
    return { success: true, handoffId: handoff.id, message: 'Transfert demandé vers la réception.' }
  }
  throw new Error(`Outil inconnu : ${name}`)
}
