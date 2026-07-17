import type { RevNotification } from '../lib/workflow'

export type ExternalChannel = 'email' | 'sms' | 'whatsapp'

export interface NotificationProviderStatus {
  provider: string
  providerName: string
  channels: Record<ExternalChannel, { configured: boolean; detail: string }>
  recentDeliveries: Array<{ id: string; channel: ExternalChannel; status: string; recipient: string; sentAt: string; title: string }>
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Le serveur de notifications ne répond pas.')
  return body as T
}

export async function fetchNotificationStatus(): Promise<NotificationProviderStatus> {
  return readJson(await fetch('/api/notifications/status'))
}

export async function sendTestNotification(channel: ExternalChannel, to: string) {
  return readJson<{ results: Array<{ channel: string; status: string; reason?: string }> }>(await fetch('/api/notifications/test', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ channel, to }),
  }))
}

export async function sendExternalNotification({ channels, recipients, notification, quietHours }: {
  channels: ExternalChannel[]
  recipients: { email: string; sms: string; whatsapp: string }
  notification: RevNotification
  quietHours: boolean
}) {
  return readJson<{ results: Array<{ channel: string; status: string; reason?: string }> }>(await fetch('/api/notifications/send', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ channels, recipients, notification, quietHours }),
  }))
}
