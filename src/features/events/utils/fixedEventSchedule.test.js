import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import db from '../../../data/db.json' with { type: 'json' }
import { calendarDate, eventDay, isCalendarDate } from './date.js'

const confirmed = {
  'fallingislands-tinbox': ['2026-11-01', '21:00', '20:30'],
  'fallingislands-kilo': ['2026-11-07', '19:30', '19:00'],
  'dj-beatroot-esplanade-annexe': ['2026-11-29', '19:30', '19:00'],
  'dj-beatroot-aliwal': ['2026-12-06', '20:00', '19:30'],
  'fallingislands-battlebox': ['2026-12-11', '20:00', '19:30'],
  'dj-beatroot-scape': ['2026-12-13', '20:30', '20:00'],
}

test('event date resolution rejects missing dates instead of falling back to rolling offsets', () => {
  assert.throws(() => eventDay({ dayOffset: 3 }), /Invalid event date/)
  assert.throws(() => eventDay({ date: '2026-02-30' }), /Invalid event date/)
})

test('catalogue start, doors and lineup times stay identical across reload dates', async (t) => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { fetchEventCatalog } = await server.ssrLoadModule('/src/features/events/services/eventsService.js')
    t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 10, 1).getTime() })
    let baseline
    for (const today of [new Date(2026, 10, 1), new Date(2026, 11, 12), new Date(2027, 0, 15)]) {
      t.mock.timers.setTime(today.getTime())
      const { events } = await fetchEventCatalog(db.user.location)
      assert.equal(events.length, 24)
      const schedule = events.map(event => {
        const raw = db.events.events.find(raw => raw.id === event.id)
        assert.equal(calendarDate(event.startsAt), raw.date)
        assert.equal(calendarDate(event.doorsAt), raw.date)
        const hhmm = date => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
        assert.equal(hhmm(event.startsAt), raw.time)
        assert.equal(hhmm(event.doorsAt), raw.doors)
        return { id: event.id, start: event.startsAt.getTime(), doors: event.doorsAt.getTime(), sets: event.setTimes }
      })
      if (baseline) assert.deepEqual(schedule, baseline)
      else baseline = schedule
      const tinbox = events.find(event => event.id === 'fallingislands-tinbox')
      if (today.getFullYear() === 2027) assert.ok(tinbox.dayOffset < 0, 'Past shows must age, not move into the future')
    }
  } finally {
    t.mock.timers.reset()
    await server.close()
  }
})

test('every event owns a unique fixed date, including the six screenshot bookings', () => {
  const events = db.events.events
  assert.equal(events.length, 24)
  for (const event of events) {
    assert.ok(isCalendarDate(event.date), `${event.id} needs an explicit calendar date`)
    assert.equal(Object.hasOwn(event, 'dayOffset'), false, `${event.id} must not carry a rolling schedule`)
    assert.match(event.time, /^(?:[01]\d|2[0-3]):[0-5]\d$/)
    assert.match(event.doors, /^(?:[01]\d|2[0-3]):[0-5]\d$/)
    for (const today of [new Date(2026, 10, 1), new Date(2026, 11, 12), new Date(2027, 0, 15)]) {
      assert.equal(calendarDate(eventDay(event, today)), event.date)
    }
  }
  assert.equal(new Set(events.map(event => event.date)).size, events.length)
  for (const [id, expected] of Object.entries(confirmed)) {
    const event = events.find(event => event.id === id)
    assert.deepEqual([event.date, event.time, event.doors], expected, id)
  }
})
