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

test('forum leads back to event details for the external ticket handoff', async () => {
  const { createServer } = await import('vite')
  const { createElement } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { MemoryRouter } = await import('react-router-dom')
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    // Attachment location maps depend on a browser window; this test renders only
    // the thread's navigation and does not open an attachment map.
    plugins: [{ name: 'thread-browser-map-boundary', enforce: 'pre', transform(code, id) {
      if (id.split('?')[0].endsWith('/src/components/Attachments.jsx')) return code.replace(/import L from ['"]leaflet['"]/, 'const L = {}')
    } }],
  })
  try {
    const { default: Thread } = await server.ssrLoadModule('/src/pages/Thread.jsx')
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Thread)))
    assert.doesNotMatch(html, /View event &amp; tickets/)
    assert.match(html, /See event details/)
    assert.match(html, /href="\/events\/djbeatroot-battlebox"/)
    assert.doesNotMatch(html, /href="\/thanks"/)
    assert.doesNotMatch(html, />ARTIST<\/span>/)
    assert.match(html, /aria-label="Author genres"/)
    assert.match(html, /Electronic \/ EDM/)
    assert.match(html, /Synthwave/)
  } finally { await server.close() }
})
