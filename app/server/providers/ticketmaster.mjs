import { distanceKm, eventCategory, fetchJson, impactScore } from '../utils.mjs'

export async function fetchTicketmasterEvents(search, apiKey) {
  const query = new URLSearchParams({
    apikey: apiKey,
    latlong: `${search.latitude},${search.longitude}`,
    radius: String(search.radiusKm),
    unit: 'km',
    startDateTime: `${search.from}T00:00:00Z`,
    endDateTime: `${search.to}T23:59:59Z`,
    size: '200',
    locale: '*',
    sort: 'date,asc',
  })
  const payload = await fetchJson(`https://app.ticketmaster.com/discovery/v2/events.json?${query}`)
  const events = payload?._embedded?.events ?? []

  return events.map((event) => {
    const venue = event._embedded?.venues?.[0] ?? {}
    const latitude = Number(venue.location?.latitude)
    const longitude = Number(venue.location?.longitude)
    const distance = distanceKm(search.latitude, search.longitude, latitude, longitude)
    const category = eventCategory(event.classifications?.[0]?.segment?.name || event.classifications?.[0]?.genre?.name)
    const attendance = Number(event._embedded?.venues?.[0]?.capacity || 0)
    return {
      id: `ticketmaster:${event.id}`,
      name: event.name,
      category,
      startDate: event.dates?.start?.localDate,
      endDate: event.dates?.end?.localDate || event.dates?.start?.localDate,
      venue: venue.name || 'Lieu non précisé',
      city: venue.city?.name || '',
      distanceKm: Number(distance.toFixed(1)),
      expectedAttendance: attendance,
      impactScore: impactScore({ attendance, distance, category }),
      source: 'Ticketmaster',
    }
  }).filter((event) => event.name && event.startDate)
}
