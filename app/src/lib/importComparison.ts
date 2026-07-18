import type { AnalysisSummary } from '../types'

export interface ImportComparison {
  sourceName: string
  previousDates: number
  nextDates: number
  occupancy: { before: number; after: number; delta: number }
  increases: { before: number; after: number; delta: number }
  decreases: { before: number; after: number; delta: number }
  overbookings: { before: number; after: number; delta: number }
  insight: string
}

const metric = (before: number, after: number) => ({ before, after, delta: after - before })

export function createImportComparison(previous: AnalysisSummary, next: AnalysisSummary, previousDates: number, nextDates: number, sourceName: string): ImportComparison {
  const occupancy = metric(previous.averageOccupancy, next.averageOccupancy)
  const increases = metric(previous.increases, next.increases)
  const decreases = metric(previous.decreases + previous.boosts, next.decreases + next.boosts)
  const overbookings = metric(previous.overbookingDays, next.overbookingDays)
  const changes = [
    { weight: Math.abs(overbookings.delta) * 20, text: overbookings.delta > 0 ? `${overbookings.delta} nouvelle${overbookings.delta > 1 ? 's' : ''} alerte${overbookings.delta > 1 ? 's' : ''} de surbooking détectée${overbookings.delta > 1 ? 's' : ''}.` : `${Math.abs(overbookings.delta)} alerte${Math.abs(overbookings.delta) > 1 ? 's' : ''} de surbooking en moins.` },
    { weight: Math.abs(increases.delta) * 2, text: increases.delta > 0 ? `${increases.delta} opportunité${increases.delta > 1 ? 's' : ''} de hausse supplémentaire${increases.delta > 1 ? 's' : ''}.` : `${Math.abs(increases.delta)} hausse${Math.abs(increases.delta) > 1 ? 's' : ''} recommandée${Math.abs(increases.delta) > 1 ? 's' : ''} en moins.` },
    { weight: Math.abs(decreases.delta) * 2, text: decreases.delta > 0 ? `${decreases.delta} date${decreases.delta > 1 ? 's' : ''} supplémentaire${decreases.delta > 1 ? 's' : ''} à corriger ou stimuler.` : `${Math.abs(decreases.delta)} action${Math.abs(decreases.delta) > 1 ? 's' : ''} corrective${Math.abs(decreases.delta) > 1 ? 's' : ''} en moins.` },
    { weight: Math.abs(occupancy.delta) * 100, text: `L’occupation moyenne évolue de ${Math.abs(Math.round(occupancy.delta * 100))} point${Math.abs(Math.round(occupancy.delta * 100)) > 1 ? 's' : ''}.` },
  ].sort((a, b) => b.weight - a.weight)
  const insight = changes[0].weight === 0 ? 'Les indicateurs principaux restent stables après cet import.' : changes[0].text

  return { sourceName, previousDates, nextDates, occupancy, increases, decreases, overbookings, insight }
}
