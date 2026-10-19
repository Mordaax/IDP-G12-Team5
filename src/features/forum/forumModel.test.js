import test from 'node:test'
import assert from 'node:assert/strict'
import { countComments, sortComments, visibleTopics } from './forumModel.js'

const topics = [
  { id: 'a', category: 'events', title: 'BattleBox show', body: 'Live music', createdAt: 10, votes: 5 },
  { id: 'b', category: 'artists', title: 'Local artists', body: 'Fresh sounds', createdAt: 20, votes: 2 },
  { id: 'c', category: 'events', title: 'Gamelan show', body: 'Outdoor concert', createdAt: 30, votes: 9 },
]

test('forum categories, saved view, and search return the right topics', () => {
  assert.deepEqual(visibleTopics(topics, 'events', '', []).map(topic => topic.id), ['c', 'a'])
  assert.deepEqual(visibleTopics(topics, 'saved', '', ['b']).map(topic => topic.id), ['b'])
  assert.deepEqual(visibleTopics(topics, 'all', 'gamelan', []).map(topic => topic.id), ['c'])
})

test('forum topic sorting and nested comment counts use live votes', () => {
  const comments = [
    { id: 'older', minutesAgo: 60, votes: 12, replies: [{ id: 'reply', votes: 1 }] },
    { id: 'newer', minutesAgo: 10, votes: 2 },
  ]
  assert.deepEqual(sortComments(comments, 'newest', {}).map(comment => comment.id), ['newer', 'older'])
  assert.deepEqual(sortComments(comments, 'best', { newer: 20 }).map(comment => comment.id), ['newer', 'older'])
  assert.equal(countComments(comments, [{ id: 'mine' }]), 4)
})
