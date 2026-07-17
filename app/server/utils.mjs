const EARTH_RADIUS_KM = 6371

export function distanceKm(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return 0
  const toRadians = (value) => value * Math.PI / 180
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function eventCategory(value = '') {
  const text = value.toLowerCase()
  if (text.includes('music') || text.includes('concert')) return 'concert'
  if (text.includes('sport')) return 'sport'
  if (text.includes('conference') || text.includes('congress')) return 'conference'
  if (text.includes('festival')) return 'festival'
  if (text.includes('fair') || text.includes('expo') || text.includes('salon')) return 'fair'
  return 'culture'
}

export function impactScore({ attendance = 0, rank = 0, distance = 0, category = 'culture' }) {
  const attendanceScore = attendance > 0 ? Math.min(70, Math.log10(Math.max(10, attendance)) * 17) : 22
  const rankScore = Math.min(25, rank * .25)
  const distancePenalty = Math.min(30, distance * .75)
  const categoryBonus = ['concert', 'festival', 'conference', 'sport'].includes(category) ? 8 : 2
  return Math.max(5, Math.min(100, Math.round(attendanceScore + rankScore + categoryBonus - distancePenalty)))
}

export function textValue(value) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return ''
  return value.fr || value.en || Object.values(value).find((entry) => typeof entry === 'string') || ''
}

export function deduplicateEvents(events) {
  const unique = new Map()
  for (const event of events) {
    const normalizedName = event.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
    const key = `${event.startDate}:${normalizedName.slice(0, 40)}`
    const existing = unique.get(key)
    if (!existing || event.expectedAttendance > existing.expectedAttendance || event.impactScore > existing.impactScore) unique.set(key, event)
  }
  return [...unique.values()].sort((a, b) => a.startDate.localeCompare(b.startDate) || b.impactScore - a.impactScore)
}

export async function fetchJson(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}
