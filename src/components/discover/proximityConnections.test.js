import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'

const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const dots = buildCatalogueGraph(data).dots
const distance = (a, b) => Math.hypot(a.x + a.d / 2 - b.x - b.d / 2, a.y + a.d / 2 - b.y - b.d / 2)

export function assertLocalNetwork(edges) {
  const byId = new Map(dots.map(dot => [dot.artistId, dot]))
  const nearest = new Map(dots.map(a => [a.artistId, dots.filter(b => b !== a)
    .sort((b, c) => distance(a, b) - distance(a, c) || b.artistId.localeCompare(c.artistId))
    .slice(0, 2).map(b => b.artistId)]))
  const degrees = new Map(dots.map(dot => [dot.artistId, 0]))
  const pairs = new Set(), ids = new Set()
  for (const edge of edges) {
    const { sourceArtistId: a, targetArtistId: b } = edge
    assert.ok(byId.has(a) && byId.has(b))
    assert.notEqual(a, b)
    const key = [a, b].sort().join('|')
    assert.ok(!pairs.has(key) && !ids.has(edge.id))
    pairs.add(key); ids.add(edge.id)
    assert.ok(nearest.get(a).includes(b) || nearest.get(b).includes(a), `${a} and ${b} are not nearest-two from either endpoint`)
    degrees.set(a, degrees.get(a) + 1); degrees.set(b, degrees.get(b) + 1)
    assert.ok(Number.isInteger(edge.sharedListenerCount) && edge.sharedListenerCount > 0)
    assert.equal(edge.isFictional, true)
  }
  assert.equal([...degrees.values()].filter(n => n > 0).length, dots.length)
  assert.ok([...degrees.values()].filter(n => n === 2).length >= 40)
  assert.ok([...degrees.values()].every(n => n >= 1 && n <= 2))
  return degrees
}

test('saved connections involve every artist, at least 40% with two links, and only first/second nearest neighbours from either endpoint', () => {
  const degrees = assertLocalNetwork(data.sharedAudiences)
  assert.equal(new Set(dots.filter(dot => degrees.get(dot.artistId) > 0).map(dot => dot.genre)).size, 7)
})

test('seeded random connections are reproducible, input-order independent and spatially constrained', async () => {
  const { generateProximityConnections } = await import('./proximityConnections.js')
  const first = generateProximityConnections(dots, { seed: 91273 })
  assert.deepEqual(first, generateProximityConnections([...dots].reverse(), { seed: 91273 }))
  assert.notDeepEqual(first, generateProximityConnections(dots, { seed: 91274 }))
  for (const seed of [1, 42, 91273, 91274]) assertLocalNetwork(generateProximityConnections(dots, { seed }))
})

test('proximity generation uses centres and does not mutate or reposition dots', async () => {
  const { generateProximityConnections } = await import('./proximityConnections.js')
  const original = structuredClone(dots)
  generateProximityConnections(dots, { seed: 42 })
  assert.deepEqual(dots, original)
  const transformed = dots.map(dot => ({ ...dot, x: (dot.x + dot.d / 2) * 2 + 10 - dot.d / 2,
    y: (dot.y + dot.d / 2) * 2 + 20 - dot.d / 2 }))
  assert.deepEqual(generateProximityConnections(transformed, { seed: 42 }), generateProximityConnections(dots, { seed: 42 }))
})

test('connection strokes are slightly thicker while retaining audience-based variation', async () => {
  const { audienceLineWidth } = await import('./catalogueGraph.js')
  const previous = count => Math.max(0.65, Math.min(2.8, 0.65 + Math.sqrt(Math.max(0, count) / 2400) * 2.15))
  for (const count of [0, 40, 400, 800, 2400]) {
    assert.ok(Math.abs(audienceLineWidth(count) - previous(count) * 1.3) < 1e-9)
  }
  assert.ok(audienceLineWidth(800) > audienceLineWidth(40))
})
