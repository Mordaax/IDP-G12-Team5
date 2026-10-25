import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'
import { personaliseGraph, personalisedCamera } from './personalisedGraph.js'
import { genreCamera, subgenreLabels } from './genreCamera.js'
const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const base = buildCatalogueGraph(data)
const distance = (dot, centre) => Math.hypot(dot.x + dot.d / 2 - centre.x, dot.y + dot.d / 2 - centre.y)

const layout = (genres, children = []) => personaliseGraph(base, genres, children, data.artists)

test('each family stays in a compact local cluster within its match ring', () => {
  for (const genres of [['rock', 'rnb-soul', 'traditional'], data.genreFamilies.map(f => f.id)]) {
    const graph = layout(genres)
    for (const ring of graph.regions.rings) for (const family of data.genreFamilies) {
      const members = graph.dots.filter(dot => dot.matchTier === ring.id && dot.genre === family.id)
      for (const a of members) for (const b of members) {
        assert.ok(Math.hypot(a.x - b.x, a.y - b.y) <= 400,
          `${family.id} in ${ring.id} must not wrap around successive full-circle lanes`)
      }
    }
  }
})

test('personalised circles separate subgenre matches, genre-only matches and other genres', () => {
  const original = structuredClone(base)
  const graph = layout(['pop', 'electronic'], ['pop--dream-pop', 'electronic--house'])
  assert.deepEqual(graph.regions.rings.map(ring => ring.id), ['subgenre', 'genre', 'other'])
  assert.equal(graph.regions.rings.length, 3)
  const artists = new Map(data.artists.map(artist => [artist.id, artist]))
  const counts = { subgenre: 0, genre: 0, other: 0 }
  for (const dot of graph.dots) {
    const artist = artists.get(dot.artistId)
    const preferred = ['pop', 'electronic'].includes(artist.primaryGenreId)
    const exact = preferred && artist.subgenreIds.some(id => ['pop--dream-pop', 'electronic--house'].includes(id))
    const tier = exact ? 'subgenre' : preferred ? 'genre' : 'other'
    assert.equal(dot.matchTier, tier)
    assert.equal(dot.isPreferred, preferred)
    const ring = graph.regions.rings.find(ring => ring.id === tier)
    const r = distance(dot, graph.regions.centre)
    assert.ok(r >= ring.minRadius + dot.d / 2 && r <= ring.maxRadius - dot.d / 2)
    counts[tier]++
    const before = base.dots.find(item => item.artistId === dot.artistId)
    for (const field of ['artistId', 'name', 'genre', 'subgenre', 'fill', 'd']) assert.equal(dot[field], before[field])
  }
  assert.ok(Object.values(counts).every(count => count > 0))
  for (const ring of graph.regions.rings) assert.equal(ring.count, counts[ring.id])
  assert.strictEqual(graph.edges, base.edges)
  assert.deepEqual(base, original)
})

test('broad genres alone leave the exact-match circle empty; all genres leave the outer ring empty', () => {
  const broad = layout(['electronic'])
  assert.equal(broad.regions.rings[0].count, 0)
  assert.ok(broad.dots.filter(dot => dot.genre === 'electronic').every(dot => dot.matchTier === 'genre'))
  const all = layout(data.genreFamilies.map(family => family.id), data.subgenres.map(child => child.id))
  assert.ok(all.dots.every(dot => dot.matchTier === 'subgenre'))
  assert.equal(all.regions.rings[1].count, 0)
  assert.equal(all.regions.rings[2].count, 0)
})

test('personalisation is repeatable, order-independent and ignores unrelated child selections', () => {
  assert.strictEqual(layout([]), base)
  assert.strictEqual(layout(['unknown']), base)
  const expected = layout(['pop', 'electronic'], ['pop--dream-pop', 'electronic--house'])
  assert.deepEqual(layout(['electronic', 'pop', 'pop'], ['electronic--house', 'pop--dream-pop']), expected)
  const reverse = personaliseGraph({ ...base, dots: [...base.dots].reverse() }, ['pop', 'electronic'], ['pop--dream-pop', 'electronic--house'], [...data.artists].reverse())
  const sorted = graph => [...graph.dots].sort((a, b) => a.artistId.localeCompare(b.artistId))
  assert.deepEqual(sorted(reverse), sorted(expected))
  assert.deepEqual(layout(['pop'], ['electronic--house']), layout(['pop']))
})

test('concentric tiers keep readable dot spacing and fit all three rings into the opening camera', () => {
  for (const genres of [['pop'], ['electronic'], ['pop', 'electronic'], data.genreFamilies.map(f => f.id)]) {
    const graph = layout(genres, ['pop--dream-pop', 'electronic--house'])
    assert.equal(graph.dots.length, data.artists.length)
    for (let i = 0; i < graph.dots.length; i++) for (let j = i + 1; j < graph.dots.length; j++) {
      assert.ok(Math.hypot(graph.dots[i].x - graph.dots[j].x, graph.dots[i].y - graph.dots[j].y) >= 60)
    }
    for (const [width, height] of [[1440, 928], [1440, 600], [1920, 1008]]) {
      const view = personalisedCamera(graph.overviewBounds, width, height)
      for (const dot of graph.dots) assert.ok(dot.x * view.z + view.x >= 364 && (dot.x + dot.d) * view.z + view.x <= width - 352 && dot.y * view.z + view.y >= 120 && (dot.y + dot.d) * view.z + view.y <= height - 80)
    }
  }
})

test('genre camera shortcuts and artist labels remain available in concentric mode', () => {
  const graph = layout(['pop', 'electronic'], ['pop--dream-pop'])
  for (const family of data.genreFamilies) {
    const view = genreCamera(graph.dots, family.id, 1440, 928)
    assert.ok(Number.isFinite(view.z) && view.z > 0)
    const labels = subgenreLabels(graph.dots, family.id, view, 1440, 928)
    assert.ok(labels.length > 0, `Missing artist tags for ${family.id}`)
  }
})
