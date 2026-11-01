import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

// Render the actual sidebar, not a locale-dependent input attribute.
test('Events date fields display Singapore dates independently of the browser locale', async () => {
  const server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
    plugins: [{ name: 'date-field-boundaries', enforce: 'pre', transform(source, id) {
      const path = id.split('?')[0]
      if (path.endsWith('/EventsBrowse.jsx')) return source.replace('function FilterSidebar(', 'export function FilterSidebar(')
      if (path.endsWith('/EventMap.jsx')) return 'export default function EventMap() { return null }'
      if (path.endsWith('/EventsContext.jsx')) return `export const useEvents = () => ({ draft: { startDate: '2026-11-20', endDate: '2026-12-25', genres: [], artists: [] }, genres: [], artists: [], events: [], results: [], dirty: true, dateError: '', updateDraft() {} })`
    } }],
  })
  try {
    const { FilterSidebar } = await server.ssrLoadModule('/src/features/events/react/EventsBrowse.jsx')
    const { openDatePicker } = await server.ssrLoadModule('/src/features/events/react/DateRangeInput.jsx')
    assert.equal(typeof openDatePicker, 'function', 'The full date-input surface must explicitly open its picker')
    let opens = 0
    const target = { showPicker() { assert.equal(this, target); opens++ } }
    openDatePicker({ currentTarget: target })
    assert.equal(opens, 1)
    assert.doesNotThrow(() => openDatePicker({ currentTarget: {} }))
    assert.equal(typeof FilterSidebar, 'function', 'The real date filter must be testable')
    const html = renderToStaticMarkup(createElement(FilterSidebar, { onApplied() {} }))
    assert.match(html, /type="text"[^>]*aria-label="Start date"[^>]*value="20\/11\/2026"/)
    assert.match(html, /type="text"[^>]*aria-label="End date"[^>]*value="25\/12\/2026"/)
    assert.equal((html.match(/placeholder="DD\/MM\/YYYY"/g) || []).length, 2)
    assert.match(html, /type="date"[^>]*aria-label="Choose start date"[^>]*max="2026-12-25"[^>]*value="2026-11-20"/)
    assert.match(html, /type="date"[^>]*aria-label="Choose end date"[^>]*min="2026-11-20"[^>]*value="2026-12-25"/)
  } finally { await server.close() }
})
