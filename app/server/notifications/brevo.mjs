const API_BASE = 'https://api.brevo.com/v3'

function configFromEnv() {
  return {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || '',
    senderName: process.env.BREVO_SENDER_NAME || 'RevPilot',
    smsSender: process.env.BREVO_SMS_SENDER || 'RevPilot',
    whatsappSenderNumber: digits(process.env.BREVO_WHATSAPP_SENDER_NUMBER || ''),
    whatsappTemplateId: Number(process.env.BREVO_WHATSAPP_TEMPLATE_ID || 0),
  }
}

export function digits(value = '') {
  return String(value).replace(/\D/g, '')
}

export function brevoStatus() {
  const config = configFromEnv()
  return {
    provider: 'brevo',
    providerName: 'Brevo',
    channels: {
      email: {
        configured: Boolean(config.apiKey && config.senderEmail),
        detail: config.senderEmail ? `Expéditeur : ${config.senderEmail}` : 'Expéditeur manquant',
      },
      sms: {
        configured: Boolean(config.apiKey && config.smsSender),
        detail: config.smsSender ? `Expéditeur : ${config.smsSender}` : 'Expéditeur manquant',
      },
      whatsapp: {
        configured: Boolean(config.apiKey && config.whatsappSenderNumber && config.whatsappTemplateId),
        detail: config.whatsappSenderNumber && config.whatsappTemplateId
          ? `Numéro WhatsApp terminé par ${config.whatsappSenderNumber.slice(-4)} · modèle ${config.whatsappTemplateId}`
          : 'Numéro ou modèle WhatsApp manquant',
      },
    },
  }
}

async function brevoRequest(path, body, fetchImpl = fetch) {
  const config = configFromEnv()
  if (!config.apiKey) throw new Error('La clé API Brevo n’est pas configurée.')
  const response = await fetchImpl(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { accept: 'application/json', 'api-key': config.apiKey, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload.message || payload.error || `HTTP ${response.status}`
    throw new Error(`Brevo a refusé l’envoi : ${message}`)
  }
  return payload
}

export async function sendEmail({ to, subject, text, html }, fetchImpl) {
  const config = configFromEnv()
  if (!config.senderEmail) throw new Error('L’adresse d’expédition Brevo est absente.')
  const payload = await brevoRequest('/smtp/email', {
    sender: { email: config.senderEmail, name: config.senderName },
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html,
    tags: ['revpilot-alert'],
  }, fetchImpl)
  return { id: payload.messageId || payload.messageIds?.[0], status: 'queued' }
}

export async function sendSms({ to, text }, fetchImpl) {
  const config = configFromEnv()
  if (!config.smsSender) throw new Error('Le nom d’expéditeur SMS Brevo est absent.')
  const payload = await brevoRequest('/transactionalSMS/send', {
    sender: config.smsSender.slice(0, 11),
    recipient: digits(to),
    content: text.slice(0, 480),
    type: 'transactional',
    unicodeEnabled: true,
    tag: 'revpilot-alert',
  }, fetchImpl)
  return { id: String(payload.messageId || ''), status: 'queued' }
}

export async function sendWhatsapp({ to }, fetchImpl) {
  const config = configFromEnv()
  if (!config.whatsappSenderNumber || !config.whatsappTemplateId) {
    throw new Error('Le numéro d’envoi ou le modèle WhatsApp Brevo est absent.')
  }
  const payload = await brevoRequest('/whatsapp/sendMessage', {
    senderNumber: config.whatsappSenderNumber,
    contactNumbers: [digits(to)],
    templateId: config.whatsappTemplateId,
  }, fetchImpl)
  return { id: payload.messageId, status: 'queued' }
}
