import type { AnalyzedDate } from '../types'

export type InterfaceMode = 'simple' | 'advanced'
export type DecisionStatus = 'accepted' | 'adjusted' | 'ignored'

export interface PricingDecision {
  date: string
  status: DecisionStatus
  signalLabel: string
  recommendation: string
  previousPrice: number
  decidedPrice: number
  note: string
  decidedAt: string
}

export interface NotificationPreferences {
  inApp: boolean
  email: boolean
  emailAddress: string
  sms: boolean
  phoneNumber: string
  whatsapp: boolean
  whatsappNumber: string
  browser: boolean
  overbooking: boolean
  priceChanges: boolean
  cityEvents: boolean
  cancellations: boolean
  dailyDigest: boolean
  quietHours: boolean
}

export interface RevNotification {
  id: string
  date: string
  level: 'critical' | 'warning' | 'info'
  title: string
  message: string
}

export const defaultNotificationPreferences: NotificationPreferences = {
  inApp: true,
  email: false,
  emailAddress: 'direction@grandhotel.fr',
  sms: false,
  phoneNumber: '+33 6 00 00 00 00',
  whatsapp: false,
  whatsappNumber: '+33 6 00 00 00 00',
  browser: false,
  overbooking: true,
  priceChanges: true,
  cityEvents: true,
  cancellations: true,
  dailyDigest: true,
  quietHours: true,
}

export function notificationsFromRows(rows: AnalyzedDate[]): RevNotification[] {
  return rows.filter((row) => row.signal !== 'maintain').slice(0, 16).map((row) => ({
    id: `${row.date}-${row.signal}`,
    date: row.date,
    level: row.signal === 'overbook' ? 'critical' : row.signal === 'decrease' ? 'warning' : 'info',
    title: row.signal === 'overbook' ? `Risque de surbooking : ${row.overbookedRooms} chambre(s)` : row.signalLabel,
    message: `${row.recommendation} · ${row.reason}`,
  }))
}

export function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}
