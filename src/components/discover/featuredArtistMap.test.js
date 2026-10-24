import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'
import { personaliseGraph } from './personalisedGraph.js'
import { preferredGenreIds, preferredSubgenreIds } from '../../lib/tasteProfile.js'

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
    const child = data.SUBGENRE_BY_ID['electronic--synthwave']
    assert.ok(child, 'Synthwave must be a canonical Electronic subgenre')
    assert.equal(dot.fill, child.colour.css)
    assert.equal(dot.foreground, child.colour.foreground)
    assert.equal(dot.labelColour, child.colour.textCss)
    assert.ok(ELECTRONIC.dots.some(dot => dot.artistId === artist.id))
    assert.equal(WEB.dots.length, data.ARTISTS.length)
  })
  test('DJ Beatroot has the canonical Synthwave tag and matches the innermost personalised circle', () => {
    const artist = data.ARTIST_BY_ID['dj-beatroot']
    const child = data.SUBGENRE_BY_ID['electronic--synthwave']
    assert.ok(child)
    assert.equal(child.familyId, 'electronic')
    assert.equal(child.label, 'Synthwave')
    assert.deepEqual(artist.subgenreIds, [child.id])
    assert.equal(WEB.dots.find(dot => dot.artistId === artist.id).subgenre, 'Synthwave')
    const picks = ['Synthwave']
    const graph = personaliseGraph(WEB, preferredGenreIds(picks, data.ARTIST_CATALOGUE), preferredSubgenreIds(picks, data.ARTIST_CATALOGUE), data.ARTISTS)
    assert.equal(graph.dots.find(dot => dot.artistId === artist.id).matchTier, 'subgenre')
    const broad = personaliseGraph(WEB, ['electronic'], [], data.ARTISTS)
    assert.equal(broad.dots.find(dot => dot.artistId === artist.id).matchTier, 'genre')
  })
  test('adding the featured EDM artist preserves every original artist, dot and audience edge', () => {
    const original = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url), 'utf8'))
    const base = buildCatalogueGraph(original)
    for (const artist of original.artists) assert.deepEqual(data.ARTIST_BY_ID[artist.id], artist)
    for (const dot of base.dots) assert.deepEqual(WEB.dots.find(item => item.artistId === dot.artistId), dot)
    assert.deepEqual(WEB.edges.filter(edge => edge.sourceArtistId !== 'dj-beatroot' && edge.targetArtistId !== 'dj-beatroot'), original.sharedAudiences)
    const featured = WEB.dots.find(dot => dot.artistId === 'dj-beatroot')
    assert.ok(featured, 'The new artist needs their own dot')
    for (const other of base.dots) assert.ok(Math.hypot(featured.x - other.x, featured.y - other.y) >= 52)
    const nearestTwo = (dot, dots) => dots.filter(other => other.artistId !== dot.artistId)
      .sort((a, b) => Math.hypot(dot.x - a.x, dot.y - a.y) - Math.hypot(dot.x - b.x, dot.y - b.y) || a.artistId.localeCompare(b.artistId))
      .slice(0, 2).map(other => other.artistId)
    for (const dot of base.dots) assert.deepEqual(nearestTwo(dot, WEB.dots), nearestTwo(dot, base.dots))
    assert.deepEqual(WEB, buildCatalogueGraph(data.ARTIST_CATALOGUE))
  })
  test('DJ Beatroot has exactly three persisted connections to the nearest other EDM artists', () => {
    const featured = WEB.dots.find(dot => dot.artistId === 'dj-beatroot')
    const nearest = WEB.dots.filter(dot => dot.genre === 'electronic' && dot !== featured)
      .sort((a, b) => Math.hypot(a.x - featured.x, a.y - featured.y) - Math.hypot(b.x - featured.x, b.y - featured.y) || a.artistId.localeCompare(b.artistId))
      .slice(0, 3).map(dot => dot.artistId).sort()
    const connections = data.SHARED_AUDIENCES.filter(edge => edge.sourceArtistId === featured.artistId || edge.targetArtistId === featured.artistId)
    assert.equal(connections.length, 3)
    assert.deepEqual(connections.map(edge => edge.sourceArtistId === featured.artistId ? edge.targetArtistId : edge.sourceArtistId).sort(), nearest)
    assert.equal(new Set(connections.map(edge => edge.id)).size, 3)
    for (const edge of connections) {
      assert.equal(edge.isFictional, true)
      assert.ok(Number.isInteger(edge.sharedListenerCount) && edge.sharedListenerCount > 0)
      assert.ok(WEB.edges.includes(edge))
      assert.ok(ELECTRONIC.edges.includes(edge))
    }
    const persisted = JSON.parse(readFileSync(new URL('../../data/featuredArtistConnections.json', import.meta.url), 'utf8'))
    assert.deepEqual(connections, persisted)
    assert.equal(WEB.edges.length, 73)
  })
} finally {
  await server.close()
}
