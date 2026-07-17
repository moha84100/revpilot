import type { DailyHotelData } from '../types'

const round = (value: number) => Math.round(value)

export function createDemoData(): DailyHotelData[] {
  const start = new Date('2026-07-15T12:00:00')

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const weekend = date.getDay() === 5 || date.getDay() === 6
    const eventPeak = index >= 7 && index <= 10
    const softPeriod = index >= 17 && index <= 20
    const seasonalWave = Math.sin(index / 3.6) * 6
    const sold = Math.max(
      13,
      Math.min(47, round(30 + seasonalWave + (weekend ? 8 : 0) + (eventPeak ? 7 : 0) - (softPeriod ? 13 : 0))),
    )
    const lastYearSold = Math.max(12, Math.min(45, sold - (eventPeak ? 7 : weekend ? 3 : index % 4 - 1)))
    const pickup = Math.max(0, round(2 + (weekend ? 3 : 0) + (eventPeak ? 5 : 0) - (softPeriod ? 2 : 0) + (index % 3)))
    const price = 92 + (weekend ? 18 : 0) + (eventPeak ? 15 : 0) - (softPeriod ? 8 : 0)

    return {
      date: date.toISOString().slice(0, 10),
      roomsAvailable: 48,
      roomsSold: sold,
      revenue: sold * price,
      pickup7d: pickup,
      lastYearRoomsSold: lastYearSold,
      currentPrice: price,
      cancellations7d: index % 9 === 0 ? 2 : 0,
      groupRooms: eventPeak ? 5 : 0,
      directRooms: Math.round(sold * .34),
      commissionCost: Math.round(sold * price * .11),
      competitorPrice: price + (softPeriod ? 7 : -3),
      eventName: eventPeak ? 'Concert de démonstration' : undefined,
      eventCategory: eventPeak ? 'concert' : undefined,
      eventAttendance: eventPeak ? 6000 : 0,
      eventImpact: eventPeak ? 80 : 0,
      eventSource: eventPeak ? 'Ticketmaster' : undefined,
      lastYearEventName: undefined,
      lastYearEventAttendance: 0,
      lastYearEventImpact: 0,
    }
  })
}
