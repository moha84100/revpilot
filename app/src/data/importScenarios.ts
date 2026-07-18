import type { DailyHotelData, Signal } from '../types'
import { dailyDataToCsv } from './syntheticReservations'

export const IMPORT_SCENARIO_REFERENCE_DATE = new Date('2026-07-18T12:00:00')

export interface ImportScenario {
  id: string
  title: string
  description: string
  filename: string
  horizon: 30 | 90
  expectedSignals: Partial<Record<Signal, number>>
  badges: string[]
}

export const importScenarios: ImportScenario[] = [
  { id: 'strong-demand', title: 'Forte demande', description: 'Occupation et rythme élevés : RevPilot doit proposer plusieurs hausses.', filename: '01-forte-demande.csv', horizon: 30, expectedSignals: { increase: 18 }, badges: ['Hausses', 'Pickup élevé'] },
  { id: 'weak-demand', title: 'Demande faible', description: 'Un retard marqué à court terme doit faire ressortir les dates à corriger.', filename: '02-demande-faible.csv', horizon: 30, expectedSignals: { decrease: 18 }, badges: ['Baisses', 'Retard N−1'] },
  { id: 'major-event', title: 'Événement majeur', description: 'Un événement sans équivalent l’an dernier doit soutenir une hausse expliquée.', filename: '03-evenement-majeur.csv', horizon: 30, expectedSignals: { increase: 18 }, badges: ['Événement', 'Hausse expliquée'] },
  { id: 'missing-last-year-event', title: 'Événement N−1 absent', description: 'La demande de l’an dernier était portée par un événement aujourd’hui absent.', filename: '04-evenement-n1-absent.csv', horizon: 30, expectedSignals: { decrease: 18 }, badges: ['Comparaison N−1', 'Baisse'] },
  { id: 'overbooking', title: 'Surbooking', description: 'Les ventes dépassent la capacité et imposent une action opérationnelle immédiate.', filename: '05-surbooking.csv', horizon: 30, expectedSignals: { overbook: 18 }, badges: ['Critique', 'Fermer les ventes'] },
  { id: 'cancellations', title: 'Annulations élevées', description: 'Une occupation fragile et des annulations récentes nécessitent plus de visibilité.', filename: '06-annulations-elevees.csv', horizon: 30, expectedSignals: { boost: 18 }, badges: ['À stimuler', 'Annulations'] },
  { id: 'stable', title: 'Activité stable', description: 'Un rythme sain doit confirmer que maintenir le tarif est aussi une décision.', filename: '07-activite-stable.csv', horizon: 30, expectedSignals: { maintain: 18 }, badges: ['Maintien', 'Rythme normal'] },
  { id: 'mixed', title: 'Portefeuille mixte — 90 jours', description: 'Un jeu complet pour comparer toutes les recommandations dans la même analyse.', filename: '08-portefeuille-mixte-90-jours.csv', horizon: 90, expectedSignals: { overbook: 1, increase: 1, decrease: 1, boost: 1, maintain: 1 }, badges: ['Tous les signaux', '90 jours'] },
]

const isoAfterReference = (offset: number) => {
  const date = new Date(IMPORT_SCENARIO_REFERENCE_DATE)
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

function row(offset: number, overrides: Partial<DailyHotelData> = {}): DailyHotelData {
  const base: DailyHotelData = {
    date: isoAfterReference(offset),
    roomsAvailable: 48,
    roomsSold: 29,
    revenue: 3_480,
    pickup7d: 2,
    lastYearRoomsSold: 28,
    currentPrice: 120,
    cancellations7d: 1,
    groupRooms: 2,
    directRooms: 11,
    commissionCost: 310,
    competitorPrice: 118,
    eventAttendance: 0,
    eventImpact: 0,
    lastYearEventAttendance: 0,
    lastYearEventImpact: 0,
  }
  const merged = { ...base, ...overrides }
  if (overrides.revenue === undefined) merged.revenue = merged.roomsSold * merged.currentPrice
  return merged
}

const range = (length: number, create: (offset: number) => DailyHotelData) => Array.from({ length }, (_, index) => create(index + 1))

function strongDemand() {
  return range(21, (offset) => row(offset, {
    roomsSold: 43 + offset % 5,
    pickup7d: 7 + offset % 4,
    lastYearRoomsSold: 33 + offset % 4,
    currentPrice: 138 + offset % 7,
    competitorPrice: 132,
    groupRooms: 5 + offset % 3,
  }))
}

function weakDemand() {
  return range(21, (offset) => row(offset, {
    roomsSold: 14 + offset % 6,
    pickup7d: offset % 2,
    lastYearRoomsSold: 27 + offset % 4,
    currentPrice: 132,
    competitorPrice: 112,
  }))
}

function majorEvent() {
  return range(21, (offset) => row(offset, {
    roomsSold: 30 + offset % 5,
    pickup7d: 4 + offset % 3,
    lastYearRoomsSold: 29 + offset % 3,
    currentPrice: 142,
    competitorPrice: 139,
    eventName: 'Festival international des arts',
    eventCategory: 'Festival',
    eventAttendance: 12_500,
    eventImpact: 92,
    eventSource: 'CSV',
  }))
}

function missingLastYearEvent() {
  return range(21, (offset) => row(offset, {
    roomsSold: 22 + offset % 4,
    pickup7d: 2,
    lastYearRoomsSold: 37 + offset % 5,
    currentPrice: 136,
    competitorPrice: 112,
    lastYearEventName: 'Congrès national N−1',
    lastYearEventAttendance: 9_800,
    lastYearEventImpact: 91,
  }))
}

function overbooking() {
  return range(21, (offset) => row(offset, {
    roomsSold: 50 + offset % 5,
    pickup7d: 8 + offset % 4,
    lastYearRoomsSold: 41,
    currentPrice: 156,
    competitorPrice: 148,
    groupRooms: 9,
  }))
}

function cancellations() {
  return range(21, (offset) => row(offset, {
    roomsSold: 17 + offset % 4,
    pickup7d: 2,
    lastYearRoomsSold: 18 + offset % 4,
    currentPrice: 116,
    competitorPrice: 108,
    cancellations7d: 5 + offset % 4,
  }))
}

function stableActivity() {
  return range(21, (offset) => row(offset, {
    roomsSold: 28 + offset % 3,
    pickup7d: 2 + offset % 2,
    lastYearRoomsSold: 27 + offset % 3,
    currentPrice: 121 + offset % 4,
    competitorPrice: 120,
  }))
}

function mixedPortfolio() {
  return range(90, (offset) => {
    if (offset <= 10) return strongDemand()[offset - 1]
    if (offset <= 20) return row(offset, { roomsSold: 50 + offset % 4, pickup7d: 9, lastYearRoomsSold: 39, currentPrice: 158 })
    if (offset <= 35) return row(offset, { roomsSold: 23, pickup7d: 2, lastYearRoomsSold: 38, lastYearEventName: 'Salon professionnel N−1', lastYearEventAttendance: 7_500, lastYearEventImpact: 88 })
    if (offset <= 50) return row(offset, { roomsSold: 18, pickup7d: 2, lastYearRoomsSold: 19, cancellations7d: 6 })
    if (offset <= 65) return row(offset, { roomsSold: 31, pickup7d: 4, lastYearRoomsSold: 29, eventName: 'Semaine culturelle', eventAttendance: 6_400, eventImpact: 84, eventSource: 'CSV' })
    return row(offset, { roomsSold: 29, pickup7d: 2, lastYearRoomsSold: 28 })
  })
}

export function rowsForScenario(id: string): DailyHotelData[] {
  switch (id) {
    case 'strong-demand': return strongDemand()
    case 'weak-demand': return weakDemand()
    case 'major-event': return majorEvent()
    case 'missing-last-year-event': return missingLastYearEvent()
    case 'overbooking': return overbooking()
    case 'cancellations': return cancellations()
    case 'stable': return stableActivity()
    case 'mixed': return mixedPortfolio()
    default: throw new Error(`Scénario inconnu : ${id}`)
  }
}

export const csvForScenario = (scenario: ImportScenario) => dailyDataToCsv(rowsForScenario(scenario.id))
