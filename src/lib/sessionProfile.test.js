import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const session = await server.ssrLoadModule('/src/lib/session.js')
  test('saving DJ Beatroot creates one profile activity and an unread update shared across views', () => {
    assert.equal(typeof session.createArtistProfileState, 'function')
    const storage = new Map()
    const read = (key, fallback) => storage.has(key) ? storage.get(key) : fallback
    const write = (key, value) => storage.set(key, value)
    const store = session.createArtistProfileState(read, write)
    assert.deepEqual(store.getSnapshot(), { saved: false, hasActivity: false, unread: false })
    let notifications = 0
    const unsubscribe = store.subscribe(() => notifications++)
    store.setSaved(true)
    assert.deepEqual(store.getSnapshot(), { saved: true, hasActivity: true, unread: true })
    assert.equal(storage.get('artist.fallingislands.saved'), true)
    assert.equal(notifications, 1)
    const restored = session.createArtistProfileState(read, write)
    assert.deepEqual(restored.getSnapshot(), store.getSnapshot())
    store.markSeen()
    assert.deepEqual(store.getSnapshot(), { saved: true, hasActivity: true, unread: false })
    store.setSaved(true)
    assert.equal(store.getSnapshot().unread, false, 'Saving an already-saved artist is not a new activity')
    store.setSaved(false)
    assert.deepEqual(store.getSnapshot(), { saved: false, hasActivity: true, unread: false })
    store.setSaved(true)
    assert.deepEqual(store.getSnapshot(), { saved: true, hasActivity: true, unread: true })
    unsubscribe()
    const snapshot = store.getSnapshot()
    assert.equal(store.getSnapshot(), snapshot, 'External-store snapshots stay stable between updates')
  })
} finally { await server.close() }
