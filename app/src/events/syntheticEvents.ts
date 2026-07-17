import type { CityEvent } from './types'

export const syntheticCityEvents: CityEvent[] = [
  {
    id: 'evt-2026-concert-stade', name: 'Grand concert au Théâtre antique', category: 'concert',
    startDate: '2026-07-24', endDate: '2026-07-25', venue: 'Théâtre antique d’Orange', city: 'Orange',
    distanceKm: 0.8, expectedAttendance: 8_600, impactScore: 92, source: 'Ticketmaster',
  },
  {
    id: 'evt-2026-choregies', name: 'Les Chorégies d’Orange', category: 'culture',
    startDate: '2026-07-19', endDate: '2026-07-21', venue: 'Théâtre antique d’Orange', city: 'Orange',
    distanceKm: 0.8, expectedAttendance: 7_900, impactScore: 88, source: 'OpenAgenda', recurringKey: 'choregies-orange',
  },
  {
    id: 'evt-2025-choregies', name: 'Les Chorégies d’Orange', category: 'culture',
    startDate: '2025-07-19', endDate: '2025-07-21', venue: 'Théâtre antique d’Orange', city: 'Orange',
    distanceKm: 0.8, expectedAttendance: 7_600, impactScore: 86, source: 'OpenAgenda', recurringKey: 'choregies-orange',
  },
  {
    id: 'evt-2025-festival-ete', name: 'Festival d’été exceptionnel', category: 'festival',
    startDate: '2025-08-14', endDate: '2025-08-17', venue: 'Centre-ville', city: 'Orange',
    distanceKm: 0.5, expectedAttendance: 11_500, impactScore: 95, source: 'Office de tourisme',
  },
  {
    id: 'evt-2026-congres', name: 'Congrès régional des entreprises', category: 'conference',
    startDate: '2026-10-02', endDate: '2026-10-04', venue: 'Parc des expositions', city: 'Avignon',
    distanceKm: 27, expectedAttendance: 3_400, impactScore: 61, source: 'PredictHQ',
  },
  {
    id: 'evt-2026-sport', name: 'Finales régionales de basketball', category: 'sport',
    startDate: '2026-08-29', endDate: '2026-08-30', venue: 'Complexe sportif', city: 'Orange',
    distanceKm: 2.1, expectedAttendance: 2_200, impactScore: 56, source: 'OpenAgenda',
  },
  {
    id: 'evt-2025-salon', name: 'Salon professionnel viticole', category: 'fair',
    startDate: '2025-09-07', endDate: '2025-09-10', venue: 'Parc des expositions', city: 'Avignon',
    distanceKm: 27, expectedAttendance: 5_800, impactScore: 72, source: 'PredictHQ',
  },
  {
    id: 'evt-2026-marche-noel', name: 'Marché de Noël et illuminations', category: 'culture',
    startDate: '2026-12-05', endDate: '2026-12-20', venue: 'Centre-ville', city: 'Orange',
    distanceKm: 0.4, expectedAttendance: 1_600, impactScore: 38, source: 'OpenAgenda', recurringKey: 'marche-noel-orange',
  },
  {
    id: 'evt-2025-marche-noel', name: 'Marché de Noël et illuminations', category: 'culture',
    startDate: '2025-12-06', endDate: '2025-12-21', venue: 'Centre-ville', city: 'Orange',
    distanceKm: 0.4, expectedAttendance: 1_500, impactScore: 36, source: 'OpenAgenda', recurringKey: 'marche-noel-orange',
  },
]

export function strongestEventOn(date: string) {
  return syntheticCityEvents
    .filter((event) => event.startDate <= date && event.endDate >= date)
    .sort((a, b) => b.impactScore - a.impactScore)[0]
}
