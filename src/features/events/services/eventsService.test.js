import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const { fetchEventCatalog } = await server.ssrLoadModule('/src/features/events/services/eventsService.js')
  const { GENRE_BY_KEY, USER } = await server.ssrLoadModule('/src/data/index.js')
  test('event genre names match Discover throughout the hydrated catalogue', async () => {
    const { genres, events } = await fetchEventCatalog(USER.location)
    const labels = new Map(genres.map(genre => [genre.id, genre.label]))
    assert.equal(labels.get('indie-rock'), GENRE_BY_KEY.rock.name)
    assert.equal(labels.get('pop'), GENRE_BY_KEY.pop.name)
    assert.equal(labels.get('electronic'), GENRE_BY_KEY.electronic.name)
    assert.equal(labels.get('traditional'), GENRE_BY_KEY.traditional.name)
    assert.equal(labels.get('mandopop'), 'Mandopop')
    assert.ok(events.every(event => event.genre.label === labels.get(event.genreId)))
    assert.ok(events.filter(event => event.genreId === 'electronic').every(event => event.searchText.includes('electronic / edm')))
  })
} finally { await server.close() }
