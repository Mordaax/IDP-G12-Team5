import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const data = await server.ssrLoadModule('/src/data/index.js')
  const { WEB, ELECTRONIC } = await server.ssrLoadModule('/src/components/discover/graphs.js')
  test('DJ Beatroot appears exactly once on the Electronic / EDM map and catalogue', () => {
    const artist = data.ARTISTS.find(artist => artist.name === 'DJ Beatroot')
    assert.ok(artist, 'DJ Beatroot must be part of the active roster, not just legacy event fixtures')
    assert.equal(artist.id, 'dj-beatroot')
    assert.equal(artist.primaryGenreId, 'electronic')
    assert.equal(artist.images.avatar, '/assets/img/dj-beatroot.png')
    assert.equal(data.ARTISTS.filter(artist => artist.name === 'DJ Beatroot').length, 1)
    const dot = WEB.dots.find(dot => dot.artistId === artist.id)
    assert.ok(dot)
    assert.equal(dot.genre, 'electronic')
    assert.equal(dot.avatar, artist.images.avatar)
    assert.equal(dot.fill, data.GENRE_BY_KEY.electronic.dot)
    assert.ok(ELECTRONIC.dots.some(dot => dot.artistId === artist.id))
    assert.equal(WEB.dots.length, data.ARTISTS.length)
  })
  test('adding the featured EDM artist preserves every original artist, dot and audience edge', () => {
    const original = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url), 'utf8'))
    const base = buildCatalogueGraph(original)
    for (const artist of original.artists) assert.deepEqual(data.ARTIST_BY_ID[artist.id], artist)
    for (const dot of base.dots) assert.deepEqual(WEB.dots.find(item => item.artistId === dot.artistId), dot)
    assert.deepEqual(WEB.edges, original.sharedAudiences)
    const featured = WEB.dots.find(dot => dot.artistId === 'dj-beatroot')
    assert.ok(featured, 'The new artist needs their own dot')
    for (const other of base.dots) assert.ok(Math.hypot(featured.x - other.x, featured.y - other.y) >= 52)
    const nearestTwo = (dot, dots) => dots.filter(other => other.artistId !== dot.artistId)
      .sort((a, b) => Math.hypot(dot.x - a.x, dot.y - a.y) - Math.hypot(dot.x - b.x, dot.y - b.y) || a.artistId.localeCompare(b.artistId))
      .slice(0, 2).map(other => other.artistId)
    for (const dot of base.dots) assert.deepEqual(nearestTwo(dot, WEB.dots), nearestTwo(dot, base.dots))
    assert.deepEqual(WEB, buildCatalogueGraph(data.ARTIST_CATALOGUE))
  })
} finally {
  await server.close()
}
