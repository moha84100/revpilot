import assert from 'node:assert/strict'
import test from 'node:test'
import { requiredTempo, tempoFilter } from './local-voice-utils.mjs'

test('ne ralentit pas une narration déjà assez courte', () => {
  assert.equal(requiredTempo(8, 9), 1)
})

test('calcule une légère accélération pour préserver la fin de phrase', () => {
  assert.equal(requiredTempo(10.5, 9.5), 1.1053)
  assert.equal(tempoFilter(1.1053), 'atempo=1.1053')
})

test('refuse un recalage qui dénaturerait la voix', () => {
  assert.throws(() => tempoFilter(2.1), /trop important/)
})
