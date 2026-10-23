import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source = readFileSync(new URL('./ForYou.jsx', import.meta.url), 'utf8')

test('Discover offers top-right labelled toggle buttons above the playlist, without a dropdown', () => {
  assert.doesNotMatch(source, /<select|<option/)
  assert.match(source, /role="group" aria-label="Map view"/)
  assert.match(source, /aria-pressed=\{mode === value\}/)
  assert.match(source, /Personalised map/)
  assert.match(source, /Default map/)
  assert.match(source, /absolute right-\[40px\] top-\[24px\][^"]*flex-col items-end/)
  assert.match(source, /right-\[40px\] top-\[108px\]/)
})

test('personalised Discover reads saved preferences and does not show a hardcoded taste profile', () => {
  assert.match(source, /loadTasteProfile/)
  assert.match(source, /preferredGenreIds/)
  assert.match(source, /personaliseGraph/)
  assert.doesNotMatch(source, /<TasteChips/)
  assert.match(source, /disabled=\{value === 'personalised' && !hasPreferences\}/)
})

test('edit taste profile is an accessible icon with a hover and focus tooltip', () => {
  assert.match(source, /aria-label="Edit taste profile"/)
  assert.match(source, /aria-describedby=/)
  assert.match(source, /role="tooltip"/)
  assert.match(source, /onMouseEnter=/)
  assert.match(source, /onFocus=/)
  assert.match(source, /Escape/)
})

test('playlist and reopen button share the map controls right edge', () => {
  const controls = readFileSync(new URL('../components/discover/MapButtons.jsx', import.meta.url), 'utf8')
  const rightInset = controls.match(/aria-label="Map controls"[^>]*\bright-\[([^\]]+)\]/)[1]
  const playlist = source.slice(source.indexOf('{panelOpen ?'))
  const insets = [...playlist.matchAll(/\bright-\[([^\]]+)\]/g)].map(match => match[1])
  assert.deepEqual(insets, [rightInset, rightInset])
})

test('preferred genre labels include small decorative catalogue-coloured dots', () => {
  assert.match(source, /aria-label="Preferred genres"/)
  assert.match(source, /preferred\.map\(id => <span key=\{id\}/)
  assert.match(source, /aria-hidden="true" className="size-\[6px\] shrink-0 rounded-full" style=\{\{ background: GENRE_BY_KEY\[id\]\.dot \}\}/)
})

test('map modes and genre navigation leave playlist visibility under user control', () => {
  const toggle = source.slice(source.indexOf('role="group"'), source.indexOf('<DiscoverMenu'))
  const shortcuts = source.slice(source.indexOf('<DiscoverMenu'), source.indexOf('{guideOpen &&'))
  assert.doesNotMatch(toggle, /setPanelOpen/)
  assert.doesNotMatch(shortcuts, /setPanelOpen/)
})
