import type { DailyHotelData } from '../types'
import type { CityEvent } from './types'

const shiftYear = (date: string, years: number) => {
  const value = new Date(`${date}T12:00:00`)
  value.setFullYear(value.getFullYear() + years)
  return value.toISOString().slice(0, 10)
}

const strongestOn = (events: CityEvent[], date: string) => events
  .filter((event) => event.startDate <= date && event.endDate >= date)
  .sort((a, b) => b.impactScore - a.impactScore)[0]

export function enrichWithLiveEvents(rows: DailyHotelData[], events: CityEvent[]): DailyHotelData[] {
  return rows.map((row) => {
    const current = strongestOn(events, row.date)
    const previous = strongestOn(events, shiftYear(row.date, -1))
    return {
      ...row,
      eventName: current?.name,
      eventCategory: current?.category,
      eventAttendance: current?.expectedAttendance ?? 0,
      eventImpact: current?.impactScore ?? 0,
      eventSource: current?.source,
      lastYearEventName: previous?.name,
      lastYearEventAttendance: previous?.expectedAttendance ?? 0,
      lastYearEventImpact: previous?.impactScore ?? 0,
    }
  })
}
