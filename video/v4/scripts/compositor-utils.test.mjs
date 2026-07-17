import assert from 'node:assert/strict'
import test from 'node:test'
import { zoomFilter } from './compositor-utils.mjs'

test('construit un zoom centré et limité depuis les coordonnées Playwright', () => {
  const filter = zoomFilter({ duration: 10, zooms: [{ at: 2, duration: 4, scale: 1.25, target: 'kpi' }] }, { kpi: { x: 1400, y: 160, width: 300, height: 140 } })
  assert.match(filter, /1\+0\.25/)
  assert.match(filter, /1550/)
  assert.match(filter, /230/)
})
