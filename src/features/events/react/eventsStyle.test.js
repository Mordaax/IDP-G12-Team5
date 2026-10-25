import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('./events.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

test('shared Events filter keeps apply/reset and calendar controls without Save or Load', () => {
  const source = readFileSync(new URL('./EventsBrowse.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /Save preferences|Load preferences|events-filters__prefs/)
  assert.doesNotMatch(source, /Maximum distance|draft\.distance|wider distance|MAX_DISTANCE_KM|<h2>Distance<\/h2>/)
  assert.doesNotMatch(css, /events-filters__(?:range-head|ticks)/)
  assert.doesNotMatch(css, /events-filters__prefs/)
  for (const control of ['Apply filters', 'Reset filters', 'Start date', 'End date', '<GenreOptions>', '<ArtistFilter />']) assert.ok(source.includes(control), control)
})
test('all Events genre choices flow naturally without an internal scrollbar', () => {
  const source = readFileSync(new URL('./GenreOptions.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /role="scrollbar"|ResizeObserver|onScroll|onPointer/)
  assert.match(source, /aria-label="Genre options"/)
  assert.doesNotMatch(css, /events-genres__(?:scrollbar|thumb)/)
  for (const selector of ['.events-genres', '.events-filters__genres']) {
    assert.equal(declaration(selector, 'height'), undefined)
    assert.equal(declaration(selector, 'max-height'), undefined)
    assert.equal(declaration(selector, 'overflow-y'), undefined)
  }
})

// Read the actual declarations, including grouped selectors, without a browser dependency.
function declaration(selector, property) {
  let value
  for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectors.trim().split(/,(?![^()]*\))/).map(item => item.trim()).includes(selector)) continue
    for (const part of body.split(';')) {
      const colon = part.indexOf(':')
      if (part.slice(0, colon).trim() === property) value = part.slice(colon + 1).trim()
    }
  }
  return value
}

test('Events typography and geometry use the shared guide tokens', () => {
  assert.equal(declaration('.react-events', 'font-family'), 'var(--lrm-font-sans)')
  assert.equal(declaration('.react-events :is(h1, h2, h3, h4)', 'font-family'), 'var(--lrm-font-display)')
  assert.equal(declaration('.artist-filter__popup', 'font-family'), 'var(--lrm-font-sans)', 'portalled popup cannot inherit route font')
  for (const selector of ['.events-sort select', '.events-search', '.artist-filter__search', '.events-filters__apply', '.event-detail__actions > a', '.event-discussion__forum-link']) {
    assert.equal(declaration(selector, 'border-radius'), 'var(--lrm-radius-control)', selector)
  }
  for (const selector of ['.event-list-card', '.event-map-card', '.events-shell__state', '.events-filters', '.event-map']) {
    assert.equal(declaration(selector, 'border-radius'), 'var(--lrm-radius-card)', selector)
  }
  for (const selector of ['.artist-filter__popup', '.event-map__key', '.events-shell__sidebar']) {
    assert.equal(declaration(selector, 'border-radius'), 'var(--lrm-radius-overlay, 16px)', selector)
  }
})

test('Events surfaces and metadata use warm semantic tokens', () => {
  for (const selector of ['.events-sort select', '.events-filters', '.artist-filter__popup', '.event-list-card', '.event-map-card', '.event-detail']) {
    assert.equal(declaration(selector, 'background'), 'var(--lrm-surface)', selector)
  }
  assert.equal(declaration('.event-detail__about', 'color'), 'var(--lrm-muted)')
  assert.equal(declaration('.event-detail__tabs a.is-active', 'border-bottom-color'), 'var(--lrm-brand)')
  assert.equal(declaration('.view-toggle a.is-active', 'background'), 'var(--lrm-brand-tint)')
  assert.equal(declaration('.events-filters input[type=checkbox]', 'accent-color'), 'var(--lrm-brand)')
  assert.equal(declaration('.artist-filter__popup [role=option][aria-selected=true]', 'background'), 'var(--lrm-brand-tint)')
  assert.doesNotMatch(css, /#(?:555|666|777|888|999|222|e5e5e5|0c1e4add)\b/i)
})

test('Events elevation is neutral and genre colours remain data-driven', () => {
  assert.equal(declaration('.event-list-card:hover', 'box-shadow'), 'var(--lrm-shadow-card)')
  assert.equal(declaration('.event-map-card.is-active', 'border-color'), 'var(--lrm-brand)')
  assert.equal(declaration('.event-list-card__genre', 'color'), 'var(--event-genre)')
  assert.equal(declaration('.event-pin__dot', 'background'), 'var(--pin)')
  assert.equal(declaration('.react-events .events-split .event-list-card__cover', 'border-radius'), 'var(--lrm-radius-control)')
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/)
})

test('search focus remains a thin neutral outer boundary', () => {
  for (const selector of ['.artist-filter__search:focus-within', '.events-search:focus-within']) {
    assert.equal(declaration(selector, 'border-color'), 'var(--lrm-muted)')
    assert.equal(declaration(selector, 'outline'), 'none')
  }
})

test('Events primary actions use raspberry brand tokens, not neutral ink', () => {
  for (const selector of ['.events-filters__apply', '.events-shell__state button', '.event-detail__state button', '.event-detail__actions > a', '.event-discussion__forum-link']) {
    assert.equal(declaration(selector, 'background'), 'var(--lrm-brand)', selector)
    assert.equal(declaration(`${selector}:hover:not(:disabled)`, 'background'), 'var(--lrm-brand-hover)', `${selector} hover`)
    assert.equal(declaration(`${selector}:active:not(:disabled)`, 'background'), 'var(--lrm-brand-selected)', `${selector} pressed`)
  }
})
