import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'
import { genreCamera, subgenreLabels } from './genreCamera.js'
const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const base = buildCatalogueGraph(data)
const radius = dot => Math.hypot((dot.x + dot.d / 2 - 1200) / 550, (dot.y + dot.d / 2 - 550) / 350)

test('preferred family webs occupy the centre with a clear empty band before peripheral artists', async () => {
  const { personaliseGraph } = await import('./personalisedGraph.js')
  const original = structuredClone(base)
  for (const preferred of [['pop'], ['rock', 'electronic'], ['traditional'], data.genreFamilies.slice(0, 6).map(f => f.id)]) {
    const result = personaliseGraph(base, preferred)
    const inner = result.dots.filter(d => preferred.includes(d.genre))
    const outer = result.dots.filter(d => !preferred.includes(d.genre))
    assert.equal(result.dots.length, 100)
    assert.equal(inner.length, base.dots.filter(d => preferred.includes(d.genre)).length)
    assert.ok(inner.every(d => d.isPreferred && radius(d) <= result.regions.coreRadius + 0.002))
    assert.ok(outer.every(d => !d.isPreferred && radius(d) >= result.regions.peripheralRadius - 0.002))
    for (const a of inner) for (const b of outer) assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= 135)
    const { personalisedCamera } = await import('./personalisedGraph.js')
    const view = personalisedCamera(result.overviewBounds, 1440, 928)
    for (const dot of inner) assert.ok(dot.x * view.z + view.x >= 364 && (dot.x + dot.d) * view.z + view.x <= 1416 && dot.y * view.z + view.y >= 120 && (dot.y + dot.d) * view.z + view.y <= 848)
    let gap = Infinity
    for (let i = 0; i < result.dots.length; i++) for (let j = i + 1; j < result.dots.length; j++) {
      const a = result.dots[i], b = result.dots[j]
      gap = Math.min(gap, Math.hypot(a.x - b.x, a.y - b.y))
    }
    assert.ok(gap >= 44, `Dots need breathing room: ${preferred} minimum ${gap}`)
    assert.strictEqual(result.edges, base.edges)
    for (const dot of result.dots) {
      const before = base.dots.find(d => d.artistId === dot.artistId)
      for (const field of ['artistId', 'name', 'genre', 'subgenre', 'fill', 'd']) assert.equal(dot[field], before[field])
    }
  }
  assert.deepEqual(base, original)
})

test('personalisation is repeatable and unknown/empty preferences leave the default graph untouched', async () => {
  const { personaliseGraph } = await import('./personalisedGraph.js')
  assert.strictEqual(personaliseGraph(base, []), base)
  assert.strictEqual(personaliseGraph(base, ['unknown']), base)
  assert.deepEqual(personaliseGraph(base, ['pop', 'electronic']), personaliseGraph(base, ['electronic', 'pop', 'pop']))
  const reversed = personaliseGraph({ ...base, dots: [...base.dots].reverse() }, ['pop', 'electronic'])
  const sorted = graph => [...graph.dots].sort((a, b) => a.artistId.localeCompare(b.artistId))
  assert.deepEqual(sorted(reversed), sorted(personaliseGraph(base, ['pop', 'electronic'])))
})

test('all genres selected still retains every artist and connection without inventing a peripheral group', async () => {
  const { personaliseGraph } = await import('./personalisedGraph.js')
  const graph = personaliseGraph(base, data.genreFamilies.map(f => f.id))
  assert.equal(graph.dots.length, 100)
  assert.ok(graph.dots.every(d => d.isPreferred))
  assert.strictEqual(graph.edges, base.edges)
  assert.equal(graph.labels.length, 7)
})

test('genre camera shortcuts and artist-name tags work in the personalised map', async () => {
  const { personaliseGraph } = await import('./personalisedGraph.js')
  for (const preferred of [['pop'], ['electronic'], ['traditional'], ['pop', 'electronic'], data.genreFamilies.slice(0, 6).map(f => f.id), data.genreFamilies.map(f => f.id)]) {
    const graph = personaliseGraph(base, preferred)
    for (const family of data.genreFamilies) {
      const view = genreCamera(graph.dots, family.id, 1440, 928)
      const labels = subgenreLabels(graph.dots, family.id, view, 1440, 928)
      assert.equal(labels.length, graph.dots.filter(d => d.genre === family.id).length, `Missing artist tags for ${family.id} with ${preferred}`)
    }
  }
})
