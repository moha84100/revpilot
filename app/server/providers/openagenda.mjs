import { distanceKm, eventCategory, fetchJson, impactScore, textValue } from '../utils.mjs'

export async function fetchOpenAgendaEvents(search, apiKey, agendaUids) {
  const results = await Promise.all(agendaUids.map(async (agendaUid) => {
    const query = new URLSearchParams({
      key: apiKey,
      'timings[gte]': `${search.from}T00:00:00.000Z`,
      'timings[lte]': `${search.to}T23:59:59.999Z`,
      limit: '300',
    })
    const payload = await fetchJson(`https://api.openagenda.com/v2/agendas/${encodeURIComponent(agendaUid)}/events?${query}`)
    return payload.events ?? payload.items ?? payload.data ?? []
  }))

  return results.flat().map((event) => {
    const timing = event.timings?.[0] ?? event.firstTiming ?? {}
    const location = event.location ?? {}
    const latitude = Number(location.latitude ?? location.lat)
    const longitude = Number(location.longitude ?? location.lng)
    const distance = distanceKm(search.latitude, search.longitude, latitude, longitude)
    const category = eventCategory(textValue(event.keywords) || textValue(event.description))
    const attendance = Number(event.attendance || event.capacity || 0)
    return {
      id: `openagenda:${event.uid || event.id}`,
      name: textValue(event.title),
      category,
      startDate: String(timing.begin || timing.start || event.start).slice(0, 10),
      endDate: String(timing.end || event.end || timing.begin || timing.start || event.start).slice(0, 10),
      venue: textValue(location.name) || 'Lieu non précisé',
      city: textValue(location.city) || '',
      distanceKm: Number(distance.toFixed(1)),
      expectedAttendance: attendance,
      impactScore: impactScore({ attendance, distance, category }),
      source: 'OpenAgenda',
    }
  }).filter((event) => event.name && event.startDate && event.distanceKm <= search.radiusKm)
}
