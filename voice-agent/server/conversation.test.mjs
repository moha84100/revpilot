import test from 'node:test'
import assert from 'node:assert/strict'
import { beginDemoCall, resetDemoSessions, respondToDemoCall } from './conversation.mjs'
import { resetStore } from './store.mjs'

test('mène un parcours de disponibilité jusqu’à la demande', async () => {
  resetStore()
  resetDemoSessions()
  const call = beginDemoCall()
  const availability = await respondToDemoCall(call.sessionId, 'Une chambre du 20/08/2026 au 22/08/2026 pour 2 personnes')
  assert.equal(availability.action.tool, 'check_availability')
  assert.match(availability.message, /euros/)
  const confirmation = await respondToDemoCall(call.sessionId, 'Oui, je veux réserver')
  assert.match(confirmation.message, /nom/)
  await respondToDemoCall(call.sessionId, 'Marie Dupont')
  const result = await respondToDemoCall(call.sessionId, 'marie@example.com')
  assert.equal(result.action.tool, 'create_reservation_request')
  assert.match(result.message, /réception/)
})

test('transfère vers un humain à la demande', async () => {
  resetDemoSessions()
  const call = beginDemoCall()
  const result = await respondToDemoCall(call.sessionId, 'Je veux parler à la réception')
  assert.equal(result.action.tool, 'transfer_to_reception')
})

test('reformule au lieu de répéter quand le client ne comprend pas', async () => {
  resetDemoSessions()
  const call = beginDemoCall()
  const proposal = await respondToDemoCall(call.sessionId, 'Une chambre du 20/08/2026 au 22/08/2026 pour 2 personnes')
  const explanation = await respondToDemoCall(call.sessionId, 'Je n’ai pas compris, expliquez-moi')
  assert.notEqual(explanation.message, proposal.message)
  assert.match(explanation.message, /reformule|total/i)
})

test('explique pourquoi il demande un e-mail puis reprend au bon endroit', async () => {
  resetDemoSessions()
  const call = beginDemoCall()
  await respondToDemoCall(call.sessionId, 'Une chambre du 20/08/2026 au 22/08/2026 pour 2 personnes')
  await respondToDemoCall(call.sessionId, 'Oui je veux réserver')
  await respondToDemoCall(call.sessionId, 'Marie Dupont')
  const explanation = await respondToDemoCall(call.sessionId, 'Pourquoi vous demandez ça ? Je ne comprends pas')
  assert.match(explanation.message, /recevoir la réponse/)
  const result = await respondToDemoCall(call.sessionId, 'marie@example.com')
  assert.equal(result.action.tool, 'create_reservation_request')
})
