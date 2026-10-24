import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as model from './eventModel.js'
import db from '../../../data/db.json' with { type: 'json' }

test('DJ Beatroot BattleBox uses the new event URL without changing its saved identity', () => {
  assert.equal(typeof model.eventUrl, 'function')
  assert.equal(typeof model.eventIdFromSlug, 'function')
  assert.equal(model.eventUrl('fallingislands-battlebox'), '/events/djbeatroot-battlebox')
  assert.equal(model.eventIdFromSlug('djbeatroot-battlebox'), 'fallingislands-battlebox')
  assert.equal(model.eventIdFromSlug('fallingislands-battlebox'), 'fallingislands-battlebox')
  assert.equal(db.routes.event, '/events/djbeatroot-battlebox')
  assert.equal(db.routes.eventForum, '/events/djbeatroot-battlebox/discussions')
  assert.ok(db.events.events.some(event => event.id === 'fallingislands-battlebox'))
  assert.equal(model.eventUrl('lullaboy-live-battlebox'), '/events/lullaboy-live-battlebox')
})

test('event discussions offer a prominent full-thread action instead of inline commenting', () => {
  const source = readFileSync(new URL('./EventDetail.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /Add a comment|Cancel comment|Write a comment|composerOpen|useAttachments|const reply/)
  assert.match(source, /className="event-discussion__forum-link" to=\{topicUrl\(forumTopic\)\}/)
  assert.match(source, /Open the full thread in Forum/)
  assert.match(source, /eventIdFromSlug/)
  assert.match(source, /<Navigate[^>]*replace/)
})

test('forum ticket CTA says Get tickets without changing its destination', () => {
  const source = readFileSync(new URL('../../../pages/Thread.jsx', import.meta.url), 'utf8')
  assert.match(source, /topicId === 'battlebox' \? 'Get tickets' : 'VIEW EVENT'/)
  assert.match(source, /topicId === 'battlebox' \? ROUTES\.thanks : eventUrl\(topic\.eventId\)/)
  assert.doesNotMatch(source, /buy tickets/i)
})
