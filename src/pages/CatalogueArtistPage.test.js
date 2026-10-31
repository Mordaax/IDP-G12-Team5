import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

// Isolate the route, session and data boundary. The real component is compiled
// by Vite and rendered by React; no browser or extra test dependency is needed.
const artist = (id, name) => ({ id, name, primaryGenreId: 'pop', genreIds: ['pop'], subgenreIds: ['dream-pop'], languages: ['English'], bio: 'Placeholder biography.', summary: 'Placeholder summary.', links: { spotify: null }, images: { avatar: null, cover: null }, metrics: { fans: null, followers: null }, releases: [], eventIds: [] })
const artists = [artist('a', 'Amber Tide'), artist('b', 'Blue Room'), artist('c', 'Cloud Song')]
const data = {
  ARTISTS: artists, ARTIST_BY_ID: Object.fromEntries(artists.map(item => [item.id, item])),
  GENRE_BY_KEY: { pop: { key: 'pop', name: 'Pop', dot: '#B01280', label: 'Pop' } },
  SUBGENRE_BY_ID: { 'dream-pop': { id: 'dream-pop', label: 'Dream pop', familyId: 'pop', colour: { css: 'hsl(318 65% 38%)' } } },
  SHARED_AUDIENCES: [
    { id: 'ac', sourceArtistId: 'c', targetArtistId: 'a', sharedListenerCount: 58, isFictional: true },
    { id: 'ab', sourceArtistId: 'a', targetArtistId: 'b', sharedListenerCount: 123, isFictional: true },
    { id: 'bc', sourceArtistId: 'b', targetArtistId: 'c', sharedListenerCount: 999, isFictional: true },
  ],
  ROUTES: { discover: '/discover', forYou: '/for-you' },
}
let server, Component
before(async () => {
  globalThis.__catalogueProfileTest = { artistId: 'a', signedIn: false, data }
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', plugins: [{
    name: 'catalogue-profile-test-boundaries', enforce: 'pre',
    transform(source, id) {
      if (!id.split('?')[0].endsWith('/CatalogueArtistPage.jsx')) return
      const actualCatalogue = id.includes('actual-catalogue')
      const stripped = source.replace(/^import .* from ['"](?:react-router-dom|@\/components\/AppLink|@\/components\/Layout|@\/data|@\/lib\/(?:useSession|toast))['"]\s*;?$/gm, line => actualCatalogue && line.includes("from '@/data'") ? line : '')
      return `import { createElement } from 'react';
const useParams = () => ({ artistId: globalThis.__catalogueProfileTest.artistId });
const useSession = () => ({ signedIn: globalThis.__catalogueProfileTest.signedIn, requireLogin: callback => { globalThis.__catalogueProfileTest.loginRequests++; if (globalThis.__catalogueProfileTest.signedIn) callback(); } });
const useSessionState = (key, initial) => { const state = globalThis.__catalogueProfileTest; state.saveKey = key; return [state.saved?.[key] ?? initial, value => { (state.saved ||= {})[key] = value; }]; };
const useShare = () => title => { globalThis.__catalogueProfileTest.shared = title; };
const useToast = () => message => { globalThis.__catalogueProfileTest.toast = message; };
const Link = ({ to, children, ...props }) => createElement('a', { ...props, href: to }, children);
const Page = ({ children }) => createElement('div', null, children);
${actualCatalogue ? '' : 'const { ARTISTS, ARTIST_BY_ID, SUBGENRE_BY_ID, GENRE_BY_KEY, SHARED_AUDIENCES, ROUTES } = globalThis.__catalogueProfileTest.data;'}
${stripped}`
    },
  }] })
  Component = (await server.ssrLoadModule('/src/pages/CatalogueArtistPage.jsx')).default
})
after(async () => { await server?.close(); delete globalThis.__catalogueProfileTest })
function render(artistId = 'a', signedIn = false) {
  Object.assign(globalThis.__catalogueProfileTest, { artistId, signedIn })
  return renderToStaticMarkup(createElement(Component))
}

test('renders catalogue identity, colour, language and honest empty states', () => {
  const html = render()
  for (const text of ['Amber Tide', 'Pop', 'Dream pop', 'English', 'Placeholder biography.', 'No releases yet', 'No upcoming events', 'No past events']) assert.ok(html.includes(text), `Missing ${text}`)
  assert.match(html, /#B01280/)
  assert.match(html, />AT</)
  assert.doesNotMatch(html, /href="#|>0<|2,946|999/)
  assert.equal((html.match(/disabled=""/g) || []).length, 0)
  assert.doesNotMatch(html, /link not available|No artist links added yet|opacity-40/)
  assert.match(html, /https:\/\/open.spotify.com\/search\/Amber%20Tide/)
  assert.equal((html.match(/src="\/assets\/icons\/social-/g) || []).length, 4)
  assert.match(html, /fictional/i)
})

test('shows sorted undirected pairwise shared audiences without an invented total', () => {
  const html = render()
  assert.ok(html.indexOf('Blue Room') < html.indexOf('Cloud Song'))
  assert.match(html, /href="\/artists\/b"/)
  assert.match(html, /href="\/artists\/c"/)
  assert.match(html, /123/)
  assert.match(html, /58/)
  assert.match(html, /not additive/i)
  assert.doesNotMatch(html, /181|999|unique listeners/)
})

test('unknown and missing IDs show a Discover recovery route for the session', () => {
  assert.match(render('missing'), /Artist not found/)
  globalThis.__catalogueProfileTest.artistId = undefined
  assert.match(renderToStaticMarkup(createElement(Component)), /Artist not found/)
  assert.match(render('toString'), /Artist not found/)
  assert.match(render('missing'), /href="\/discover"/)
  assert.match(render('', true), /Artist not found/)
  assert.match(render('missing', true), /href="\/for-you"/)
})

test('renders every approved catalogue artist using the real data exports', async () => {
  const actual = await server.ssrLoadModule('/src/data/index.js')
  const ActualComponent = (await server.ssrLoadModule('/src/pages/CatalogueArtistPage.jsx?actual-catalogue')).default
  assert.equal(actual.ARTISTS.length, 101)
  for (const item of actual.ARTISTS) {
    Object.assign(globalThis.__catalogueProfileTest, { artistId: item.id, signedIn: false })
    const html = renderToStaticMarkup(createElement(ActualComponent))
    const escapedName = renderToStaticMarkup(createElement('span', null, item.name)).replace(/^<span>|<\/span>$/g, '')
    assert.ok(html.includes(escapedName), `Missing catalogue identity: ${item.id}`)
    assert.doesNotMatch(html, /Artist not found/)
    if (item.languageStatus === 'instrumental-demo') assert.match(html, />Instrumental</, `Missing instrumental metadata: ${item.id}`)
    const edges = actual.SHARED_AUDIENCES.filter(edge => edge.sourceArtistId === item.id || edge.targetArtistId === item.id)
    assert.equal((html.match(/ shared listeners/g) || []).length, edges.length, `Wrong connection count: ${item.id}`)
  }
})

test('matches the reference profile hierarchy and toolbar rather than a right-column profile header', () => {
  const html = render()
  assert.match(html, /Back to Artists/)
  assert.match(html, /Follow artist/)
  assert.match(html, /Share/)
  assert.match(html, /href="\/forum\/artists"/)
  assert.match(html, /Forum threads/)
  const sidebar = html.match(/<aside[\s\S]*?<\/aside>/)?.[0] || ''
  for (const text of ['Artist · Singapore', 'Amber Tide', 'Placeholder biography.', 'Genres &amp; Subgenres', 'listeners on LittleRedMusic', 'Not available']) assert.ok(sidebar.includes(text), `Missing sidebar ${text}`)
  assert.match(sidebar, /<h1[^>]*text-\[32px\]/)
  const content = html.slice(html.indexOf('</aside>'))
  const titles = [...content.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(match => match[1])
  assert.deepEqual(titles.slice(0, 4), ['Albums &amp; Singles', 'Upcoming Events', 'Past Events', 'Connected artists'])
  assert.doesNotMatch(content, /<h1|About the artist/)
  assert.match(content, /gap-\[40px\]/)
  assert.doesNotMatch(html, /Tracks of the Woods|BattleBox|DJ Beatroot/)
})

test('save controls remount per artist so session state cannot leak across profile navigation', () => {
  const source = readFileSync(new URL('./CatalogueArtistPage.jsx', import.meta.url), 'utf8')
  assert.match(source, /<SaveArtistButton key=\{artist.id\} artist=\{artist\}/)
})

function elements(node) {
  if (!node || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(elements)
  if (typeof node.type === 'function') return elements(node.type(node.props))
  return [node, ...elements(node.props?.children)]
}

test('save requires login, stays artist-specific, toggles, and share uses the current identity', () => {
  const state = globalThis.__catalogueProfileTest
  Object.assign(state, { artistId: 'a', signedIn: false, saved: {}, loginRequests: 0 })
  const buttons = () => elements(Component()).filter(node => node.type === 'button')
  buttons().find(node => 'aria-pressed' in node.props).props.onClick()
  assert.equal(state.loginRequests, 1)
  assert.deepEqual(state.saved, {})
  state.signedIn = true
  buttons().find(node => 'aria-pressed' in node.props).props.onClick()
  assert.equal(state.saved['artist.a.saved'], true)
  assert.equal(buttons().find(node => 'aria-pressed' in node.props).props['aria-pressed'], true)
  state.artistId = 'b'
  assert.equal(buttons().find(node => 'aria-pressed' in node.props).props['aria-pressed'], false)
  buttons().find(node => 'aria-pressed' in node.props).props.onClick()
  assert.equal(state.saved['artist.b.saved'], true)
  buttons().find(node => node.props.children?.includes?.('Share')).props.onClick()
  assert.equal(state.shared, 'Blue Room')
  state.artistId = 'a'
  buttons().find(node => 'aria-pressed' in node.props).props.onClick()
  assert.equal(state.saved['artist.a.saved'], false)
  assert.equal(state.saved['artist.b.saved'], true)
})

test('preserves fixed viewport-fit columns and semantic radii', () => {
  const source = readFileSync(new URL('./CatalogueArtistPage.jsx', import.meta.url), 'utf8')
  assert.match(source, /grid-cols-\[320px_minmax\(0,1fr\)\]/)
  assert.doesNotMatch(source, /(?:sm|md|lg):grid-cols-|setViewportFit/)
  for (const token of ['max-w-[1440px]', 'rounded-card', 'rounded-panel', 'rounded-control']) assert.ok(source.includes(token), `Missing ${token}`)
})
