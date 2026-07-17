import assert from 'node:assert/strict'
import test from 'node:test'
import { demoPmsData, reservationsToDailyData } from './normalize.mjs'

test('agrège une réservation Mews sur chaque nuit occupée', () => {
  const rows = reservationsToDailyData({
    reservations: [{
      ScheduledStartUtc: '2026-07-17T14:00:00Z',
      ScheduledEndUtc: '2026-07-19T10:00:00Z',
      CreatedUtc: '2026-07-15T10:00:00Z',
    }],
    start: new Date('2026-07-17T00:00:00Z'),
    days: 3,
    roomCount: 20,
    defaultRoomRate: 100,
    syncedAt: new Date('2026-07-17T12:00:00Z'),
  })
  assert.deepEqual(rows.map((row) => row.roomsSold), [1, 1, 0])
  assert.equal(rows[0].pickup7d, 1)
  assert.equal(rows[0].revenue, 100)
})

test('le PMS de démonstration produit des données importables', () => {
  const payload = demoPmsData({ start: new Date('2026-07-17T00:00:00Z'), days: 30 })
  assert.equal(payload.rows.length, 30)
  assert.ok(payload.recordCount > 0)
  assert.ok(payload.rows.every((row) => row.roomsAvailable > 0))
})
