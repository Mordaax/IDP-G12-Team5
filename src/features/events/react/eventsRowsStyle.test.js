import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const file = new URL('./events-rows.css', import.meta.url)
test('compact event rows use shared surface, typography and shape tokens', () => {
  assert.ok(existsSync(file), 'Design B needs its compact row stylesheet')
  const css = readFileSync(file, 'utf8')
  assert.match(css, /\.event-rows\s*\{[^}]*background:\s*var\(--lrm-surface\)/)
  assert.match(css, /\.event-rows\s*\{[^}]*border-radius:\s*var\(--lrm-radius-card\)/)
  assert.match(css, /\.event-row h2\s*\{[^}]*font-family:\s*var\(--lrm-font-display\)/)
  assert.match(css, /\.event-row__picture\s*\{[^}]*border-radius:\s*var\(--lrm-radius-control\)/)
  assert.doesNotMatch(css, /#[\da-f]{3,8}\b/i)
})
