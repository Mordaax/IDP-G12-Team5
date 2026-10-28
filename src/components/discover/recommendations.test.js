import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { recommendedSongsFor } from './recommendations.js'

const { artists } = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
test('taste genres change the recommended artists', () => {
  const electronic = recommendedSongsFor(artists, ['electronic'])
  const rock = recommendedSongsFor(artists, ['rock'])
  assert.equal(electronic.length, 6)
  assert.ok(electronic.every(row => row.artist.primaryGenreId === 'electronic'))
  assert.ok(rock.every(row => row.artist.primaryGenreId === 'rock'))
  assert.equal(new Set(electronic.map(row => row.artist.id)).size, 6)
})
test('specific subgenre choices rank ahead of broad genre matches', () => {
  const rows = recommendedSongsFor(artists, ['electronic'], ['electronic--techno'])
  assert.ok(rows[0].artist.subgenreIds.includes('electronic--techno'))
  assert.ok(rows.every(row => row.artist.primaryGenreId === 'electronic'))
})

test('all selected families get recommendations even when another family has exact child matches', () => {
  const rows = recommendedSongsFor(artists, ['electronic', 'punk-metal'], ['electronic--house'])
  assert.equal(rows.filter(row => row.artist.primaryGenreId === 'electronic').length, 3)
  assert.equal(rows.filter(row => row.artist.primaryGenreId === 'punk-metal').length, 3)
})

test('recommendations never fill spare slots with an unselected genre', () => {
  const rows = recommendedSongsFor(artists, ['traditional'], ['electronic--house'])
  assert.ok(rows.every(row => row.artist.primaryGenreId === 'traditional'))
  const scarce = artists.filter(artist => artist.primaryGenreId === 'traditional').slice(0, 2)
  assert.equal(recommendedSongsFor([...scarce, ...artists.filter(artist => artist.primaryGenreId === 'electronic')], ['traditional']).length, 2)
})

test('all seven selected genres are represented', () => {
  const families = [...new Set(artists.map(artist => artist.primaryGenreId))]
  const rows = recommendedSongsFor(artists, families)
  assert.deepEqual([...new Set(rows.map(row => row.artist.primaryGenreId))].sort(), families.sort())
})

test('every artist gets a stable song title instead of a preview placeholder', async () => {
  const { artistTrackTitle } = await import('./recommendations.js')
  assert.equal(typeof artistTrackTitle, 'function')
  assert.equal(artistTrackTitle({ id: 'dj-beatroot' }), 'Track of the Woods')
  for (const artist of artists) {
    const title = artistTrackTitle(artist)
    assert.ok(title.length > 3)
    assert.doesNotMatch(title, /preview/i)
    assert.equal(title, artistTrackTitle(artist))
  }
  assert.ok(recommendedSongsFor(artists, ['rock']).every(row => !/preview/i.test(row.title)))
})
test('recommendation counts vary within a compact range and cover every selected family', async () => {
  const { randomRecommendationCount } = await import('./recommendations.js')
  assert.equal(randomRecommendationCount(2, () => 0), 3)
  assert.equal(randomRecommendationCount(2, () => .999), 8)
  assert.equal(randomRecommendationCount(7, () => 0), 7)
  for (const count of [3, 5, 8]) {
    const rows = recommendedSongsFor(artists, ['electronic', 'punk-metal'], [], count)
    assert.equal(rows.length, count)
    assert.equal(new Set(rows.map(row => row.artist.id)).size, count)
    assert.deepEqual([...new Set(rows.map(row => row.artist.primaryGenreId))].sort(), ['electronic', 'punk-metal'])
  }
})
