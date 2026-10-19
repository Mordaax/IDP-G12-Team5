import test from 'node:test'
import assert from 'node:assert/strict'
import { filterEvents, readEventQuery } from './eventModel.js'

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
  assert.deepEqual(readEventQuery('?artist=fallingislands&venue=battlebox&q=synthwave'), { artist: 'fallingislands', venue: 'battlebox', q: 'synthwave' })
})
