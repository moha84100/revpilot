import { createSyntheticHotelDataset } from '../data/syntheticReservations'
import { analyzeData, summarize } from '../lib/analysis'

export const VIDEO_REFERENCE_DATE = new Date('2026-07-14T12:00:00')
export const VIDEO_EXPECTED_POTENTIAL = 5296

export function isVideoPresentation(search: string) {
  return new URLSearchParams(search).get('videoPresentation') === 'v4'
}

export function createVideoPresentationScenario() {
  const dataset = createSyntheticHotelDataset()
  const rows = analyzeData(dataset.dailyData, VIDEO_REFERENCE_DATE)
  return { dataset, rows, summary: summarize(rows.slice(0, 30)) }
}
