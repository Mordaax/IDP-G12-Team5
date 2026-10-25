import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { buildCatalogueGraph } from './catalogueGraph.js'
import { personaliseGraph, personalisedCamera } from './personalisedGraph.js'
import { genreCamera, cameraDetail, subgenreLabels } from './genreCamera.js'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
let data
try {
  ;({ ARTIST_CATALOGUE: data } = await server.ssrLoadModule('/src/data/index.js'))
} finally {
  await server.close()
}
const base = buildCatalogueGraph(data)
const families = data.genreFamilies.map(family => family.id)
for (const [name, genres, children, family, width, height] of [
  ['Traditional split across broad preferred tiers', ['punk-metal', 'traditional'], [], 'traditional', 1920, 1008],
  ['R&B split across exact-child tiers', ['pop', 'hiphop', 'rnb-soul'], ['pop--mandopop', 'hiphop--drill', 'rnb-soul--alternative-r-b'], 'rnb-soul', 1440, 928],
]) {
  test(`reported regression: ${name}`, () => {
    const graph = personaliseGraph(base, genres, children, data.artists)
    const view = genreCamera(graph.dots, family, width, height)
    assert.ok(view.z >= 1.15 && view.z <= 4, `reachable artist-detail zoom: ${view.z}`)
    assert.deepEqual(cameraDetail(graph.dots, view, width, height), { showArtists: true, genre: family })
    assert.ok(subgenreLabels(graph.dots, null, view, width, height).some(label =>
      graph.dots.find(dot => dot.artistId === label.artistId).genre === family), 'requested artist has a readable label')
  })
}
const choices = [
  ['review pop + dream pop', ['pop'], ['pop--dream-pop']],
  ['broad electronic', ['electronic'], []],
  ['mixed children', ['pop', 'electronic'], ['pop--dream-pop', 'electronic--synthwave']],
  ['synthwave child', ['electronic'], ['electronic--synthwave']],
  ['all broad families', families, []],
  ['all children', families, data.subgenres.map(child => child.id)],
]

test('all nonempty family subsets with broad, rotating-child and mixed-child tastes reach every shortcut', t => {
  const times = []
  const failures = []
  let tastes = 0
  const viewports = [[1440, 600], [1440, 928], [1440, 1616], [1920, 1008], [2560, 900]]
  const selections = []
  for (let mask = 1; mask < 2 ** families.length; mask++) {
    const genres = families.filter((_, i) => mask & (1 << i))
    const available = data.subgenres.filter(child => genres.includes(child.familyId))
    selections.push([genres, []],
      [genres, genres.map((family, i) => {
        const children = available.filter(child => child.familyId === family)
        return children[(mask + i) % children.length].id
      })],
      [genres, available.filter((_, i) => (i + mask) % 3 !== 0).map(child => child.id)])
  }
  // Every individual child is exercised too, including children absent from the
  // rotating sample. These are recognised tastes, never synthetic catalogue dots.
  for (const child of data.subgenres) selections.push([[child.familyId], [child.id]])
  for (const [genres, children] of selections) {
    tastes++
    const graph = personaliseGraph(base, genres, children, data.artists)
    const before = structuredClone(graph)
    const reversed = personaliseGraph({ ...base, dots: [...base.dots].reverse() }, [...genres].reverse(), [...children].reverse(), [...data.artists].reverse())
    const ordered = dots => [...dots].sort((a, b) => a.artistId.localeCompare(b.artistId))
    assert.deepEqual(ordered(graph.dots), ordered(reversed.dots), 'every taste is input-order independent')
    for (let i = 0; i < graph.dots.length; i++) {
      const a = graph.dots[i]
      const artist = data.artists.find(artist => artist.id === a.artistId)
      const preferred = genres.includes(a.genre)
      assert.equal(a.matchTier, preferred && artist.subgenreIds.some(id => children.includes(id)) ? 'subgenre' : preferred ? 'genre' : 'other')
      const ring = graph.regions.rings.find(ring => ring.id === a.matchTier)
      const radius = Math.hypot(a.x + a.d / 2 - graph.regions.centre.x, a.y + a.d / 2 - graph.regions.centre.y)
      assert.ok(radius >= ring.minRadius + a.d / 2 && radius <= ring.maxRadius - a.d / 2)
      for (const b of graph.dots.slice(i + 1)) {
        const gap = Math.hypot(a.x - b.x, a.y - b.y)
        assert.ok(gap >= 60, 'all artists retain minimum spacing')
        if (a.genre === b.genre && a.matchTier === b.matchTier) assert.ok(gap <= 400, 'each tier/family is compact')
      }
    }
    for (const [width, height] of viewports) {
      const view = personalisedCamera(graph.overviewBounds, width, height)
      const radius = graph.regions.rings.at(-1).maxRadius * view.z
      const cx = graph.regions.centre.x * view.z + view.x
      const cy = graph.regions.centre.y * view.z + view.y
      assert.ok(cx - radius >= 364 && cx + radius <= width - 352 && cy - radius >= 120 && cy + radius <= height - 80)
    }
    for (const [width, height] of viewports) for (const family of families) {
      const start = performance.now()
      const view = genreCamera(graph.dots, family, width, height)
      times.push(performance.now() - start)
      const detail = cameraDetail(graph.dots, view, width, height)
      const labels = view && subgenreLabels(graph.dots, null, view, width, height)
      if (!view || view.z < 1.15 || view.z > 4 || !detail.showArtists || detail.genre !== family ||
        !labels.some(label => graph.dots.find(dot => dot.artistId === label.artistId).genre === family)) {
        failures.push({ genres, children, width, height, family, view, detail })
      }
    }
    assert.deepEqual(graph, before, 'shortcut search preserves every artist, colour, tier, coordinate and edge')
  }
  times.sort((a, b) => a - b)
  t.diagnostic(JSON.stringify({ tastes, shortcuts: times.length, p95Ms: times[Math.floor(times.length * 0.95)], maxMs: times.at(-1), failures: failures.length }))
  assert.deepEqual(failures, [], 'every generated valid taste must reach readable camera-derived detail')
})

for (const [name, genres, children] of choices) {
  const graph = personaliseGraph(base, genres, children, data.artists)
  test(`${name}: navigation preserves active artists, tiers, spacing, full-region fit and relationships`, () => {
    const before = structuredClone(graph)
    assert.strictEqual(graph.edges, base.edges)
    const artists = new Map(data.artists.map(artist => [artist.id, artist]))
    for (const dot of graph.dots) {
      const artist = artists.get(dot.artistId)
      const preferred = genres.includes(dot.genre)
      const tier = preferred && artist.subgenreIds.some(id => children.includes(id)) ? 'subgenre' : preferred ? 'genre' : 'other'
      assert.equal(dot.matchTier, tier)
      const ring = graph.regions.rings.find(ring => ring.id === tier)
      const radius = Math.hypot(dot.x + dot.d / 2 - graph.regions.centre.x, dot.y + dot.d / 2 - graph.regions.centre.y)
      assert.ok(radius >= ring.minRadius + dot.d / 2 && radius <= ring.maxRadius - dot.d / 2)
      const original = base.dots.find(item => item.artistId === dot.artistId)
      for (const key of Object.keys(original).filter(key => !['x', 'y'].includes(key))) assert.deepEqual(dot[key], original[key])
      for (const other of graph.dots.filter(other => other !== dot)) assert.ok(Math.hypot(dot.x - other.x, dot.y - other.y) >= 60)
    }
    for (const [width, height] of [[1440, 928], [1440, 600], [1440, 1616], [1920, 1008]]) {
      const overview = personalisedCamera(graph.overviewBounds, width, height)
      for (const ring of graph.regions.rings) {
        const cx = graph.regions.centre.x * overview.z + overview.x
        const cy = graph.regions.centre.y * overview.z + overview.y
        const r = ring.maxRadius * overview.z
        assert.ok(cx - r >= 364 && cx + r <= width - 352 && cy - r >= 120 && cy + r <= height - 80)
      }
      for (const family of families) genreCamera(graph.dots, family, width, height)
    }
    assert.deepEqual(graph, before, 'camera navigation must not alter geometry or data')
    assert.deepEqual(base, buildCatalogueGraph(data), 'Default geometry and relationships restore exactly')
    assert.strictEqual(personaliseGraph(base, [], [], data.artists), base)
  })
  for (const [width, height] of [[1440, 928], [1440, 600], [1440, 1616], [1920, 1008]]) {
    for (const family of families) {
      test(`${name}: ${family} shortcut reaches camera-driven detail and labels at ${width}x${height}`, () => {
        assert.equal(graph.dots.length, 101)
        assert.ok(graph.dots.some(dot => dot.artistId === 'dj-beatroot'))
        const view = genreCamera(graph.dots, family, width, height)
        const detail = cameraDetail(graph.dots, view, width, height)
        assert.equal(detail.showArtists, true, `zoom ${view.z} must reveal artist detail`)
        assert.equal(detail.genre, family, 'legend must follow the actual visible family')
        const labels = subgenreLabels(graph.dots, null, view, width, height)
        assert.ok(labels.some(label => graph.dots.find(dot => dot.artistId === label.artistId).genre === family), 'focused family needs visible artist names')
        for (const label of labels) {
          const dot = graph.dots.find(dot => dot.artistId === label.artistId)
          assert.equal(label.colour, dot.labelColour ?? dot.fill)
          assert.ok(Math.abs(label.x + label.w / 2 - ((dot.x + dot.d / 2) * view.z + view.x)) < 0.001)
          assert.ok(label.y + label.h <= dot.y * view.z + view.y - 10 + 0.001)
        }
        assert.deepEqual(cameraDetail(graph.dots, { ...view, z: 1 }, width, height), { showArtists: false, genre: null }, 'manual zoom-out must clear detail without sticky genre state')
        assert.deepEqual(view, genreCamera([...graph.dots].reverse(), family, width, height))
      })
    }
  }
}