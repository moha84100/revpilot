import assert from 'node:assert/strict'
import test from 'node:test'
import { compactTimeline } from './compact-timeline-utils.mjs'

test('compacte les scènes et recale leurs actions proportionnellement', () => {
  const timeline = {
    version: '4.0',
    scenes: [{ id: 'test', duration: 10, durationRange: [8, 11], actions: [{ at: 5, type: 'click' }], zooms: [], character: null }],
  }
  assert.throws(() => compactTimeline(timeline, [{ id: 'test', duration: 8 }]), /59 à 61/)

  const repeated = { ...timeline, scenes: Array.from({ length: 7 }, (_, index) => ({ ...timeline.scenes[0], id: `test-${index}` })) }
  const audio = repeated.scenes.map((scene) => ({ id: scene.id, duration: 7.85 }))
  const compact = compactTimeline(repeated, audio)
  assert.equal(compact.scenes[0].duration, 8.55)
  assert.equal(compact.scenes[0].actions[0].at, 4.28)
  assert.ok(compact.scenes.reduce((sum, scene) => sum + scene.duration, 0) >= 59)
})
