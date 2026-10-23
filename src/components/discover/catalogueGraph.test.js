import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const modelUrl = new URL('./catalogueGraph.js', import.meta.url)
test('Discover lays out one stable dot per catalogue artist with all exact audience edges', async () => {
  assert.ok(existsSync(modelUrl), 'Discover needs a database-driven layout')
  const { buildCatalogueGraph } = await import(modelUrl)
  const graph = buildCatalogueGraph(data)
  assert.equal(graph.dots.length, 100)
  assert.equal(new Set(graph.dots.map(d => d.artistId)).size, 100)
  assert.equal(graph.edges.length, data.sharedAudiences.length)
  assert.equal(graph.labels.length, 7)
  assert.deepEqual(graph, buildCatalogueGraph(data))
  const byId = new Map(graph.dots.map(d => [d.artistId, d]))
  for (const edge of graph.edges) {
    assert.ok(byId.has(edge.sourceArtistId) && byId.has(edge.targetArtistId))
    assert.equal(edge.sharedListenerCount, data.sharedAudiences.find(e => e.id === edge.id).sharedListenerCount)
  }
  for (const dot of graph.dots) {
    const artist = data.artists.find(a => a.id === dot.artistId)
    const child = data.subgenres.find(s => s.id === artist.subgenreIds[0])
    assert.equal(dot.name, artist.name)
    assert.equal(dot.genre, artist.primaryGenreId)
    assert.equal(dot.fill, child.colour.css)
    assert.equal(dot.d, 24, 'uniform readable dots, not invented popularity sizes')
    assert.ok(dot.x > 450 && dot.x + dot.d < 1980 && dot.y > 30 && dot.y + dot.d < 1080)
  }
})

test('the web spreads out with breathing room rather than tight repeated rings', async () => {
  const { buildCatalogueGraph } = await import(modelUrl)
  const { dots } = buildCatalogueGraph(data)
  const xs = dots.map(dot => dot.x), ys = dots.map(dot => dot.y)
  assert.ok(Math.max(...xs) - Math.min(...xs) > 1200)
  assert.ok(Math.max(...ys) - Math.min(...ys) > 850)
  let minimum = Infinity
  for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
    minimum = Math.min(minimum, Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y))
  }
  assert.ok(minimum >= 48, `Dots need clear spacing, actual minimum ${minimum}`)
})

test('within-family spacing is irregular, reproducible and independent of input order', async () => {
  const { buildCatalogueGraph } = await import(modelUrl)
  const graph = buildCatalogueGraph(data)
  const reordered = buildCatalogueGraph({ ...data, artists: [...data.artists].reverse(), sharedAudiences: [...data.sharedAudiences].reverse() })
  assert.deepEqual(graph.dots, reordered.dots)
  let irregular = 0
  for (const family of data.genreFamilies) {
    const members = graph.dots.filter(dot => dot.genre === family.id)
    const gaps = members.map(a => Math.min(...members.filter(b => b !== a).map(b => Math.hypot(a.x - b.x, a.y - b.y))))
    const mean = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length
    const variation = Math.sqrt(gaps.reduce((sum, gap) => sum + (gap - mean) ** 2, 0) / gaps.length) / mean
    if (variation >= 0.12) irregular++
  }
  assert.ok(irregular >= 6, `Most families need varied gaps, only ${irregular} do`)
})

test('the organic web does not flatten multiple dots onto identical viewport edges', async () => {
  const { buildCatalogueGraph } = await import(modelUrl)
  const { dots } = buildCatalogueGraph(data)
  for (const axis of ['x', 'y']) {
    const counts = new Map()
    for (const dot of dots) counts.set(dot[axis], (counts.get(dot[axis]) || 0) + 1)
    assert.ok(Math.max(...counts.values()) <= 2, `Repeated ${axis} positions create a rigid boundary row`)
  }
})

test('map geometry is independent of audience links so proximity can drive future connections', async () => {
  const { buildCatalogueGraph } = await import(modelUrl)
  const empty = buildCatalogueGraph({ ...data, sharedAudiences: [] })
  const edge = { id: 'proximity-regression-pair', sourceArtistId: data.artists[0].id,
    targetArtistId: data.artists.at(-1).id, sharedListenerCount: 100, isFictional: true }
  const linked = buildCatalogueGraph({ ...data, sharedAudiences: [edge] })
  assert.deepEqual(linked.dots, empty.dots, 'connections must not reposition the dots used to select them')
  assert.deepEqual(linked.labels, empty.labels)
  assert.deepEqual(linked.edges, [edge], 'only explicitly persisted connections may render')
})
