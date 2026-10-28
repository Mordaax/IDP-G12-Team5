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
  assert.equal(state.forumReplies[1].body, "i'll be going for this one! dm me if you wanna go together!")
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

const conversation = [
  ['me', 'Hi Joel, would you like to attend the event together? Will you be going with anybody else?'],
  ['them', 'Hey Kit! Yes I am a regular to DJ Beatroot’s events! We have a group that usually attends these events together, would you like to come with us?'],
  ['me', 'Yes! That’ll be great! Where and when do you guys meet before the event?'],
  ['them', "We usually meet 30 minutes before the event at the venue! You can join us there!"],
  ['me', "Sounds good! Excited to meet y’all!"],
]

test('Joel conversation types Kit drafts and plays the exact dialogue once in order', () => {
  const queue = []
  const store = createCommunityDemoStore({ schedule: (fn, delay) => queue.push({ fn, delay }) })
  assert.equal(typeof store.startConversation, 'function')
  store.startConversation()
  assert.equal(queue.length, 0, 'Forum participation still unlocks Joel')
  store.postComment('kit-1')
  store.startConversation()
  store.startConversation()
  let sawPartial = false
  let sawTyping = false
  let ticks = 0
  while (queue.length) {
    assert.ok(++ticks < 1000, 'Playback terminates')
    queue.shift().fn()
    const state = store.getSnapshot()
    sawPartial ||= state.messageDraft?.length > 0 && state.messageDraft.length < conversation[0][1].length
    sawTyping ||= state.messagePending
  }
  assert.ok(sawPartial)
  assert.ok(sawTyping)
  assert.deepEqual(store.getSnapshot().messages.map(m => [m.from, m.text]), conversation)
  assert.equal(store.getSnapshot().messageDraft, '')
  assert.equal(store.getSnapshot().conversationComplete, true)
  store.startConversation()
  assert.equal(queue.length, 0, 'No replay or duplicate messages')
})

test('manual send after stopping a pending first Joel reply delivers recommendations without a stale duplicate', () => {
  const queue = []
  const store = createCommunityDemoStore({ schedule: fn => queue.push(fn) })
  store.postComment('kit-1')
  store.startConversation()
  let ticks = 0
  while (store.getSnapshot().messages.length === 0) {
    assert.ok(++ticks < 1000, 'First outgoing message is delivered')
    assert.ok(queue.length)
    queue.shift()()
  }
  assert.deepEqual(store.getSnapshot().messages.map(m => [m.from, m.text]), [conversation[0]])
  assert.equal(store.getSnapshot().messagePending, true)
  assert.equal(queue.length, 1, 'First Joel reply is still queued')

  store.stopConversation()
  assert.equal(store.sendMessage('Any more local recommendations, Joel?'), true)
  assert.equal(queue.length, 2, 'Stale autoplay reply and manual reply are queued')
  while (queue.length) {
    assert.ok(++ticks < 1000, 'Queued replies terminate')
    queue.shift()()
  }

  const state = store.getSnapshot()
  assert.deepEqual(state.messages.filter(m => m.from === 'them').map(m => m.text), [conversation[1][1]])
  assert.equal(state.messages.some(m => m.text === conversation[3][1]), false)
  assert.equal(state.messages.length, 3, 'No duplicate stale autoplay reply')
  assert.equal(state.notifications.filter(n => n.type === 'Messages').length, 1)
  assert.equal(state.messagePending, false)
})

test('conversation pauses on navigation, resumes without duplicates and stops for user input', () => {
  const queue = []
  const store = createCommunityDemoStore({ schedule: fn => queue.push(fn) })
  store.postComment('kit-1')
  store.startConversation()
  queue.shift()()
  const partial = store.getSnapshot().messageDraft
  store.pauseConversation()
  while (queue.length) queue.shift()()
  assert.equal(store.getSnapshot().messageDraft, partial)
  assert.deepEqual(store.getSnapshot().messages, [])
  store.startConversation()
  while (queue.length && store.getSnapshot().messages.length < 1) queue.shift()()
  assert.equal(store.getSnapshot().messages.length, 1)
  store.stopConversation()
  while (queue.length) queue.shift()()
  store.startConversation()
  assert.equal(queue.length, 0)
  assert.equal(store.getSnapshot().messages.length, 1)
})
