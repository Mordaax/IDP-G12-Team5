import test from 'node:test'
import assert from 'node:assert/strict'
import { createCommunityDemoStore } from './communityDemo.js'

test('forum participation unlocks the listener, replies only once and links notifications to the comment', () => {
  const store = createCommunityDemoStore()
  assert.equal(store.getSnapshot().commentId, null)
  assert.deepEqual(store.getSnapshot().notifications, [])
  assert.deepEqual(store.getSnapshot().messages, [])
  store.postComment('kit-1')
  store.postComment('kit-2')
  const state = store.getSnapshot()
  assert.equal(state.commentId, 'kit-1')
  assert.equal(state.forumReplies.length, 2)
  assert.match(state.forumReplies[1].body, /recommend/i)
  assert.equal(state.notifications.length, 2)
  assert.equal(state.notifications[0].to, '/forum/battlebox#comment-kit-1')
})

test('send rejects empty or premature messages and delivers replies even with no page subscriber', () => {
  const pending = []
  const store = createCommunityDemoStore({ schedule: fn => pending.push(fn) })
  assert.equal(store.sendMessage('Hello'), false)
  store.postComment('kit-1')
  assert.equal(store.sendMessage('  '), false)
  const unsubscribe = store.subscribe(() => {})
  store.sendMessage('Any more local Synthwave recommendations?')
  unsubscribe()
  assert.deepEqual(store.getSnapshot().messages.map(m => m.from), ['me'])
  assert.equal(store.getSnapshot().messagePending, true)
  pending.shift()()
  assert.deepEqual(store.getSnapshot().messages.map(m => m.from), ['me', 'them'])
  assert.equal(store.getSnapshot().messagePending, false)
  const notification = store.getSnapshot().notifications[0]
  assert.equal(notification.type, 'Messages')
  assert.equal(notification.to, '/messages?c=joel-tan')
  store.markRead(notification.id)
  assert.equal(store.getSnapshot().notifications[0].read, true)
  assert.equal(store.getSnapshot().messageUnread, true)
  store.openMessages()
  assert.equal(store.getSnapshot().messageUnread, false)
})

test('saved artist updates follow save actions, and a fresh application starts empty', () => {
  const store = createCommunityDemoStore()
  store.setArtistSaved(true)
  store.setArtistSaved(true)
  assert.equal(store.getSnapshot().notifications.length, 1)
  assert.equal(store.getSnapshot().notifications[0].to, '/artists/dj-beatroot')
  store.setArtistSaved(false)
  assert.equal(store.getSnapshot().notifications.length, 0)
  store.postComment('kit-1')
  store.markAllRead()
  assert.ok(store.getSnapshot().notifications.every(n => n.read))
  assert.deepEqual(createCommunityDemoStore().getSnapshot().notifications, [])
  assert.deepEqual(createCommunityDemoStore().getSnapshot().messages, [])
})
