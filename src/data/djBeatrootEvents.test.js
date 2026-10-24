import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createServer } from 'vite'
import db from './db.json' with { type: 'json' }

const additions = db.events.events.filter(event => event.id.startsWith('dj-beatroot-'))
const original = db.events.events.filter(event => !event.id.startsWith('dj-beatroot-'))

test('six new DJ Beatroot prototype shows follow the original rolling horizon at six Singapore venues', () => {
  assert.equal(additions.length, 6)
  const latest = Math.max(...original.filter(event => Number.isFinite(event.dayOffset)).map(event => event.dayOffset))
  assert.deepEqual(additions.map(event => event.venueId), ['esplanade-annexe', 'aliwal-arts-centre', 'scape-ground-theatre', 'mdlr', 'blu-jaz', 'zouk'])
  assert.equal(new Set(db.events.events.map(event => event.id)).size, db.events.events.length)
  assert.equal(new Set(db.events.venues.map(venue => venue.id)).size, db.events.venues.length)
  for (const event of additions) {
    assert.ok(event.dayOffset > latest)
    assert.equal(event.headliner, 'fallingislands', 'Preserve the featured artist legacy fixture ID')
    assert.equal(event.genreId, 'electronic')
    assert.equal(event.isFictional, true)
    assert.match(event.about, /fictional prototype event/i)
    assert.equal(event.going, 0, 'Do not invent RSVPs for newly added shows')
    assert.deepEqual(event.friendIds, [])
    assert.ok(event.doors < event.time)
    assert.equal(event.free, event.price === 0)
    const venue = db.events.venues.find(venue => venue.id === event.venueId)
    assert.ok(venue?.address && Number.isFinite(venue.lat) && Number.isFinite(venue.lng))
    assert.ok(existsSync(new URL(`../../public/images/events/${event.id}.svg`, import.meta.url)))
  }
  assert.deepEqual(additions.map(event => event.dayOffset), [...additions.map(event => event.dayOffset)].sort((a, b) => a - b))
})

test('new shows hydrate with real venue pins, DJ Beatroot identity and no live ticket link', async () => {
  assert.equal(additions.length, 6)
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { fetchEventCatalog } = await server.ssrLoadModule('/src/features/events/services/eventsService.js')
    const { events } = await fetchEventCatalog(db.user.location)
    for (const raw of additions) {
      const event = events.find(event => event.id === raw.id)
      assert.equal(event.headliner.name, 'DJ Beatroot')
      assert.equal(event.venue.id, raw.venueId)
      assert.ok(event.startsAt instanceof Date)
      assert.ok(Number.isFinite(event.distanceKm))
      assert.equal(event.isFictional, true)
      assert.equal(event.ticketUrl, null)
      assert.ok(event.searchText.includes('dj beatroot'))
    }
  } finally { await server.close() }
})
