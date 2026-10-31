import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
  plugins: [{ name: 'profile-session-boundary', enforce: 'pre', transform(source, id) {
    if (id.split('?')[0].endsWith('/src/features/events/react/EventsContext.jsx')) return `
      import { fetchEventCatalog } from '../services/eventsService'
      import { USER } from '@/data'
      import { sessionGet } from '@/lib/session'
      const catalog = await fetchEventCatalog(USER.location)
      export const useEvents = () => ({ ...catalog, saved: new Set(sessionGet('lrm.savedEvents', [])), loading: false, error: '' })
    `
    if (id.split('?')[0].endsWith('/src/pages/Profile.jsx')) return source.replace("useState('favourites')", "useState(sessionGet('test.profile.tab', 'favourites'))").replace("import { useEffect, useState }", "import { sessionGet } from '@/lib/session'\nimport { useEffect, useState }")
    if (id.split('?')[0].endsWith('/src/lib/useSession.js')) return 'export const useSession = () => ({ signedIn: true, signOut() {} }); export const useSessionState = (_, initial) => [typeof initial === "function" ? initial() : initial, () => {}];'
  } }],
})
try {
  const { artistProfileState, sessionSet } = await server.ssrLoadModule('/src/lib/session.js')
  const { saveTasteProfile } = await server.ssrLoadModule('/src/lib/tasteProfile.js')
  artistProfileState.setSaved(true)
  const { default: Profile } = await server.ssrLoadModule('/src/pages/Profile.jsx')
  test('saved events populate the profile count and link without implying attendance', () => {
    sessionSet('test.profile.tab', 'events')
    sessionSet('lrm.savedEvents', ['fallingislands-battlebox', 'missing-event'])
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Profile)))
    const text = html.replace(/<[^>]*>/g, '')
    assert.match(text, /Events \(1\)/)
    assert.match(text, /Events saved/)
    assert.match(html, /href="\/events\/djbeatroot-battlebox"/)
    assert.match(html, /data-saved-event="fallingislands-battlebox"/)
    assert.doesNotMatch(text, /Events attended|No saved events yet|friends going|Kit Tan is going/)
    assert.match(text, /Threads \(0\)/)
    sessionSet('lrm.savedEvents', [])
    const empty = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Profile)))
    assert.match(empty, /Events \(0\)/)
    assert.match(empty, /No saved events yet\./)
    assert.doesNotMatch(empty, /data-saved-event=/)
    sessionSet('test.profile.tab', 'favourites')
  })
  test('Kit profile contains only the saved DJ, one activity and empty threads/events without Following', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Profile)))
    const text = html.replace(/<[^>]*>/g, '')
    assert.match(text, /Followed \(1\)/)
    assert.match(text, /Threads \(0\)/)
    assert.match(text, /Events \(0\)/)
    assert.doesNotMatch(text, /Following \(|Evanturetime|Lullaboy|Sherman Zhuo|Mindosphere|Kin Leonn|Rosa Park|Joel Tan/)
    assert.equal((html.match(/data-saved-artist="dj-beatroot"/g) || []).length, 1)
    assert.equal((text.match(/Kit Tan followed DJ Beatroot/g) || []).length, 1)
    assert.match(text, /Your next events/)
    assert.match(text, /No upcoming events yet\./)
    assert.match(text, /Artists followed/)
    assert.match(text, /Forum threads saved/)
    assert.match(text, /1Profile tags/)
    assert.match(text, /#Electronic \/ EDM/)
    assert.doesNotMatch(text, /#alt-pop|#mandopop|#indie rock|#lo-fi|Favourites|Artists saved|Forum posts/)
  })
  test('profile tags and count follow saved taste selections, including none', () => {
    saveTasteProfile({ selected: ['Electronic / EDM', 'Synthwave', 'Punk & Metal', 'Metalcore'], songs: ['City To Burn'] })
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Profile)))
    const text = html.replace(/<[^>]*>/g, '')
    assert.match(text, /4Profile tags/)
    assert.match(text, /#Electronic \/ EDM#Synthwave#Punk &amp; Metal/)
    assert.match(text, /\+1 more/)
    saveTasteProfile({ selected: [], songs: ['City To Burn'] })
    const empty = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Profile))).replace(/<[^>]*>/g, '')
    assert.match(empty, /0Profile tags/)
    assert.doesNotMatch(empty.split('Edit profile')[0], /#edm|#synthwave|#Electronic/)
  })
} finally { await server.close() }
