import type { BookingChannel, DailyHotelData, Reservation, RoomType } from '../types'
import { strongestEventOn } from '../events/syntheticEvents.ts'

const DAY_MS = 86_400_000
const HOTEL_CAPACITY = 48
const REFERENCE_DATE = new Date('2026-07-14T12:00:00')

interface SyntheticDataset {
  reservations: Reservation[]
  dailyData: DailyHotelData[]
}

function seededRandom(seed = 20260714) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

const iso = (date: Date) => date.toISOString().slice(0, 10)
const addDays = (value: Date | string, days: number) => {
  const date = typeof value === 'string' ? new Date(`${value}T12:00:00`) : new Date(value)
  date.setDate(date.getDate() + days)
  return date
}
const differenceInDays = (later: Date, earlier: Date) => Math.round((later.getTime() - earlier.getTime()) / DAY_MS)
const between = (value: string, start: string, end: string) => value >= start && value <= end
const pick = <T,>(random: () => number, values: Array<[T, number]>): T => {
  const roll = random()
  let cursor = 0
  for (const [value, weight] of values) {
    cursor += weight
    if (roll <= cursor) return value
  }
  return values[values.length - 1][0]
}

function isEventDate(date: string) {
  return (strongestEventOn(date)?.impactScore ?? 0) >= 55
}

function isSoftPeriod(date: string) {
  const monthDay = date.slice(5)
  return between(monthDay, '09-06', '09-12') || between(monthDay, '11-02', '11-09')
}

function seasonalBase(date: Date) {
  const month = date.getMonth() + 1
  if ([6, 7, 8].includes(month)) return 15
  if ([4, 5, 9, 10].includes(month)) return 12
  return 9
}

function generateReservations(): Reservation[] {
  const random = seededRandom()
  const reservations: Reservation[] = []
  const start = new Date('2024-01-01T12:00:00')
  const end = new Date('2026-12-31T12:00:00')
  let id = 1

  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    const arrival = iso(cursor)
    const weekend = cursor.getDay() === 5 || cursor.getDay() === 6
    const event = isEventDate(arrival)
    const soft = isSoftPeriod(arrival)
    const yearGrowth = cursor.getFullYear() === 2026 ? 1.08 : cursor.getFullYear() === 2025 ? 1.03 : 1
    const targetArrivals = Math.max(3, Math.round((seasonalBase(cursor) + (weekend ? 3 : 0) + (event ? 9 : 0) - (soft ? 6 : 0)) * yearGrowth + (random() - .5) * 5))

    for (let index = 0; index < targetArrivals; index += 1) {
      const roomType = pick<RoomType>(random, [['Classique', .69], ['Supérieure', .24], ['Suite', .07]])
      const channel = pick<BookingChannel>(random, [['Direct', .32], ['Booking.com', .31], ['Expedia', .15], ['Corporate', .14], ['Group', .08]])
      const stayLength = channel === 'Group' ? 2 + Math.floor(random() * 3) : 1 + Math.floor(random() * (roomType === 'Suite' ? 4 : 3))
      const leadBase = channel === 'Corporate' ? 24 : channel === 'Group' ? 70 : event ? 42 : 18
      const leadTime = Math.max(0, Math.round(leadBase * (.35 + random() * 1.7)))
      const bookingDate = addDays(cursor, -leadTime)

      // Une vraie photographie au 14 juillet ne contient pas les réservations qui seront créées plus tard.
      if (cursor > REFERENCE_DATE && bookingDate > REFERENCE_DATE) continue

      const cancellationProbability = channel === 'Booking.com' ? .16 : channel === 'Expedia' ? .13 : channel === 'Direct' ? .07 : .045
      const cancelled = random() < cancellationProbability
      const cancellationDate = cancelled ? addDays(bookingDate, Math.max(1, Math.floor(random() * Math.max(2, leadTime)))) : undefined
      const cancellationKnown = cancellationDate && cancellationDate <= REFERENCE_DATE
      const noShow = !cancelled && cursor < REFERENCE_DATE && random() < .018
      const basePrice = 82
        + ([6, 7, 8].includes(cursor.getMonth() + 1) ? 20 : 0)
        + (weekend ? 14 : 0)
        + (event ? 34 : 0)
        - (soft ? 13 : 0)
        + (roomType === 'Supérieure' ? 28 : roomType === 'Suite' ? 76 : 0)
      const priceNoise = Math.round((random() - .5) * 16)
      const nightlyPrice = Math.max(58, basePrice + priceNoise)
      const commissionRate = channel === 'Booking.com' ? .17 : channel === 'Expedia' ? .19 : channel === 'Corporate' ? .08 : 0

      reservations.push({
        reservationId: `RES-${String(id).padStart(6, '0')}`,
        bookingDate: iso(bookingDate),
        arrivalDate: arrival,
        departureDate: iso(addDays(cursor, stayLength)),
        cancellationDate: cancellationDate ? iso(cancellationDate) : undefined,
        status: cancellationKnown ? 'cancelled' : noShow ? 'no_show' : cursor < REFERENCE_DATE ? 'completed' : 'confirmed',
        channel,
        roomType,
        guests: roomType === 'Suite' ? 2 + Math.floor(random() * 3) : 1 + Math.floor(random() * 2),
        totalRevenue: nightlyPrice * stayLength,
        commissionRate,
      })
      id += 1
    }
  }

  return reservations
}

function activeAtSnapshot(reservation: Reservation, snapshot: Date) {
  if (new Date(`${reservation.bookingDate}T12:00:00`) > snapshot) return false
  if (reservation.cancellationDate && new Date(`${reservation.cancellationDate}T12:00:00`) <= snapshot) return false
  return true
}

function reservationCoversDate(reservation: Reservation, date: string) {
  return reservation.arrivalDate <= date && reservation.departureDate > date
}

export function aggregateReservations(reservations: Reservation[], referenceDate = REFERENCE_DATE, horizonDays = 180): DailyHotelData[] {
  const recentStart = addDays(referenceDate, -7)
  const previousReference = addDays(referenceDate, -365)
  const rows: DailyHotelData[] = []

  for (let offset = 1; offset <= horizonDays; offset += 1) {
    const stayDate = iso(addDays(referenceDate, offset))
    const comparableDate = iso(addDays(stayDate, -365))
    const active = reservations.filter((reservation) => activeAtSnapshot(reservation, referenceDate) && reservationCoversDate(reservation, stayDate))
    const previous = reservations.filter((reservation) => activeAtSnapshot(reservation, previousReference) && reservationCoversDate(reservation, comparableDate))
    const pickup = active.filter((reservation) => new Date(`${reservation.bookingDate}T12:00:00`) >= recentStart).length
    const cancelledRecently = reservations.filter((reservation) => reservationCoversDate(reservation, stayDate)
      && reservation.cancellationDate
      && new Date(`${reservation.cancellationDate}T12:00:00`) >= recentStart
      && new Date(`${reservation.cancellationDate}T12:00:00`) <= referenceDate).length
    const revenue = active.reduce((sum, reservation) => {
      const nights = Math.max(1, differenceInDays(new Date(`${reservation.departureDate}T12:00:00`), new Date(`${reservation.arrivalDate}T12:00:00`)))
      return sum + reservation.totalRevenue / nights
    }, 0)
    const commissionCost = active.reduce((sum, reservation) => {
      const nights = Math.max(1, differenceInDays(new Date(`${reservation.departureDate}T12:00:00`), new Date(`${reservation.arrivalDate}T12:00:00`)))
      return sum + (reservation.totalRevenue / nights) * reservation.commissionRate
    }, 0)
    const roomPrice = active.length ? revenue / active.length : 85
    const eventPremium = isEventDate(stayDate) ? 22 : isSoftPeriod(stayDate) ? -11 : 0
    const cityEvent = strongestEventOn(stayDate)
    const lastYearEvent = strongestEventOn(comparableDate)

    rows.push({
      date: stayDate,
      roomsAvailable: HOTEL_CAPACITY,
      roomsSold: active.length,
      revenue: Math.round(revenue),
      pickup7d: pickup,
      lastYearRoomsSold: previous.length,
      currentPrice: Math.round(roomPrice),
      cancellations7d: cancelledRecently,
      groupRooms: active.filter((reservation) => reservation.channel === 'Group').length,
      directRooms: active.filter((reservation) => reservation.channel === 'Direct').length,
      commissionCost: Math.round(commissionCost),
      competitorPrice: Math.max(55, Math.round(94 + eventPremium + Math.sin(offset / 8) * 9)),
      eventName: cityEvent?.name,
      eventCategory: cityEvent?.category,
      eventAttendance: cityEvent?.expectedAttendance ?? 0,
      eventImpact: cityEvent?.impactScore ?? 0,
      eventSource: cityEvent?.source,
      lastYearEventName: lastYearEvent?.name,
      lastYearEventAttendance: lastYearEvent?.expectedAttendance ?? 0,
      lastYearEventImpact: lastYearEvent?.impactScore ?? 0,
    })
  }

  return rows
}

export function createSyntheticHotelDataset(): SyntheticDataset {
  const reservations = generateReservations()
  return { reservations, dailyData: aggregateReservations(reservations) }
}

export function reservationsToCsv(reservations: Reservation[]) {
  const headers = ['reservation_id', 'date_reservation', 'arrivee', 'depart', 'date_annulation', 'statut', 'canal', 'type_chambre', 'voyageurs', 'revenu_total', 'taux_commission']
  const lines = reservations.map((reservation) => [
    reservation.reservationId,
    reservation.bookingDate,
    reservation.arrivalDate,
    reservation.departureDate,
    reservation.cancellationDate ?? '',
    reservation.status,
    reservation.channel,
    reservation.roomType,
    reservation.guests,
    reservation.totalRevenue,
    reservation.commissionRate,
  ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
  return `\ufeff${headers.join(',')}\n${lines.join('\n')}`
}

export function dailyDataToCsv(rows: DailyHotelData[]) {
  const headers = ['date', 'chambres_disponibles', 'chambres_vendues', 'chiffre_affaires', 'reservations_7j', 'vendues_n_1', 'prix_actuel', 'annulations_7j', 'chambres_groupe', 'chambres_directes', 'cout_commissions', 'prix_concurrents', 'evenement', 'affluence_evenement', 'impact_evenement', 'source_evenement', 'evenement_n_1', 'affluence_evenement_n_1', 'impact_evenement_n_1']
  const lines = rows.map((row) => [
    row.date, row.roomsAvailable, row.roomsSold, row.revenue, row.pickup7d,
    row.lastYearRoomsSold, row.currentPrice, row.cancellations7d, row.groupRooms,
    row.directRooms, row.commissionCost, row.competitorPrice, row.eventName ?? '',
    row.eventAttendance, row.eventImpact, row.eventSource ?? '', row.lastYearEventName ?? '',
    row.lastYearEventAttendance, row.lastYearEventImpact,
  ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
  return `\ufeff${headers.join(',')}\n${lines.join('\n')}`
}
