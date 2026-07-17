export type Signal = 'overbook' | 'increase' | 'decrease' | 'boost' | 'maintain'

export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type BookingChannel = 'Direct' | 'Booking.com' | 'Expedia' | 'Corporate' | 'Group'
export type RoomType = 'Classique' | 'Supérieure' | 'Suite'

export interface Reservation {
  reservationId: string
  bookingDate: string
  arrivalDate: string
  departureDate: string
  cancellationDate?: string
  status: ReservationStatus
  channel: BookingChannel
  roomType: RoomType
  guests: number
  totalRevenue: number
  commissionRate: number
}

export interface DailyHotelData {
  date: string
  roomsAvailable: number
  roomsSold: number
  revenue: number
  pickup7d: number
  lastYearRoomsSold: number
  currentPrice: number
  cancellations7d: number
  groupRooms: number
  directRooms: number
  commissionCost: number
  competitorPrice: number
  eventName?: string
  eventCategory?: string
  eventAttendance: number
  eventImpact: number
  eventSource?: string
  lastYearEventName?: string
  lastYearEventAttendance: number
  lastYearEventImpact: number
}

export interface AnalyzedDate extends DailyHotelData {
  occupancy: number
  lastYearOccupancy: number
  adr: number
  paceGap: number
  daysUntilArrival: number
  signal: Signal
  signalLabel: string
  recommendation: string
  recommendedDelta: number
  reason: string
  confidence: number
  potentialRevenue: number
  overbookedRooms: number
  cancellationRate: number
  directShare: number
  netRevPAR: number
  priceGap: number
  eventImpactGap: number
}

export interface AnalysisSummary {
  averageOccupancy: number
  lastYearAverageOccupancy: number
  forecastRevenue: number
  potentialRevenue: number
  alerts: number
  increases: number
  boosts: number
  decreases: number
  overbookingDays: number
  averageAdr: number
  averageRevPAR: number
  directShare: number
  commissionCost: number
  eventDays: number
}

export interface ParsedDataset {
  rows: DailyHotelData[]
  sourceName: string
  recordCount?: number
}
