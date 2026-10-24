import test from 'node:test'
import assert from 'node:assert/strict'
import * as model from './eventModel.js'
import * as dates from '../utils/date.js'

const fixture = [
  { id: 'opening', dayOffset: 28, startsAt: new Date(2026, 10, 20, 0, 1), venueId: 'stage', genreId: 'electronic', artistIds: ['fallingislands'], distanceKm: 1, price: 0, going: 0, searchText: 'dj beatroot' },
  { id: 'closing', dayOffset: 63, startsAt: new Date(2026, 11, 25, 23, 59), venueId: 'stage', genreId: 'electronic', artistIds: ['fallingislands'], distanceKm: 1, price: 10, going: 0, searchText: 'dj beatroot' },
  { id: 'later', dayOffset: 100, startsAt: new Date(2027, 0, 1, 20), venueId: 'stage', genreId: 'electronic', artistIds: ['fallingislands'], distanceKm: 1, price: 20, going: 0, searchText: 'dj beatroot' },
]
const range = (startDate = '', endDate = '') => ({ q: '', artists: [], genres: [], venue: null, startDate, endDate })
const ids = filters => model.filterEvents(fixture, filters).map(event => event.id)

test('calendar ranges span months and include the entire start and end dates', () => {
  assert.deepEqual(ids(range('2026-11-20', '2026-12-25')), ['opening', 'closing'])
  assert.deepEqual(ids(range('2026-12-25', '2026-12-25')), ['closing'])
  assert.deepEqual(ids({ ...range('2026-12-25', '2026-12-25'), venue: 'stage' }), ['closing'], 'Venue filters must respect an explicit calendar range')
})

test('open-ended ranges and defaults have no one-week or future-date ceiling', () => {
  assert.deepEqual(ids(range()), ['opening', 'closing', 'later'])
  assert.deepEqual(ids(range('2026-12-25')), ['closing', 'later'])
  assert.deepEqual(ids(range('', '2026-12-25')), ['opening', 'closing'])
  assert.deepEqual(ids(model.blankFilters()), ['opening', 'closing', 'later'])
  assert.equal(model.blankFilters().startDate, '')
  assert.equal(model.blankFilters().endDate, '')
  assert.equal(model.blankFilters().day, undefined)
})

test('calendar dates validate strictly without UTC shifts or impossible-day rollover', () => {
  assert.equal(typeof dates.calendarDate, 'function')
  assert.equal(typeof dates.isCalendarDate, 'function')
  assert.equal(dates.calendarDate(new Date(2026, 11, 25, 23, 59)), '2026-12-25')
  for (const value of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-1-01', 'invalid']) assert.equal(dates.isCalendarDate(value), false)
  assert.equal(dates.isCalendarDate('2028-02-29'), true)
  assert.equal(typeof model.dateRangeError, 'function')
  assert.equal(model.dateRangeError(range()), '')
  assert.ok(model.dateRangeError(range('2026-12-25', '2026-11-20')))
  assert.ok(model.dateRangeError(range('invalid')))
  assert.deepEqual(ids(range('2026-12-25', '2026-11-20')), [])
})

test('new date preferences round-trip and changing either date makes filters dirty', () => {
  const draft = range('2026-11-20', '2027-02-28')
  const saved = model.snapshotPreferences(draft, 'price')
  assert.deepEqual(model.restorePreferences(saved), { filters: draft, sort: 'price' })
  assert.equal(model.filtersEqual(draft, { ...draft, startDate: '2026-11-21' }), false)
  assert.equal(model.filtersEqual(draft, { ...draft, endDate: '2027-03-01' }), false)
  for (const bad of [{ ...saved, startDate: 'invalid' }, { ...saved, endDate: '2026-02-30' }, { ...saved, endDate: '2026-11-01' }]) assert.equal(model.restorePreferences(bad), null)
})
