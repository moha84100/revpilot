import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { validateTimeline } from './timeline-utils.mjs'

const timeline = JSON.parse(await readFile(new URL('../timeline.json', import.meta.url), 'utf8'))

test('la timeline commerciale respecte tous les garde-fous', () => {
  const result = validateTimeline(timeline)
  assert.deepEqual(result.errors, [])
  assert.equal(timeline.scenes.length, 7)
  assert.ok(result.totalDuration >= 60 && result.totalDuration <= 75)
})

test('le validateur refuse les effets et apparitions excessifs', () => {
  const broken = structuredClone(timeline)
  broken.scenes[0].character.duration = 4
  broken.scenes[1].zooms[0].scale = 1.5
  const result = validateTimeline(broken)
  assert.ok(result.errors.some((error) => error.includes('trois secondes')))
  assert.ok(result.errors.some((error) => error.includes('135')))
})
