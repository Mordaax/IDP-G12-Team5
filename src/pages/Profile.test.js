import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
  plugins: [{ name: 'profile-session-boundary', enforce: 'pre', transform(source, id) {
    if (id.split('?')[0].endsWith('/src/lib/useSession.js')) return 'export const useSession = () => ({ signedIn: true, signOut() {} }); export const useSessionState = (_, initial) => [typeof initial === "function" ? initial() : initial, () => {}];'
  } }],
})
try {
  const { artistProfileState } = await server.ssrLoadModule('/src/lib/session.js')
  artistProfileState.setSaved(true)
  const { default: Profile } = await server.ssrLoadModule('/src/pages/Profile.jsx')
  test('Kit profile contains only the saved DJ, one activity and empty threads/events without Following', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Profile)))
    const text = html.replace(/<[^>]*>/g, '')
    assert.match(text, /Favourites \(1\)/)
    assert.match(text, /Threads \(0\)/)
    assert.match(text, /Events \(0\)/)
    assert.doesNotMatch(text, /Following \(|Artists followed|Evanturetime|Lullaboy|Sherman Zhuo|Mindosphere|Kin Leonn|Rosa Park|Joel Tan/)
    assert.equal((html.match(/data-saved-artist="dj-beatroot"/g) || []).length, 1)
    assert.equal((text.match(/Kit Tan followed DJ Beatroot/g) || []).length, 1)
    assert.match(text, /Your next events/)
    assert.match(text, /No upcoming events yet\./)
    assert.match(text, /Artists saved/)
  })
} finally { await server.close() }
