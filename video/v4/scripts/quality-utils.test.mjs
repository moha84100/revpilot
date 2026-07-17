import assert from 'node:assert/strict'
import test from 'node:test'
import { transitionQuality } from './quality-utils.mjs'

test('détecte les silences et écrans noirs dépassant les limites', () => {
  const result = transitionQuality('silence_duration: 1.24\nsilence_duration: 0.42', 'black_duration:0.18\nblack_duration:0.05')
  assert.deepEqual(result.silences, [1.24])
  assert.deepEqual(result.blackFrames, [0.18])
})

test('accepte un montage sans transition vide', () => {
  assert.deepEqual(transitionQuality('', ''), { silences: [], blackFrames: [] })
})
