import test from 'node:test'
import assert from 'node:assert/strict'
import { demoPms } from './demo-pms.mjs'

test('retourne des chambres et un prix pour un séjour valide', async () => {
  const result = await demoPms.getAvailability({ checkIn: '2026-08-20', checkOut: '2026-08-22', guests: 2 })
  assert.equal(result.nights, 2)
  assert.ok(result.rooms.length > 0)
  assert.ok(result.rooms.every((room) => room.totalStay === room.nightlyRate * 2))
})

test('refuse une date de départ antérieure', async () => {
  await assert.rejects(() => demoPms.getAvailability({ checkIn: '2026-08-22', checkOut: '2026-08-20', guests: 2 }), /départ/)
})

test('ne propose que les chambres compatibles avec le nombre de voyageurs', async () => {
  const result = await demoPms.getAvailability({ checkIn: '2026-09-10', checkOut: '2026-09-12', guests: 4 })
  assert.ok(result.rooms.every((room) => room.capacity >= 4))
})
