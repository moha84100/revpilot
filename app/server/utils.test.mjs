import test from 'node:test'
import assert from 'node:assert/strict'
import { deduplicateEvents, distanceKm, impactScore } from './utils.mjs'

test('calcule une distance géographique plausible', () => {
  const orangeToAvignon = distanceKm(44.1363, 4.8075, 43.9493, 4.8055)
  assert.ok(orangeToAvignon > 19 && orangeToAvignon < 23)
})

test('donne plus d’impact aux événements proches et fréquentés', () => {
  const localConcert = impactScore({ attendance: 8_000, rank: 80, distance: 1, category: 'concert' })
  const distantExhibition = impactScore({ attendance: 300, rank: 20, distance: 30, category: 'culture' })
  assert.ok(localConcert > distantExhibition)
  assert.ok(localConcert <= 100)
})

test('dédoublonne un événement présent chez plusieurs fournisseurs', () => {
  const common = { name: 'Concert Orange', category: 'concert', startDate: '2026-07-24', endDate: '2026-07-24', venue: 'Théâtre', city: 'Orange', distanceKm: 1 }
  const result = deduplicateEvents([
    { ...common, id: 'tm:1', expectedAttendance: 0, impactScore: 60, source: 'Ticketmaster' },
    { ...common, id: 'phq:1', expectedAttendance: 8_000, impactScore: 92, source: 'PredictHQ' },
  ])
  assert.equal(result.length, 1)
  assert.equal(result[0].source, 'PredictHQ')
})
