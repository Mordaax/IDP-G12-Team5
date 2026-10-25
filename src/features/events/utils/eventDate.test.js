import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import db from '../../../data/db.json' with { type: 'json' }
import * as dates from './date.js'

const battlebox = db.events.events.find(event => event.id === 'fallingislands-battlebox')

test('DJ Beatroot BattleBox stays on 11 December 2026 instead of moving with today', async () => {
  assert.equal(battlebox.date, '2026-12-11')
  assert.equal(battlebox.time, '20:00')
  assert.equal(battlebox.doors, '19:30')
  assert.equal(typeof dates.eventDay, 'function')
  assert.equal(typeof dates.eventDayOffset, 'function')
  for (const today of [new Date(2026, 9, 24), new Date(2026, 11, 10), new Date(2026, 11, 12)]) {
    assert.equal(dates.calendarDate(dates.eventDay(battlebox, today)), '2026-12-11')
  }
  assert.equal(dates.eventDayOffset(battlebox, new Date(2026, 11, 10)), 1)
  assert.equal(dates.eventDayOffset(battlebox, new Date(2026, 11, 11)), 0)
  assert.equal(dates.eventDayOffset(battlebox, new Date(2026, 11, 12)), -1)
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { fetchEventCatalog } = await server.ssrLoadModule('/src/features/events/services/eventsService.js')
    const catalog = await fetchEventCatalog(db.user.location)
    const event = catalog.events.find(event => event.id === battlebox.id)
    assert.equal(dates.calendarDate(event.startsAt), '2026-12-11')
    assert.equal(dates.time12(event.startsAt), '8:00 PM')
    assert.equal(dates.calendarDate(event.doorsAt), '2026-12-11')
    assert.equal(dates.time12(event.doorsAt), '7:30 PM')
    assert.equal(event.dayOffset, dates.eventDayOffset(battlebox))
  } finally { await server.close() }
})
