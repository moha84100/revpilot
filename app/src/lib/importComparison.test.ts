import { describe, expect, it } from 'vitest'
import type { AnalysisSummary } from '../types'
import { createImportComparison } from './importComparison'

const summary = (overrides: Partial<AnalysisSummary> = {}): AnalysisSummary => ({
  averageOccupancy: .6,
  lastYearAverageOccupancy: .58,
  forecastRevenue: 10_000,
  potentialRevenue: 500,
  alerts: 2,
  increases: 1,
  boosts: 1,
  decreases: 0,
  overbookingDays: 0,
  averageAdr: 120,
  averageRevPAR: 72,
  directShare: .3,
  commissionCost: 900,
  eventDays: 0,
  ...overrides,
})

describe('bilan avant/après', () => {
  it('calcule les variations et priorise le surbooking', () => {
    const result = createImportComparison(summary(), summary({ averageOccupancy: .9, increases: 8, boosts: 0, overbookingDays: 3 }), 30, 21, 'Surbooking')
    expect(result.occupancy.delta).toBeCloseTo(.3)
    expect(result.increases.delta).toBe(7)
    expect(result.overbookings.delta).toBe(3)
    expect(result.insight).toContain('surbooking')
  })

  it('signale une analyse stable', () => {
    const result = createImportComparison(summary(), summary(), 30, 30, 'Stable')
    expect(result.insight).toContain('restent stables')
  })
})
