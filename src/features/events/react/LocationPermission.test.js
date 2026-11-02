import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

test('permission screen explains the optional choice and exposes both actions', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  try {
    const { default: LocationPermission } = await server.ssrLoadModule('/src/features/events/react/LocationPermission.jsx')
    const html = renderToStaticMarkup(createElement(LocationPermission, { onRequest() {}, onSkip() {} }))
    assert.match(html, /role="dialog"/)
    assert.match(html, /aria-modal="true"/)
    for (const copy of ['Find gigs near you', 'Use my location', 'Continue without location', 'You can still explore all events without sharing your location.']) assert.ok(html.includes(copy))
  } finally { await server.close() }
})
