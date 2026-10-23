import test from 'node:test'
import assert from 'node:assert/strict'
import * as model from './eventModel.js'
const { filterEvents, readEventQuery } = model

test('artist lookup is case-insensitive, excludes selections and caps results', () => {
  assert.equal(typeof model.searchArtists, 'function')
  const catalog = Array.from({ length: 10000 }, (_, index) => ({ id: `artist-${index}`, name: `Band ${index}` }))
  assert.deepEqual(model.searchArtists(catalog, '  bAnD  ', ['artist-0']).map((artist) => artist.id), ['artist-1', 'artist-2', 'artist-3', 'artist-4', 'artist-5'])
  assert.deepEqual(model.searchArtists(catalog, '9999').map((artist) => artist.id), ['artist-9999'])
  assert.deepEqual(model.searchArtists(catalog, 'missing'), [])
  assert.deepEqual(model.searchArtists(catalog, '  '), [])
})

test('filter equality tracks every input while ignoring checkbox selection order', () => {
  assert.equal(typeof model.filtersEqual, 'function')
  const baseline = { ...model.blankFilters(), genres: ['pop', 'electronic'], artists: ['aiyna', 'fallingislands'] }
  assert.equal(model.filtersEqual(baseline, model.cloneFilters(baseline)), true)
  assert.equal(model.filtersEqual(baseline, { ...baseline, genres: ['electronic', 'pop'], artists: ['fallingislands', 'aiyna'] }), true)
  for (const change of [{ q: 'battlebox' }, { venue: 'battlebox' }, { distance: 8 }, { day: 3 }, { genres: ['pop'] }, { artists: [] }]) {
    assert.equal(model.filtersEqual(baseline, { ...baseline, ...change }), false)
  }
})

test('preferences snapshot every input and load as an independent replacement', () => {
  assert.equal(typeof model.snapshotPreferences, 'function')
  assert.equal(typeof model.restorePreferences, 'function')
  const draft = { q: 'battlebox', genres: ['electronic'], artists: ['fallingislands'], venue: 'battlebox', distance: 8, day: 3 }
  const saved = model.snapshotPreferences(draft, 'price')
  draft.genres.push('pop')
  const restored = model.restorePreferences(saved)
  assert.deepEqual(restored, { filters: { q: 'battlebox', genres: ['electronic'], artists: ['fallingislands'], venue: 'battlebox', distance: 8, day: 3 }, sort: 'price' })
  restored.filters.artists.push('aiyna')
  assert.deepEqual(saved.artists, ['fallingislands'])
})

test('old preferences replace query and venue with defaults; malformed data is ignored', () => {
  assert.equal(typeof model.restorePreferences, 'function')
  const old = { genres: [], artists: [], distance: 20, day: 6 }
  assert.deepEqual(model.restorePreferences(old), { filters: { ...old, q: '', venue: null }, sort: 'soonest' })
  for (const bad of [null, {}, { ...old, genres: 'pop' }, { ...old, artists: [3] }, { ...old, day: 99 }, { ...old, distance: -1 }]) assert.equal(model.restorePreferences(bad), null)
  assert.equal(model.restorePreferences({ ...old, sort: 'invalid' }).sort, 'soonest')
})

const events = [
  { id: 'near', dayOffset: 2, startsAt: new Date('2026-10-21T19:00:00'), genreId: 'electronic', artistIds: ['fallingislands'], venueId: 'battlebox', distanceKm: 3, price: 42, going: 50, searchText: 'fallingislands synthwave battlebox' },
  { id: 'far', dayOffset: 5, startsAt: new Date('2026-10-24T19:00:00'), genreId: 'pop', artistIds: ['aiyna'], venueId: 'esplanade', distanceKm: 17, price: 15, going: 100, searchText: 'aiyna pop esplanade' },
]

test('artist deep link keeps only matching events', () => {
  assert.deepEqual(filterEvents(events, { artists: ['fallingislands'], genres: [], distance: 20, day: 6, q: '', venue: null }, 'soonest').map((e) => e.id), ['near'])
})

test('venue deep link is not limited by the week slider', () => {
  assert.deepEqual(filterEvents(events, { artists: [], genres: [], distance: 20, day: 1, q: '', venue: 'esplanade' }, 'soonest').map((e) => e.id), ['far'])
})

test('query, genre, distance and sort change visible results', () => {
  const all = { artists: [], genres: [], distance: 20, day: 6, q: '', venue: null }
  assert.deepEqual(filterEvents(events, { ...all, q: 'synthwave' }, 'soonest').map((e) => e.id), ['near'])
  assert.deepEqual(filterEvents(events, { ...all, genres: ['pop'], distance: 10 }, 'soonest'), [])
  assert.deepEqual(filterEvents(events, all, 'price').map((e) => e.id), ['far', 'near'])
})

test('reads supported filter deep links', () => {
  assert.deepEqual(readEventQuery('?artist=fallingislands&venue=battlebox&q=synthwave'), { artist: 'fallingislands', venue: 'battlebox', q: 'synthwave', event: '' })
})

test('event map links identify the exact event and keep its pin visible through filters', () => {
  assert.equal(model.eventMapUrl('fallingislands-tinbox'), '/events/map?event=fallingislands-tinbox')
  assert.equal(readEventQuery('?event=fallingislands-tinbox').event, 'fallingislands-tinbox')
  assert.deepEqual(model.includeFocusedEvent([events[1]], events, 'near').map((event) => event.id), ['far', 'near'])
  assert.deepEqual(model.includeFocusedEvent([events[0]], events, 'near').map((event) => event.id), ['near'])
  assert.deepEqual(model.includeFocusedEvent([events[0]], events, 'missing').map((event) => event.id), ['near'])
})
