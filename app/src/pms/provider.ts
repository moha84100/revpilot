import type { DailyHotelData } from '../types'

export interface PmsProviderStatus {
  id: 'mews' | 'demo'
  name: string
  configured: boolean
  environment?: string
}

export interface PmsStatus {
  status: 'connected' | 'not_configured'
  activeProvider: string | null
  providers: PmsProviderStatus[]
  lastSync?: string
}

export interface PmsSyncResponse {
  provider: string
  providerName: string
  sourceName: string
  rows: DailyHotelData[]
  recordCount: number
  roomCount: number
  syncedAt: string
  warnings: string[]
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'Le serveur PMS ne répond pas.')
  return body as T
}

export async function fetchPmsStatus(): Promise<PmsStatus> {
  return readJson(await fetch('/api/pms/status'))
}

export async function syncPms(provider: 'mews' | 'demo', days = 90): Promise<PmsSyncResponse> {
  return readJson(await fetch('/api/pms/sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ provider, days }),
  }))
}
