import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const url = new URL('./artists.json', import.meta.url)
test('active catalogue imports exactly the approved 100 artists and the approved sparse proximity network', () => {
  assert.ok(existsSync(url), 'the approved artist database must be imported')
  const data = JSON.parse(readFileSync(url, 'utf8'))
  const byId = new Map(data.artists.map(a => [a.id, a]))
  assert.equal(data.artists.length, 100)
  assert.equal(byId.size, 100)
  assert.equal(data.genreFamilies.length, 7)
  assert.equal(data.subgenres.length, 29)
  assert.ok(data.sharedAudiences.length > 0)
  assert.equal(data.sharedAudienceModel.status, 'generated-proximity-fixture')
  assert.equal(data.sharedAudienceModel.connectionBasis, 'physical-proximity')
  assert.equal(data.sharedAudienceModel.distanceMetric, 'euclidean-map-centres')
  assert.equal(data.sharedAudienceModel.rebuildPolicy, 'explicit-offline-only')
  assert.equal(data.sharedAudienceModel.nearestNeighbourLimit, 2)
  assert.equal(data.sharedAudienceModel.requireMutualProximity, false)
  assert.equal(data.sharedAudienceModel.minimumConnectionsPerArtist, 1)
  assert.equal(data.sharedAudienceModel.maximumConnectionsPerArtist, 2)
  assert.equal(data.sharedAudienceModel.summary.connections, data.sharedAudiences.length)
  assert.equal(data.sharedAudienceModel.summary.connectedArtists, 100)
  assert.equal(data.sharedAudienceModel.summary.allArtistsHaveConnections, true)
  assert.ok(data.sharedAudienceModel.summary.twoConnectionArtists >= 40)
  assert.equal(data.sharedAudienceModel.minimumConnectedArtistFraction, 1)
  assert.equal(data.sharedAudienceModel.minimumTwoConnectionArtistFraction, 0.4)
  assert.equal(data.sharedAudienceModel.summary.isolatedArtists, 100 - data.sharedAudienceModel.summary.connectedArtists)
  assert.equal(data.sharedAudienceModel.summary.minDegree, 1)
  assert.equal(data.sharedAudienceModel.summary.maxDegree, 2)
  assert.equal(data.sharedAudienceModel.summary.all100ArtistsConnected, false)
  assert.ok(!('targetWithinGenreShare' in data.sharedAudienceModel), 'genre quotas must not determine connections')
  assert.ok(Number.isInteger(data.sharedAudienceModel.generationSeed))
  const subgenres = new Map(data.subgenres.map(s => [s.id, s]))
  for (const artist of data.artists) {
    assert.ok(artist.isFictional)
    assert.ok(artist.subgenreIds.every(id => subgenres.get(id)?.familyId === artist.primaryGenreId))
    assert.ok(Object.values(artist.links).every(link => link === null))
  }
})

test('saved proximity fixture exactly replays from the documented seed and unchanged geometry', async () => {
  const data = JSON.parse(readFileSync(url, 'utf8'))
  const { buildCatalogueGraph } = await import('../components/discover/catalogueGraph.js')
  const { generateProximityConnections } = await import('../components/discover/proximityConnections.js')
  const dots = buildCatalogueGraph(data).dots
  assert.deepEqual(data.sharedAudiences, generateProximityConnections(dots, { seed: data.sharedAudienceModel.generationSeed }))
  const byId = new Map(data.artists.map(a => [a.id, a]))
  const within = data.sharedAudiences.filter(e => byId.get(e.sourceArtistId).primaryGenreId === byId.get(e.targetArtistId).primaryGenreId).length
  assert.equal(data.sharedAudienceModel.summary.withinGenre, within)
  assert.equal(data.sharedAudienceModel.summary.crossGenre, data.sharedAudiences.length - within)
})
