// Events data access layer.
//
// Everything the Events screens need comes through these async functions, so
// swapping the mock data for the real backend later only means changing the
// bodies below (the components and composables don't care where data comes
// from). Return shapes are the "hydrated" shapes the UI uses: artists/venues
// already joined onto each event, dates already as Date objects.

import db from '@/data/db.json'
import { addDays, startOfDay, withTime, timeCompact, dow, time12 } from '../utils/date'
import { distanceKm } from '../utils/geo'

// All of the app's data lives in one JSON file (src/data/db.json).
const { artists, friends, genres, venues } = db.events
const rawEvents = db.events.events

const NETWORK_DELAY_MS = 150

const wait = (ms = NETWORK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))
const byId = (list) => new Map(list.map((item) => [item.id, item]))

function hydrate(location) {
  const today = startOfDay()
  const artistMap = byId(artists)
  const venueMap = byId(venues)
  const genreMap = byId(genres)
  const friendMap = byId(friends)

  return rawEvents.map((raw) => {
    const venue = venueMap.get(raw.venueId)
    const genre = genreMap.get(raw.genreId)
    const headliner = artistMap.get(raw.headliner)
    const supports = raw.supports.map((id) => artistMap.get(id))
    const startsAt = withTime(addDays(today, raw.dayOffset), raw.time)
    const doorsAt = withTime(addDays(today, raw.dayOffset), raw.doors)
    const lineup = [
      { artist: headliner, role: 'Headliner' },
      ...supports.map((artist) => ({ artist, role: 'Support' })),
    ]
    const tags = [...new Set(lineup.flatMap((l) => l.artist.tags))]
    const title = raw.name || `${headliner.name} at ${venue.listName}`

    return {
      id: raw.id,
      title,
      heroTitle: raw.name ? `${raw.name} @ ${venue.fullName}` : `${headliner.name} @ ${venue.fullName}`,
      about: raw.about,
      genre,
      genreId: raw.genreId,
      venue,
      venueId: raw.venueId,
      headliner,
      lineup,
      artistIds: lineup.map((l) => l.artist.id),
      tags,
      dayOffset: raw.dayOffset,
      startsAt,
      doorsAt,
      doorsLabel: time12(doorsAt),
      timeLabel: time12(startsAt),
      timeCompact: timeCompact(startsAt),
      dowLabel: dow(startsAt),
      // The first set starts at `startsAt`; each act after that is +45 min and
      // the headliner closes the night.
      setTimes: [...lineup].reverse().map((l, i) => ({
        artist: l.artist,
        time: timeCompact(new Date(startsAt.getTime() + i * 45 * 60000)),
      })),
      price: raw.price,
      free: raw.free,
      entry: raw.entry,
      going: raw.going,
      friends: raw.friendIds.map((id) => friendMap.get(id)),
      palette: raw.palette,
      distanceKm: distanceKm(location, venue),
      ticketUrl: `https://www.sistic.com.sg/`,
      searchText: [
        title,
        genre.label,
        venue.name,
        venue.listName,
        venue.fullName,
        ...lineup.map((l) => l.artist.name),
        ...tags,
      ]
        .join(' ')
        .toLowerCase(),
    }
  })
}

/** Everything the filter UI + results need in one go. */
export async function fetchEventCatalog(location) {
  await wait()
  const eventList = hydrate(location)
  const artistEventCounts = new Map()
  eventList.forEach((e) => e.artistIds.forEach((id) => artistEventCounts.set(id, (artistEventCounts.get(id) || 0) + 1)))

  return {
    events: eventList,
    genres,
    venues,
    artists: artists
      .map((a) => ({ ...a, eventCount: artistEventCounts.get(a.id) || 0 }))
      .filter((a) => a.eventCount > 0)
      .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name)),
  }
}

// ---- Discussion (local mock; the forum owner will replace this) -----------

const seedComments = [
  { id: 'c1', author: 'synthkid', hue: 260, minutesAgo: 60, text: 'An analogue set in a bunker? This is going to sound unreal.', votes: 12 },
  { id: 'c2', author: 'nightbus', hue: 30, minutesAgo: 32, text: 'Been waiting to hear the full set live. See you there!', votes: 5 },
  { id: 'c3', author: 'waveform', hue: 200, minutesAgo: 10, text: 'What synths are they bringing? Would love a closer look at the rig after the set.', votes: 3 },
]

export async function fetchDiscussion() {
  await wait(80)
  return seedComments.map((c) => ({ ...c }))
}
