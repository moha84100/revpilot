import { brevoStatus, digits, sendEmail, sendSms, sendWhatsapp } from './brevo.mjs'

const sentKeys = new Map()
const deliveryLog = []
const DEDUPE_MS = 30 * 60_000

function cleanText(value, max = 700) {
  return String(value || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''))
}

function validPhone(value) {
  return /^\d{6,15}$/.test(digits(value))
}

function parisHour(now = new Date()) {
  const value = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(now)
  return Number(value.replace(/\D/g, ''))
}

export function notificationStatus() {
  return { ...brevoStatus(), recentDeliveries: deliveryLog.slice(-12).reverse() }
}

export function isQuietTime(now = new Date()) {
  const hour = parisHour(now)
  return hour >= 22 || hour < 7
}

function messageContent(notification) {
  const title = cleanText(notification.title, 120) || 'Alerte RevPilot'
  const message = cleanText(notification.message, 650) || 'Une nouvelle alerte demande votre attention.'
  const date = /^\d{4}-\d{2}-\d{2}$/.test(notification.date || '') ? notification.date : new Date().toISOString().slice(0, 10)
  const text = `RevPilot — ${title}\nDate : ${date}\n${message}`
  const html = `<div style="font-family:Arial,sans-serif;max-width:620px"><h2 style="color:#17315f">${title}</h2><p><strong>Date concernée :</strong> ${date}</p><p>${message}</p><p style="color:#69758a;font-size:12px">Alerte envoyée automatiquement par RevPilot.</p></div>`
  return { title, message, date, text, html }
}

function masked(channel, to) {
  if (channel === 'email') {
    const [name, domain] = String(to).split('@')
    return `${name?.slice(0, 2) || '**'}***@${domain || '***'}`
  }
  const value = digits(to)
  return `***${value.slice(-4)}`
}

export async function deliver({ channel, to, notification, quietHours = true, force = false }, dependencies = {}) {
  if (!['email', 'sms', 'whatsapp'].includes(channel)) throw new Error('Canal de notification invalide.')
  if (channel === 'email' ? !validEmail(to) : !validPhone(to)) throw new Error('Destinataire invalide pour ce canal.')
  const content = messageContent(notification || {})
  const urgent = notification?.level === 'critical'
  if (!force && quietHours && !urgent && isQuietTime(dependencies.now?.() || new Date())) {
    return { channel, status: 'deferred', reason: 'Plage silencieuse 22 h–7 h.' }
  }
  const key = `${channel}:${String(to).toLowerCase()}:${content.date}:${content.title}`
  const previous = sentKeys.get(key)
  if (!force && previous && Date.now() - previous < DEDUPE_MS) {
    return { channel, status: 'duplicate', reason: 'Alerte identique déjà envoyée récemment.' }
  }
  const senders = {
    email: () => sendEmail({ to, subject: `[RevPilot] ${content.title}`, text: content.text, html: content.html }, dependencies.fetch),
    sms: () => sendSms({ to, text: content.text }, dependencies.fetch),
    whatsapp: () => sendWhatsapp({ to }, dependencies.fetch),
  }
  const result = await senders[channel]()
  sentKeys.set(key, Date.now())
  const logEntry = { id: result.id || '', channel, status: result.status, recipient: masked(channel, to), sentAt: new Date().toISOString(), title: content.title }
  deliveryLog.push(logEntry)
  if (deliveryLog.length > 100) deliveryLog.splice(0, deliveryLog.length - 100)
  return logEntry
}

export async function deliverMany({ channels, recipients, notification, quietHours = true, force = false }) {
  const results = await Promise.allSettled(channels.map((channel) => deliver({
    channel,
    to: channel === 'email' ? recipients.email : channel === 'whatsapp' ? recipients.whatsapp : recipients.sms,
    notification,
    quietHours,
    force,
  })))
  return results.map((result, index) => result.status === 'fulfilled'
    ? result.value
    : { channel: channels[index], status: 'failed', reason: result.reason instanceof Error ? result.reason.message : 'Échec inconnu.' })
}
