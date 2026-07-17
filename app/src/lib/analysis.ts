import type { AnalysisSummary, AnalyzedDate, DailyHotelData, Signal } from '../types'

const DAY_MS = 86_400_000
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number, decimals = 0) => Number(value.toFixed(decimals))

interface RuleResult {
  signal: Signal
  signalLabel: string
  recommendation: string
  delta: number
  reason: string
}

interface RuleContext {
  occupancy: number
  paceGap: number
  pickup7d: number
  daysUntilArrival: number
  overbookedRooms: number
  cancellations7d: number
  groupRooms: number
  priceGap: number
  eventName?: string
  eventAttendance: number
  eventImpact: number
  lastYearEventName?: string
  lastYearEventAttendance: number
  lastYearEventImpact: number
}

function chooseRule({ occupancy, paceGap, pickup7d, daysUntilArrival, overbookedRooms, cancellations7d, groupRooms, priceGap, eventName, eventAttendance, eventImpact, lastYearEventName, lastYearEventAttendance, lastYearEventImpact }: RuleContext): RuleResult {
  if (overbookedRooms > 0) {
    return {
      signal: 'overbook',
      signalLabel: 'Surbooking',
      recommendation: 'Fermer les ventes et sécuriser les arrivées',
      delta: 0,
      reason: `${overbookedRooms} chambre${overbookedRooms > 1 ? 's sont' : ' est'} vendue${overbookedRooms > 1 ? 's' : ''} au-delà de la capacité. Vérifier les annulations probables et le plan de relogement.`,
    }
  }

  const eventImpactGap = eventImpact - lastYearEventImpact
  if (eventName && eventImpact >= 55 && eventImpactGap >= 25 && daysUntilArrival <= 120) {
    const delta = eventImpact >= 85 ? 12 : 7
    return {
      signal: 'increase',
      signalLabel: 'Événement porteur',
      recommendation: `Tester une hausse de ${delta} %`,
      delta,
      reason: `${eventName} est attendu à proximité avec environ ${eventAttendance.toLocaleString('fr-FR')} participants. Aucun événement d’impact comparable n’était présent à N-1.`,
    }
  }

  if (!eventName && lastYearEventName && lastYearEventImpact >= 55 && paceGap < 0 && daysUntilArrival <= 60) {
    return {
      signal: 'decrease',
      signalLabel: 'Événement N-1 absent',
      recommendation: 'Tester une baisse de 8 %',
      delta: -8,
      reason: `N-1 bénéficiait de « ${lastYearEventName} » et d’environ ${lastYearEventAttendance.toLocaleString('fr-FR')} participants. Cette année, aucun événement comparable ne soutient la même date.`,
    }
  }

  if (occupancy >= 0.84 && pickup7d >= 5) {
    const delta = occupancy >= 0.92 ? 12 : 8
    return {
      signal: 'increase',
      signalLabel: 'Demande forte',
      recommendation: `Tester une hausse de ${delta} %`,
      delta,
      reason: `L’occupation atteint ${round(occupancy * 100)} % et ${pickup7d} chambres ont été réservées en 7 jours.${groupRooms >= 5 ? ` ${groupRooms} chambres de groupe réduisent encore l’inventaire disponible.` : ''}${eventName ? ` Le contexte comprend aussi « ${eventName} ».` : ''}`,
    }
  }

  if (occupancy >= 0.64 && paceGap >= 4 && pickup7d >= 4) {
    return {
      signal: 'increase',
      signalLabel: 'Rythme en avance',
      recommendation: 'Tester une hausse de 6 %',
      delta: 6,
      reason: `Le rythme compte ${paceGap} chambres d’avance sur l’année précédente.`,
    }
  }

  if (occupancy < 0.5 && paceGap <= -4 && daysUntilArrival <= 30) {
    const delta = daysUntilArrival <= 10 && occupancy < .36 ? -12 : -7
    return {
      signal: 'decrease',
      signalLabel: 'Retard de demande',
      recommendation: `Tester une baisse de ${Math.abs(delta)} %`,
      delta,
      reason: `À J-${daysUntilArrival}, l’hôtel compte ${Math.abs(paceGap)} chambres de retard sur N-1.${priceGap > 8 ? ` Le prix moyen est aussi supérieur de ${round(priceGap)} € au marché simulé.` : ''}`,
    }
  }

  if (occupancy < 0.46 && daysUntilArrival <= 60) {
    return {
      signal: 'boost',
      signalLabel: 'Demande faible',
      recommendation: 'Renforcer la visibilité',
      delta: -5,
      reason: `Seulement ${round(occupancy * 100)} % des chambres sont vendues à J-${daysUntilArrival}.${cancellations7d >= 3 ? ` ${cancellations7d} annulations récentes fragilisent cette date.` : ''}`,
    }
  }

  return {
    signal: 'maintain',
    signalLabel: 'Rythme normal',
    recommendation: 'Maintenir le tarif',
    delta: 0,
    reason: 'Le niveau d’occupation et le rythme de réservation restent dans la zone attendue.',
  }
}

export function analyzeData(rows: DailyHotelData[], referenceDate = new Date('2026-07-14T12:00:00')): AnalyzedDate[] {
  return [...rows]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => {
      const occupancy = row.roomsSold / row.roomsAvailable
      const lastYearOccupancy = row.lastYearRoomsSold / row.roomsAvailable
      const adr = row.roomsSold > 0 ? row.revenue / row.roomsSold : row.currentPrice
      const paceGap = row.roomsSold - row.lastYearRoomsSold
      const arrival = new Date(`${row.date}T12:00:00`)
      const daysUntilArrival = Math.max(0, Math.round((arrival.getTime() - referenceDate.getTime()) / DAY_MS))
      const overbookedRooms = Math.max(0, row.roomsSold - row.roomsAvailable)
      const cancellationRate = (row.roomsSold + row.cancellations7d) > 0 ? row.cancellations7d / (row.roomsSold + row.cancellations7d) : 0
      const directShare = row.roomsSold > 0 ? row.directRooms / row.roomsSold : 0
      const netRevPAR = (row.revenue - row.commissionCost) / row.roomsAvailable
      const priceGap = adr - row.competitorPrice
      const eventImpactGap = row.eventImpact - row.lastYearEventImpact
      const rule = chooseRule({
        occupancy,
        paceGap,
        pickup7d: row.pickup7d,
        daysUntilArrival,
        overbookedRooms,
        cancellations7d: row.cancellations7d,
        groupRooms: row.groupRooms,
        priceGap,
        eventName: row.eventName,
        eventAttendance: row.eventAttendance,
        eventImpact: row.eventImpact,
        lastYearEventName: row.lastYearEventName,
        lastYearEventAttendance: row.lastYearEventAttendance,
        lastYearEventImpact: row.lastYearEventImpact,
      })
      const unsoldRooms = Math.max(0, row.roomsAvailable - row.roomsSold)
      const increasePotential = unsoldRooms * adr * Math.max(0, rule.delta) / 100 * 0.72
      const boostGap = Math.max(0, row.lastYearRoomsSold - row.roomsSold)
      const recoveryPotential = boostGap * adr * (rule.signal === 'decrease' ? .48 : .35)
      const protectedOverbookingCost = overbookedRooms * adr * 1.35
      const confidence = clamp(round(68 + Math.abs(paceGap) * 2 + row.pickup7d * 1.2 + overbookedRooms * 4), 68, 98)

      return {
        ...row,
        occupancy,
        lastYearOccupancy,
        adr,
        paceGap,
        daysUntilArrival,
        signal: rule.signal,
        signalLabel: rule.signalLabel,
        recommendation: rule.recommendation,
        recommendedDelta: rule.delta,
        reason: rule.reason,
        confidence,
        potentialRevenue: round(rule.signal === 'increase' ? increasePotential : rule.signal === 'overbook' ? protectedOverbookingCost : recoveryPotential),
        overbookedRooms,
        cancellationRate,
        directShare,
        netRevPAR,
        priceGap,
        eventImpactGap,
      }
    })
}

export function summarize(rows: AnalyzedDate[]): AnalysisSummary {
  const totalCapacity = rows.reduce((sum, row) => sum + row.roomsAvailable, 0)
  const totalSold = rows.reduce((sum, row) => sum + row.roomsSold, 0)
  const totalLastYear = rows.reduce((sum, row) => sum + row.lastYearRoomsSold, 0)
  const actionable = rows.filter((row) => row.signal !== 'maintain')

  return {
    averageOccupancy: totalCapacity ? totalSold / totalCapacity : 0,
    lastYearAverageOccupancy: totalCapacity ? totalLastYear / totalCapacity : 0,
    forecastRevenue: rows.reduce((sum, row) => sum + row.revenue, 0),
    potentialRevenue: actionable.reduce((sum, row) => sum + row.potentialRevenue, 0),
    alerts: actionable.length,
    increases: actionable.filter((row) => row.signal === 'increase').length,
    boosts: actionable.filter((row) => row.signal === 'boost').length,
    decreases: actionable.filter((row) => row.signal === 'decrease').length,
    overbookingDays: actionable.filter((row) => row.signal === 'overbook').length,
    averageAdr: totalSold ? rows.reduce((sum, row) => sum + row.revenue, 0) / totalSold : 0,
    averageRevPAR: totalCapacity ? rows.reduce((sum, row) => sum + row.revenue, 0) / totalCapacity : 0,
    directShare: totalSold ? rows.reduce((sum, row) => sum + row.directRooms, 0) / totalSold : 0,
    commissionCost: rows.reduce((sum, row) => sum + row.commissionCost, 0),
    eventDays: rows.filter((row) => row.eventImpact > 0).length,
  }
}
