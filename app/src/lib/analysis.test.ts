import { describe, expect, it } from 'vitest'
import { analyzeData, summarize } from './analysis'
import type { DailyHotelData } from '../types'
import { createDemoData } from '../data/demoData'
import { createSyntheticHotelDataset } from '../data/syntheticReservations'

const referenceDate = new Date('2026-07-14T12:00:00')

const row = (overrides: Partial<DailyHotelData> = {}): DailyHotelData => ({
  date: '2026-07-20',
  roomsAvailable: 50,
  roomsSold: 30,
  revenue: 3000,
  pickup7d: 3,
  lastYearRoomsSold: 29,
  currentPrice: 100,
  cancellations7d: 0,
  groupRooms: 0,
  directRooms: 12,
  commissionCost: 300,
  competitorPrice: 98,
  eventAttendance: 0,
  eventImpact: 0,
  lastYearEventAttendance: 0,
  lastYearEventImpact: 0,
  ...overrides,
})

describe('moteur de recommandation', () => {
  it('recommande une hausse lorsque la demande et le pickup sont forts', () => {
    const [result] = analyzeData([row({ roomsSold: 46, pickup7d: 9, lastYearRoomsSold: 37 })], referenceDate)
    expect(result.signal).toBe('increase')
    expect(result.recommendedDelta).toBe(12)
    expect(result.reason).toContain('92 %')
  })

  it('signale une date proche dont l’occupation est faible', () => {
    const [result] = analyzeData([row({ roomsSold: 18, pickup7d: 1, lastYearRoomsSold: 27 })], referenceDate)
    expect(result.signal).toBe('decrease')
    expect(result.recommendation).toContain('baisse')
  })

  it('détecte le surbooking avant toute recommandation tarifaire', () => {
    const [result] = analyzeData([row({ roomsSold: 53, revenue: 6500, pickup7d: 10 })], referenceDate)
    expect(result.signal).toBe('overbook')
    expect(result.overbookedRooms).toBe(3)
    expect(result.recommendation).toContain('Fermer les ventes')
  })

  it('augmente le prix lorsqu’un événement majeur apparaît cette année', () => {
    const [result] = analyzeData([row({
      date: '2026-07-24',
      eventName: 'Grand concert',
      eventAttendance: 8_500,
      eventImpact: 92,
      roomsSold: 28,
      lastYearRoomsSold: 28,
    })], referenceDate)
    expect(result.signal).toBe('increase')
    expect(result.reason).toContain('8 500')
  })

  it('corrige le prix lorsque la comparaison N-1 était gonflée par un événement absent', () => {
    const [result] = analyzeData([row({
      date: '2026-08-15',
      roomsSold: 24,
      lastYearRoomsSold: 39,
      lastYearEventName: 'Festival exceptionnel',
      lastYearEventAttendance: 11_000,
      lastYearEventImpact: 95,
    })], referenceDate)
    expect(result.signal).toBe('decrease')
    expect(result.reason).toContain('N-1 bénéficiait')
  })

  it('maintient le tarif lorsque le rythme reste normal', () => {
    const [result] = analyzeData([row()], referenceDate)
    expect(result.signal).toBe('maintain')
    expect(result.recommendedDelta).toBe(0)
  })

  it('calcule les indicateurs consolidés', () => {
    const analyzed = analyzeData([
      row({ roomsSold: 40, revenue: 4400, pickup7d: 7, lastYearRoomsSold: 34 }),
      row({ date: '2026-07-21', roomsSold: 30, revenue: 3000 }),
    ], referenceDate)
    const summary = summarize(analyzed)
    expect(summary.averageOccupancy).toBeCloseTo(0.7)
    expect(summary.forecastRevenue).toBe(7400)
    expect(summary.alerts).toBe(1)
  })

  it('fournit une démonstration avec des décisions variées', () => {
    const summary = summarize(analyzeData(createDemoData(), referenceDate))
    expect(summary.alerts).toBeGreaterThanOrEqual(4)
    expect(summary.increases).toBeGreaterThan(0)
    expect(summary.boosts).toBeGreaterThan(0)
  })

  it('génère des milliers de réservations et tous les scénarios critiques', () => {
    const dataset = createSyntheticHotelDataset()
    const analyzed = analyzeData(dataset.dailyData, referenceDate)
    const signals = new Set(analyzed.map((item) => item.signal))
    expect(dataset.reservations.length).toBeGreaterThan(10_000)
    expect(signals).toContain('overbook')
    expect(signals).toContain('increase')
    expect(signals).toContain('decrease')
    expect(signals).toContain('boost')
    expect(signals).toContain('maintain')
  })
})
