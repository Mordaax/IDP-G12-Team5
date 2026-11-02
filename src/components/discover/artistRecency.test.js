import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph, circularGraph } from './catalogueGraph.js'
import { personaliseGraph } from './personalisedGraph.js'
import { NEW_ARTIST_SCALE, selectNewArtistIds, sizeNewArtistDots } from './artistRecency.js'

const catalogue = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const artists = [...catalogue.artists, { id: 'dj-beatroot' }]
const newIds = new Set(selectNewArtistIds(artists))

test('recency sample selects exactly 15 stable unique artists, excluding DJ Beatroot', () => {
  assert.equal(newIds.size, 15)
  assert.ok(!newIds.has('dj-beatroot'))
  assert.deepEqual(selectNewArtistIds([...artists].reverse()), [...newIds])
  assert.deepEqual(selectNewArtistIds([...artists, artists[0]]), [...newIds])
  assert.ok([...newIds].every(id => catalogue.artists.some(artist => artist.id === id)))
})

test('new dots grow to 1.5 times their diameter without moving centres or changing other dots', () => {
  const base = circularGraph(buildCatalogueGraph(catalogue))
  const personalised = personaliseGraph(base, ['electronic'], ['electronic--house'], catalogue.artists)
  for (const graph of [base, personalised]) {
    const before = structuredClone(graph)
    const dots = sizeNewArtistDots(graph.dots, newIds)
    assert.equal(dots.filter(dot => dot.isNewArtist).length, 15)
    dots.forEach((dot, index) => {
      const original = graph.dots[index]
      assert.equal(dot.d, original.d * (newIds.has(dot.artistId) ? NEW_ARTIST_SCALE : 1))
      assert.equal(dot.x + dot.d / 2, original.x + original.d / 2)
      assert.equal(dot.y + dot.d / 2, original.y + original.d / 2)
      assert.equal(dot.fill, original.fill)
      if (!newIds.has(dot.artistId)) assert.equal(dot, original)
    })
    assert.deepEqual(graph, before, 'Do not mutate layout, recommendations, labels or audience edges')
  }
})

test('DJ Beatroot remains completely unchanged even if accidentally passed in the new-artist set', () => {
  const dj = { artistId: 'dj-beatroot', x: 120, y: 230, d: 24, fill: '#007F9B' }
  assert.equal(sizeNewArtistDots([dj], new Set(['dj-beatroot']))[0], dj)
})
