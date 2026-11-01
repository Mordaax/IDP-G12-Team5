import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./ArtistPage.jsx', import.meta.url), 'utf8')

test('artist page and Discover mini card use one shared social row', () => {
  for (const file of ['./ArtistPage.jsx', './CatalogueArtistPage.jsx', '../components/discover/WebOfDots.jsx']) {
    const code = readFileSync(new URL(file, import.meta.url), 'utf8')
    assert.match(code, /<ArtistSocialLinks/)
  }
})

test('artist overview shows profile beside all three sections instead of tabs', () => {
  assert.match(source, /(?<!:)grid-cols-\[320px_minmax\(0,1fr\)\]/)
  assert.doesNotMatch(source, /(?:lg|sm):grid-cols-/)
  for (const heading of ['Albums &amp; Singles', 'Upcoming Events', 'Past Events', 'Genres &amp; Subgenres']) {
    assert.ok(source.includes(heading), `Missing ${heading}`)
  }
  assert.doesNotMatch(source, /tab ===|TABS|const glass/)
  assert.match(source, /IMG\.fallingAvatar/)
  assert.match(source, /<ArtistSocialLinks/)
  assert.match(source, /listeners on LittleRedMusic/)
  assert.match(source, /Prototype count/)
})

test('release artwork preserves proportions and header actions use text only', () => {
  assert.match(source, /className="group relative flex aspect-\[4\/3\] w-full/)
  const actions = source.slice(source.indexOf('<div className="flex flex-wrap gap-[8px]">'), source.indexOf('<div className="grid items-start'))
  assert.doesNotMatch(actions, /<svg|♥|♡/)
  for (const label of ['Follow artist', 'Share', 'Forum threads']) assert.ok(actions.includes(label))
})

test('featured artist social links use its canonical record', () => {
  assert.match(source, /<ArtistSocialLinks artist=\{ARTIST_BY_ID\['dj-beatroot'\]\}/)
})

test('artist overview preserves actions, genre colours and accessible work previews', () => {
  for (const token of ['requireLogin', 'setSaved', "share('DJ Beatroot')", 'ROUTES.thread', 'GENRE_BY_KEY', 'aria-pressed', 'group-focus-visible:opacity-100']) assert.ok(source.includes(token), `Missing ${token}`)
  assert.match(source, /rounded-card/)
  assert.match(source, /rounded-control/)
  assert.match(source, /No past events yet/)
  assert.match(source, /id="upcoming-events"/)
  assert.match(source, /id="past-events"/)
})

test('artist upcoming preview keeps only the earliest three shows and retains the full list link', () => {
  assert.match(source, /\.sort\(\(a, b\) => a\.dayOffset - b\.dayOffset \|\| a\.time\.localeCompare\(b\.time\)\)\s*\.slice\(0, 3\)\s*\.map/)
  assert.match(source, /See all upcoming events/)
  assert.match(source, /ROUTES\.eventsList\}\?artist=fallingislands/)
})
