import test from 'node:test'
import assert from 'node:assert/strict'
import { resetStore, listReservationRequests } from './store.mjs'
import { executeTool } from './tools.mjs'

test('crée une demande et jamais une confirmation automatique', async () => {
  resetStore()
  const availability = await executeTool('check_availability', { checkIn: '2026-08-20', checkOut: '2026-08-22', guests: 2 })
  const result = await executeTool('create_reservation_request', {
    guestName: 'Marie Dupont', email: 'marie@example.com', checkIn: '2026-08-20', checkOut: '2026-08-22', guests: 2, roomTypeId: availability.rooms[0].roomTypeId,
  })
  assert.equal(result.success, true)
  assert.equal(result.status, 'pending_reception')
  assert.equal(listReservationRequests()[0].pmsStatus, 'pending_reception')
})

test('refuse une adresse e-mail invalide', async () => {
  await assert.rejects(() => executeTool('create_reservation_request', { guestName: 'Test', email: 'incorrect', checkIn: '2026-08-20', checkOut: '2026-08-22', guests: 2, roomTypeId: 'classic' }), /e-mail/)
})

test('enregistre une demande de transfert humain', async () => {
  const result = await executeTool('transfer_to_reception', { reason: 'Le client le demande', language: 'fr' }, { callId: 'CALL-1' })
  assert.equal(result.success, true)
  assert.match(result.message, /Transfert/)
})
