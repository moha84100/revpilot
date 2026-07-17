import { randomUUID } from 'node:crypto'

const calls = []
const reservationRequests = []
const handoffs = []

export function startCall({ channel = 'browser', language = 'fr', caller = 'Numéro masqué' } = {}) {
  const call = { id: randomUUID(), channel, language, caller, status: 'in_progress', startedAt: new Date().toISOString(), endedAt: null, messages: [] }
  calls.unshift(call)
  return call
}

export function addCallMessage(callId, role, text) {
  const call = calls.find((item) => item.id === callId)
  if (!call) return null
  call.messages.push({ role, text, at: new Date().toISOString() })
  return call
}

export function endCall(callId, outcome = 'completed') {
  const call = calls.find((item) => item.id === callId)
  if (!call) return null
  call.status = outcome
  call.endedAt = new Date().toISOString()
  return call
}

export function createReservationRequest(payload) {
  const request = {
    id: `RR-${String(reservationRequests.length + 1).padStart(5, '0')}`,
    status: 'pending_reception',
    source: payload.source || 'voice-agent',
    createdAt: new Date().toISOString(),
    ...payload,
  }
  reservationRequests.unshift(request)
  return request
}

export function createHandoff(payload) {
  const handoff = { id: randomUUID(), status: 'requested', createdAt: new Date().toISOString(), ...payload }
  handoffs.unshift(handoff)
  return handoff
}

export const listCalls = () => calls.slice(0, 50)
export const listReservationRequests = () => reservationRequests.slice(0, 100)
export const listHandoffs = () => handoffs.slice(0, 50)

export function resetStore() {
  calls.length = 0
  reservationRequests.length = 0
  handoffs.length = 0
}
