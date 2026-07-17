import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  createSyntheticHotelDataset,
  dailyDataToCsv,
  reservationsToCsv,
} from '../src/data/syntheticReservations.ts'

const dataset = createSyntheticHotelDataset()
const publicDir = resolve(import.meta.dirname, '../public')

writeFileSync(resolve(publicDir, 'reservations-fictives-revpilot.csv'), reservationsToCsv(dataset.reservations))
writeFileSync(resolve(publicDir, 'donnees-journalieres-fictives-revpilot.csv'), dailyDataToCsv(dataset.dailyData))

console.log(`${dataset.reservations.length.toLocaleString('fr-FR')} réservations générées`)
console.log(`${dataset.dailyData.length} dates journalières générées`)
