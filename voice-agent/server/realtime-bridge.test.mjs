import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { validateTwilioSignature } from './realtime-bridge.mjs'

test('valide une signature Twilio correcte', () => {
  const previous = process.env.TWILIO_AUTH_TOKEN
  process.env.TWILIO_AUTH_TOKEN = 'secret-test'
  const url = 'https://example.com/twilio/voice'
  const params = { CallSid: 'CA123', From: '+33600000000' }
  const payload = url + Object.keys(params).sort().map((key) => `${key}${params[key]}`).join('')
  const signature = createHmac('sha1', 'secret-test').update(payload).digest('base64')
  assert.equal(validateTwilioSignature(signature, url, params), true)
  assert.equal(validateTwilioSignature('signature-invalide', url, params), false)
  if (previous === undefined) delete process.env.TWILIO_AUTH_TOKEN
  else process.env.TWILIO_AUTH_TOKEN = previous
})
