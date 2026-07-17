const DAY_MS = 86_400_000

export function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS)
}

export function eachDate(start, days) {
  return Array.from({ length: days }, (_, index) => isoDate(addDays(start, index)))
}

function occupiedOn(reservation, date) {
  const start = (reservation.ScheduledStartUtc || reservation.StartUtc || '').slice(0, 10)
  const end = (reservation.ScheduledEndUtc || reservation.EndUtc || '').slice(0, 10)
  return Boolean(start && end && start <= date && end > date)
}

function previousYearDate(date) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCFullYear(value.getUTCFullYear() - 1)
  return isoDate(value)
}

export function reservationsToDailyData({
  reservations,
  previousReservations = [],
  start,
  days,
  roomCount,
  defaultRoomRate,
  syncedAt = new Date(),
}) {
  const pickupLimit = addDays(syncedAt, -7)
  return eachDate(start, days).map((date) => {
    const active = reservations.filter((reservation) => occupiedOn(reservation, date))
    const lastYearRoomsSold = previousReservations.filter((reservation) => occupiedOn(reservation, previousYearDate(date))).length
    const pickup7d = active.filter((reservation) => {
      const created = new Date(reservation.CreatedUtc || 0)
      return Number.isFinite(created.getTime()) && created >= pickupLimit && created <= syncedAt
    }).length
    const roomsSold = active.length
    const revenue = roomsSold * defaultRoomRate
    const directRooms = active.filter((reservation) => !reservation.ChannelNumber && !reservation.ChannelManagerNumber).length
    return {
      date,
      roomsAvailable: roomCount,
      roomsSold,
      revenue,
      pickup7d,
      lastYearRoomsSold,
      currentPrice: defaultRoomRate,
      cancellations7d: 0,
      groupRooms: 0,
      directRooms,
      commissionCost: Math.round((roomsSold - directRooms) * defaultRoomRate * 0.15),
      competitorPrice: defaultRoomRate,
      eventAttendance: 0,
      eventImpact: 0,
      lastYearEventAttendance: 0,
      lastYearEventImpact: 0,
    }
  })
}

export function demoPmsData({ start = new Date(), days = 90, roomCount = 48, defaultRoomRate = 112 } = {}) {
  const rows = eachDate(start, days).map((date, index) => {
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
    const wave = Math.sin(index / 5) * 8
    const weekend = [5, 6].includes(weekday) ? 9 : 0
    const roomsSold = Math.max(8, Math.min(roomCount + (index === 18 ? 2 : 0), Math.round(28 + wave + weekend + index * .08)))
    const currentPrice = Math.round(defaultRoomRate + wave * 1.7 + weekend * 1.8)
    return {
      date,
      roomsAvailable: roomCount,
      roomsSold,
      revenue: roomsSold * currentPrice,
      pickup7d: Math.max(1, Math.round(roomsSold * .16 + Math.cos(index / 3) * 2)),
      lastYearRoomsSold: Math.max(5, Math.round(roomsSold - 2 + Math.sin(index / 7) * 5)),
      currentPrice,
      cancellations7d: index % 17 === 0 ? 3 : 1,
      groupRooms: index % 13 === 0 ? 8 : 2,
      directRooms: Math.round(roomsSold * .34),
      commissionCost: Math.round(roomsSold * currentPrice * .09),
      competitorPrice: currentPrice + Math.round(Math.cos(index / 4) * 7),
      eventAttendance: 0,
      eventImpact: 0,
      lastYearEventAttendance: 0,
      lastYearEventImpact: 0,
    }
  })
  return { rows, recordCount: rows.reduce((sum, row) => sum + row.roomsSold, 0), roomCount }
}
