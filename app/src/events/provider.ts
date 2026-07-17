import type { CityEvent } from './types'

export interface EventSearchRequest {
  latitude: number
  longitude: number
  radiusKm: number
  from: string
  to: string
}

export interface EventProviderStatus {
  name: 'Ticketmaster' | 'PredictHQ' | 'OpenAgenda'
  configured: boolean
  status: 'connected' | 'missing_key' | 'error'
  count: number
  error?: string
}

export interface EventApiResponse {
  events: CityEvent[]
  providers: EventProviderStatus[]
  mode: 'live' | 'simulation'
  fetchedAt: string
  cached: boolean
}

/**
 * Point d’entrée du frontend vers l’agrégateur sécurisé.
 * Les clés OpenAgenda, Ticketmaster et PredictHQ restent sur le serveur.
 */
export async function fetchCityEvents(request: EventSearchRequest): Promise<EventApiResponse> {
  const query = new URLSearchParams({
    latitude: String(request.latitude),
    longitude: String(request.longitude),
    radiusKm: String(request.radiusKm),
    from: request.from,
    to: request.to,
  })
  const response = await fetch(`/api/events?${query}`)
  if (!response.ok) throw new Error('Les événements locaux ne sont pas disponibles pour le moment.')
  return await response.json() as EventApiResponse
}
