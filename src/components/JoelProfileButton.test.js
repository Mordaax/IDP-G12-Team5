import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const { default: JoelProfileButton, JoelProfileCard } = await server.ssrLoadModule('/src/components/JoelProfileButton.jsx')
  const { GENRE_BY_KEY, SUBGENRE_BY_ID } = await server.ssrLoadModule('/src/data/index.js')
  test('Joel username opens a profile rather than exposing a direct message link', () => {
    const html = renderToStaticMarkup(createElement(JoelProfileButton))
    assert.match(html, /aria-haspopup="dialog"/)
    assert.match(html, /aria-expanded="false"/)
    assert.match(html, />Joel Tan<\/button>/)
    assert.doesNotMatch(html, /href=|Message Joel Tan/)
  })
  test('Joel profile includes identity, canonical taste tags and the existing chat destination', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(JoelProfileCard, { onClose() {} })))
    assert.match(html, /Joel Tan/)
    assert.match(html, /@joeltan/)
    assert.match(html, /Always up for a synthwave gig and sharing local music finds\./)
    assert.match(html, /Electronic \/ EDM/)
    assert.match(html, /Synthwave/)
    assert.ok(html.includes(`background:${GENRE_BY_KEY.electronic.dot}`))
    assert.ok(html.includes(`background:${SUBGENRE_BY_ID['electronic--synthwave'].colour.css}`))
    assert.match(html, /href="\/messages\?c=joel-tan"/)
    assert.match(html, /aria-label="Message Joel Tan"/)
    assert.match(html, /aria-label="Close Joel Tan profile"/)
  })
} finally { await server.close() }
