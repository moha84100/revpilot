import { distanceKm, eventCategory, fetchJson, impactScore } from '../utils.mjs'

export async function fetchPredictHqEvents(search, token) {
  const query = new URLSearchParams({
    within: `${search.radiusKm}km@${search.latitude},${search.longitude}`,
    'active.gte': search.from,
    'active.lte': search.to,
    'local_rank.gte': '20',
    limit: '500',
    sort: 'start',
  })
  const payload = await fetchJson(`https://api.predicthq.com/v1/events/?${query}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  })

  return (payload.results ?? []).map((event) => {
    const longitude = Number(event.location?.[0])
    const latitude = Number(event.location?.[1])
    const distance = distanceKm(search.latitude, search.longitude, latitude, longitude)
    const attendance = Number(event.phq_attendance || 0)
    const category = eventCategory(event.category)
    return {
      id: `predicthq:${event.id}`,
      name: event.title,
      category,
      startDate: String(event.start).slice(0, 10),
      endDate: String(event.end || event.start).slice(0, 10),
      venue: event.entities?.find((entity) => entity.type === 'venue')?.name || 'Lieu non précisé',
      city: event.geo?.address?.locality || '',
      distanceKm: Number(distance.toFixed(1)),
      expectedAttendance: attendance,
      impactScore: impactScore({ attendance, rank: Number(event.local_rank || event.rank || 0), distance, category }),
      source: 'PredictHQ',
    }
  }).filter((event) => event.name && event.startDate)
}
