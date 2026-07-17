import { hotel } from '../hotel.mjs'

const DAY_MS = 86_400_000

function dateValue(value) {
  const date = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) throw new Error('Date invalide.')
  return date
}

function nightsBetween(checkIn, checkOut) {
  return Math.round((dateValue(checkOut).getTime() - dateValue(checkIn).getTime()) / DAY_MS)
}

function seededLoad(date, roomIndex) {
  const digits = Number(date.replaceAll('-', ''))
  return ((digits * 17 + roomIndex * 31) % 100) / 100
}

function nightlyRate(room, checkIn) {
  const date = dateValue(checkIn)
  const weekend = date.getUTCDay() === 5 || date.getUTCDay() === 6
  const summer = [5, 6, 7, 8].includes(date.getUTCMonth())
  return room.baseRate + (weekend ? 18 : 0) + (summer ? 16 : 0)
}

export class DemoPmsAdapter {
  name = 'Démo RevPilot'

  async getAvailability({ checkIn, checkOut, guests = 1 }) {
    const nights = nightsBetween(checkIn, checkOut)
    if (nights < 1) throw new Error('La date de départ doit être après la date d’arrivée.')
    if (nights > 30) throw new Error('Le séjour ne peut pas dépasser 30 nuits dans cette démonstration.')
    if (!Number.isInteger(guests) || guests < 1 || guests > 8) throw new Error('Nombre de voyageurs invalide.')

    const rooms = hotel.roomTypes
      .filter((room) => room.capacity >= guests)
      .map((room, index) => {
        const load = seededLoad(checkIn, index)
        const available = Math.max(0, Math.min(6, Math.round(room.total * (1 - load))))
        const rate = nightlyRate(room, checkIn)
        return { roomTypeId: room.id, name: room.name, capacity: room.capacity, available, nightlyRate: rate, totalStay: rate * nights, currency: 'EUR' }
      })
      .filter((room) => room.available > 0)

    return { provider: this.name, checkIn, checkOut, nights, guests, rooms, checkedAt: new Date().toISOString() }
  }

  async createReservationRequest(payload) {
    return { externalId: null, mode: 'request_only', payload }
  }
}

export const demoPms = new DemoPmsAdapter()
