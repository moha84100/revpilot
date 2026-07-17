import assert from 'node:assert/strict'
import test from 'node:test'
import { audioToBuffer, parseFfmpegDuration, sceneFileName, speechRate, validateVoiceEnv } from './audio-utils.mjs'

test('refuse une configuration incomplète sans exposer de secret', () => {
  assert.throws(() => validateVoiceEnv({ ELEVENLABS_API_KEY: 'secret-test' }), /ELEVENLABS_VOICE_ID/)
  try { validateVoiceEnv({ ELEVENLABS_API_KEY: '', ELEVENLABS_VOICE_ID: '' }) } catch (error) {
    assert.doesNotMatch(error.message, /secret-test/)
  }
})

test('construit un nom de piste stable', () => {
  assert.equal(sceneFileName({ id: 'Human decision' }, 3), '04-human-decision.mp3')
})

test('rejette une réponse audio vide', async () => {
  await assert.rejects(audioToBuffer(new Uint8Array()), /vide/)
})

test('calcule le débit et lit une durée FFmpeg', () => {
  assert.equal(speechRate(25, 10), 150)
  assert.equal(parseFfmpegDuration('Duration: 00:01:09.25, start: 0.0'), 69.25)
})
