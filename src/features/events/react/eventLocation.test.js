import test from 'node:test'
import assert from 'node:assert/strict'

const load = () => import('./eventLocation.js')

test('demo location stays optional and uses Kit’s canonical fixed coordinates', async () => {
  const { readFileSync } = await import('node:fs')
  const { user } = JSON.parse(readFileSync(new URL('../../../data/db.json', import.meta.url), 'utf8'))
  const { createDemoEventLocation } = await load()
  const location = createDemoEventLocation(user.location)
  assert.deepEqual(location.getSnapshot(), { status: 'unasked', location: null })
  location.skip()
  assert.equal(location.getSnapshot().location, null)
  location.request()
  assert.deepEqual(location.getSnapshot(), { status: 'granted', location: { lat: 1.295, lng: 103.849 } })
})

test('unsupported geolocation stays usable without a personal position', async () => {
  const { createEventLocation } = await load()
  const location = createEventLocation(null)
  location.request()
  assert.deepEqual(location.getSnapshot(), { status: 'unavailable', location: null })
})

test('timeout reports unavailable and subscribers can unsubscribe', async () => {
  const { createEventLocation } = await load()
  const location = createEventLocation({ getCurrentPosition(ok, fail) { fail({ code: 3 }) } })
  let updates = 0
  const unsubscribe = location.subscribe(() => updates++)
  location.request()
  assert.equal(location.getSnapshot().status, 'unavailable')
  assert.equal(updates, 2)
  unsubscribe()
  location.request()
  assert.equal(updates, 2)
})

test('location starts optional and requests the browser only after an explicit action', async () => {
  const { createEventLocation } = await load()
  let success, failure, calls = 0
  const location = createEventLocation({ getCurrentPosition(ok, fail) { calls++; success = ok; failure = fail } })
  assert.equal(location.getSnapshot().status, 'unasked')
  assert.equal(location.getSnapshot().location, null)
  assert.equal(calls, 0)
  location.skip()
  assert.equal(location.getSnapshot().status, 'skipped')
  assert.equal(calls, 0)
  location.request()
  assert.equal(calls, 1)
  assert.equal(location.getSnapshot().status, 'requesting')
  location.request()
  assert.equal(calls, 1)
  success({ coords: { latitude: 1.3, longitude: 103.8 } })
  assert.deepEqual(location.getSnapshot().location, { lat: 1.3, lng: 103.8 })
  assert.equal(location.getSnapshot().status, 'granted')
  location.request()
  failure({ code: 1 })
  assert.equal(location.getSnapshot().location, null)
  assert.equal(location.getSnapshot().status, 'denied')
})
