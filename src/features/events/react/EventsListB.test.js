import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
import { eventUrl } from './eventModel.js'

let server, EventRow, EventRows, EventsProvider, catalog
before(async () => {
  assert.ok(existsSync(new URL('./EventsListB.jsx', import.meta.url)), 'The B route needs its own row-view component')
  server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    plugins: [{ name: 'row-view-session-boundary', enforce: 'pre', transform(source, id) {
      if (id.split('?')[0].endsWith('/src/features/events/react/EventMap.jsx')) return 'export default function EventMap() { return null }'
      if (!id.split('?')[0].endsWith('/src/lib/useSession.js')) return
      // Session auth is browser-only; row content and shared SaveButton remain real.
      return 'export const useSession = () => ({ signedIn: false, requireLogin() {} }); export const useSessionState = (_, initial) => [initial, () => {}];'
    } }],
  })
  const rowModule = await server.ssrLoadModule('/src/features/events/react/EventsListB.jsx')
  EventRow = rowModule.EventRow
  EventRows = rowModule.EventRows
  EventsProvider = (await server.ssrLoadModule('/src/features/events/react/EventsContext.jsx')).EventsProvider
  const { fetchEventCatalog } = await server.ssrLoadModule('/src/features/events/services/eventsService.js')
  const { USER } = await server.ssrLoadModule('/src/data/index.js')
  catalog = await fetchEventCatalog(USER.location)
})
after(async () => { await server?.close() })
const render = element => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(EventsProvider, null, element)))

test('B rows retain event metadata, exact detail links and the shared save action', () => {
  for (const event of catalog.events) {
    const html = render(createElement(EventRow, { event }))
    for (const value of [event.title, event.venue.label, event.timeLabel, event.genre.label]) {
      assert.ok(html.includes(value.replaceAll('&', '&amp;')), `Missing ${value}`)
    }
    assert.ok(html.includes(`href="${eventUrl(event.id)}"`))
    assert.equal(html.match(/datetime="([^"]+)"/i)?.[1], event.startsAt.toISOString())
    assert.ok(html.includes(event.free ? 'Free' : `$${event.price}`))
    assert.ok(html.includes(`${event.going} going`))
    assert.match(html, /aria-label="Save event" aria-pressed="false"/)
    assert.equal((html.match(/<a /g) || []).length, 1, 'One event destination, with save outside the link')
    assert.doesNotMatch(html, /event-list-card/)
  }
})

test('row results preserve supplied filtering and sort order, including empty results', () => {
  const chosen = catalog.events.slice(0, 3).reverse()
  const html = render(createElement(EventRows, { events: chosen }))
  assert.deepEqual([...html.matchAll(/data-event-row="([^"]+)"/g)].map(match => match[1]), chosen.map(event => event.id))
  assert.match(html, /aria-label="Events in row view"/)
  assert.equal((render(createElement(EventRows, { events: [] })).match(/data-event-row=/g) || []).length, 0)
})

test('B does not offer navigation back to the original card list', () => {
  const source = readFileSync(new URL('./EventsListB.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /View cards|to=\{`\/events\/list\$\{|to="\/events\/list"/)
  assert.match(source, /listTo="\/events\/list\/b"/)
})

test('B has an explicit route and leaves the existing A card route intact', () => {
  const app = readFileSync(new URL('../../../App.jsx', import.meta.url), 'utf8')
  assert.match(app, /path="list\/b" element=\{<EventsListB \/>\}/)
  assert.match(app, /path="list" element=\{<EventsList \/>\}/)
  const source = readFileSync(new URL('./EventsBrowse.jsx', import.meta.url), 'utf8')
  assert.match(source, /events-list__grid/)
  assert.match(source, /<ListCard key=\{event.id\} event=\{event\}/)
})
