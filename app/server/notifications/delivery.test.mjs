import assert from 'node:assert/strict'
import test from 'node:test'
import { deliver, isQuietTime } from './delivery.mjs'

const notification = { date: '2026-07-20', level: 'critical', title: 'Surbooking', message: 'Deux chambres au-delà de la capacité.' }

test('détecte la plage silencieuse à Paris', () => {
  assert.equal(isQuietTime(new Date('2026-07-20T21:30:00Z')), true)
  assert.equal(isQuietTime(new Date('2026-07-20T10:00:00Z')), false)
})

test('envoie un email Brevo sans exposer le destinataire dans le journal', async () => {
  process.env.BREVO_API_KEY = 'test-key'
  process.env.BREVO_SENDER_EMAIL = 'alertes@example.com'
  const fetchMock = async (_url, options) => {
    const body = JSON.parse(options.body)
    assert.equal(body.to[0].email, 'direction@hotel.fr')
    return { ok: true, json: async () => ({ messageId: 'email-1' }) }
  }
  const result = await deliver({ channel: 'email', to: 'direction@hotel.fr', notification, force: true }, { fetch: fetchMock })
  assert.equal(result.status, 'queued')
  assert.equal(result.recipient.includes('direction'), false)
})

test('refuse un numéro invalide', async () => {
  await assert.rejects(() => deliver({ channel: 'sms', to: '123', notification, force: true }), /Destinataire invalide/)
})
