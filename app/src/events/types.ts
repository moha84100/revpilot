export type EventCategory = 'concert' | 'festival' | 'sport' | 'conference' | 'culture' | 'fair'
export type EventSource = 'OpenAgenda' | 'Ticketmaster' | 'PredictHQ' | 'Office de tourisme' | 'Manuel'

export interface CityEvent {
  id: string
  name: string
  category: EventCategory
  startDate: string
  endDate: string
  venue: string
  city: string
  distanceKm: number
  expectedAttendance: number
  impactScore: number
  source: EventSource
  recurringKey?: string
}
