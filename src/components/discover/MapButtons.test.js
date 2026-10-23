import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const controls = readFileSync(new URL('./MapButtons.jsx', import.meta.url), 'utf8')
const panels = readFileSync(new URL('./Panels.jsx', import.meta.url), 'utf8')

test('map controls are a bottom-right row with separate guide and grouped zoom controls', () => {
  assert.match(controls, /bottom-\[24px\] right-\[40px\]/)
  assert.match(controls, /aria-label="Map controls"/)
  assert.match(controls, />Guide</)
  assert.doesNotMatch(controls, /flex-col|left-\[36px\]/)
  assert.ok(controls.indexOf('aria-label="Zoom in"') < controls.indexOf('aria-label="Recentre"'))
  assert.ok(controls.indexOf('aria-label="Recentre"') < controls.indexOf('aria-label="Zoom out"'))
  assert.match(controls, /aria-label="Recentre"[^>]*title="Recentre"/)
  assert.match(controls, /<svg[^>]*aria-hidden="true"/)
})
test('map widgets use a compact gap and style-guide control corners', () => {
  assert.match(controls, /aria-label="Map controls"[^>]*gap-\[8px\]/)
  assert.doesNotMatch(controls, /w-\[300px\]|justify-between/)
  assert.match(controls, /aria-label="Map view"[^>]*overflow-hidden[^>]*rounded-control/)
  assert.match(controls, /title="Help & tour"[^>]*rounded-control/)
})

test('left panels retain their full height away from the controls', () => {
  assert.match(panels, /absolute bottom-\[24px\] left-\[36px\]/)
})
