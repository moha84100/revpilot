import Papa from 'papaparse'
import type { DailyHotelData, ParsedDataset } from '../types'

type CsvRow = Record<string, string | undefined>

const aliases = {
  date: ['date', 'jour', 'date_arrivee', 'arrival_date'],
  roomsAvailable: ['chambres_disponibles', 'capacite', 'rooms_available', 'capacity'],
  roomsSold: ['chambres_vendues', 'vendues', 'rooms_sold', 'booked_rooms'],
  revenue: ['chiffre_affaires', 'ca', 'revenue', 'room_revenue'],
  pickup7d: ['reservations_7j', 'pickup_7j', 'pickup_7d', 'bookings_last_7_days'],
  lastYearRoomsSold: ['vendues_n_1', 'chambres_vendues_n_1', 'last_year_rooms_sold', 'rooms_sold_last_year'],
  currentPrice: ['prix_actuel', 'prix_moyen', 'current_price', 'adr'],
  cancellations7d: ['annulations_7j', 'cancellations_7d', 'recent_cancellations'],
  groupRooms: ['chambres_groupe', 'group_rooms'],
  directRooms: ['chambres_directes', 'direct_rooms'],
  commissionCost: ['cout_commissions', 'commission_cost'],
  competitorPrice: ['prix_concurrents', 'competitor_price', 'market_price'],
  eventName: ['evenement', 'nom_evenement', 'event_name'],
  eventAttendance: ['affluence_evenement', 'event_attendance'],
  eventImpact: ['impact_evenement', 'event_impact'],
  lastYearEventName: ['evenement_n_1', 'last_year_event_name'],
  lastYearEventAttendance: ['affluence_evenement_n_1', 'last_year_event_attendance'],
  lastYearEventImpact: ['impact_evenement_n_1', 'last_year_event_impact'],
} as const

const normalizeHeader = (value: string) => value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s-]+/g, '_')
const numberFrom = (value: string | undefined) => Number(String(value ?? '').replace(/\s/g, '').replace(',', '.'))

function readAlias(row: CsvRow, names: readonly string[]): string | undefined {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]))
  return names.map(normalizeHeader).map((name) => normalized[name]).find((value) => value !== undefined && value !== '')
}

function normalizeDate(value: string): string {
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const french = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (french) return `${french[3]}-${french[2].padStart(2, '0')}-${french[1].padStart(2, '0')}`
  throw new Error(`Date non reconnue : « ${value} ». Utilisez AAAA-MM-JJ ou JJ/MM/AAAA.`)
}

export function parseCsvFile(file: File): Promise<ParsedDataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        try {
          if (result.errors.length) throw new Error(result.errors[0].message)
          const rows = result.data.map((row, index): DailyHotelData => {
            const dateValue = readAlias(row, aliases.date)
            if (!dateValue) throw new Error(`Ligne ${index + 2} : colonne de date manquante.`)

            const roomsAvailable = numberFrom(readAlias(row, aliases.roomsAvailable))
            const roomsSold = numberFrom(readAlias(row, aliases.roomsSold))
            const revenue = numberFrom(readAlias(row, aliases.revenue))
            const pickup7d = numberFrom(readAlias(row, aliases.pickup7d))
            const lastYearRoomsSold = numberFrom(readAlias(row, aliases.lastYearRoomsSold))
            const importedPrice = numberFrom(readAlias(row, aliases.currentPrice))
            const cancellations7d = numberFrom(readAlias(row, aliases.cancellations7d))
            const groupRooms = numberFrom(readAlias(row, aliases.groupRooms))
            const directRooms = numberFrom(readAlias(row, aliases.directRooms))
            const commissionCost = numberFrom(readAlias(row, aliases.commissionCost))
            const importedCompetitorPrice = numberFrom(readAlias(row, aliases.competitorPrice))
            const eventName = readAlias(row, aliases.eventName)
            const eventAttendance = numberFrom(readAlias(row, aliases.eventAttendance))
            const eventImpact = numberFrom(readAlias(row, aliases.eventImpact))
            const lastYearEventName = readAlias(row, aliases.lastYearEventName)
            const lastYearEventAttendance = numberFrom(readAlias(row, aliases.lastYearEventAttendance))
            const lastYearEventImpact = numberFrom(readAlias(row, aliases.lastYearEventImpact))
            const values = [roomsAvailable, roomsSold, revenue, pickup7d, lastYearRoomsSold]
            if (values.some((value) => !Number.isFinite(value))) {
              throw new Error(`Ligne ${index + 2} : une valeur numérique obligatoire est absente ou invalide.`)
            }
            if (roomsAvailable <= 0 || roomsSold < 0) {
              throw new Error(`Ligne ${index + 2} : capacité ou nombre de chambres vendues incohérent.`)
            }

            const currentPrice = Number.isFinite(importedPrice) && importedPrice > 0
              ? importedPrice
              : roomsSold > 0 ? revenue / roomsSold : 0

            return {
              date: normalizeDate(dateValue),
              roomsAvailable,
              roomsSold,
              revenue,
              pickup7d,
              lastYearRoomsSold,
              currentPrice,
              cancellations7d: Number.isFinite(cancellations7d) ? cancellations7d : 0,
              groupRooms: Number.isFinite(groupRooms) ? groupRooms : 0,
              directRooms: Number.isFinite(directRooms) ? directRooms : Math.round(roomsSold * .3),
              commissionCost: Number.isFinite(commissionCost) ? commissionCost : Math.round(revenue * .11),
              competitorPrice: Number.isFinite(importedCompetitorPrice) && importedCompetitorPrice > 0 ? importedCompetitorPrice : currentPrice,
              eventName,
              eventCategory: undefined,
              eventAttendance: Number.isFinite(eventAttendance) ? eventAttendance : 0,
              eventImpact: Number.isFinite(eventImpact) ? eventImpact : 0,
              eventSource: eventName ? 'CSV' : undefined,
              lastYearEventName,
              lastYearEventAttendance: Number.isFinite(lastYearEventAttendance) ? lastYearEventAttendance : 0,
              lastYearEventImpact: Number.isFinite(lastYearEventImpact) ? lastYearEventImpact : 0,
            }
          })

          if (!rows.length) throw new Error('Le fichier ne contient aucune ligne exploitable.')
          resolve({ rows, sourceName: file.name })
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Impossible de lire ce fichier CSV.'))
        }
      },
      error: (error) => reject(error),
    })
  })
}

export const exampleCsv = `date,chambres_disponibles,chambres_vendues,chiffre_affaires,reservations_7j,vendues_n_1,prix_actuel,annulations_7j,chambres_groupe,chambres_directes,cout_commissions,prix_concurrents,evenement,affluence_evenement,impact_evenement,evenement_n_1,affluence_evenement_n_1,impact_evenement_n_1
2026-07-15,48,36,3888,7,31,108,1,4,14,410,105,,,,,,
2026-07-16,48,39,4212,8,33,108,2,6,15,445,107,Concert au théâtre antique,8500,92,,0,0
2026-07-17,48,44,5544,10,36,126,1,8,16,590,121,,,,,,
2026-07-18,48,51,6426,9,38,126,0,10,18,680,128,,,,,,
2026-07-19,48,32,3264,4,38,102,5,2,12,350,96,,,0,Festival exceptionnel N-1,11000,95`
