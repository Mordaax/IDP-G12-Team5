import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./Panels.jsx', import.meta.url), 'utf8')
const legend = source.slice(source.indexOf('export function Legend('), source.indexOf('export function WelcomeGuide('))

test('Discover legend retains genre keys and artist dots without implementation explanations', () => {
  assert.match(legend, /DOT COLOUR = GENRE/)
  assert.match(legend, /GENRES/)
  assert.match(legend, /One dot = one artist/)
  assert.doesNotMatch(legend, /Thicker line|Punk & Metal uses greys|prototype links|Counts are fictional|Future links/)
})

test('genre widget uses camera shortcut buttons, not visibility checkboxes', () => {
  assert.doesNotMatch(source, /type="checkbox"|onToggleGenre|toggleGenreIn/)
  assert.match(source, /onNavigateGenre/)
  assert.match(source, /aria-pressed/)
  assert.match(source, /data-subgenre-key/)
})
