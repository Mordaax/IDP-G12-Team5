import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const { fetchEventCatalog } = await server.ssrLoadModule('/src/features/events/services/eventsService.js')
  const { GENRES, USER } = await server.ssrLoadModule('/src/data/index.js')
  const { blankFilters, filterEvents } = await server.ssrLoadModule('/src/features/events/react/eventModel.js')
  test('event filters and cards share Discover genre families, order and colours', async () => {
    const { genres, events } = await fetchEventCatalog(USER.location)
    assert.deepEqual(genres.map(genre => genre.label), ['Pop', 'Rock & Alternative', 'Punk & Metal', 'Hip-Hop', 'R&B / Soul', 'Electronic / EDM', 'Traditional'])
    assert.deepEqual(genres.map(genre => genre.hex), GENRES.map(genre => genre.dot))
    assert.ok(events.every(event => event.genre === genres.find(genre => genre.id === event.genreId)))
    assert.ok(events.filter(event => event.genreId === 'electronic').every(event => event.searchText.includes('electronic / edm')))
  })
  test('Pop filtering includes Mandopop events with the Pop card colour', async () => {
    const { events } = await fetchEventCatalog(USER.location)
    const popEvents = filterEvents(events, { ...blankFilters(), genres: ['pop'] })
    assert.ok(popEvents.some(event => event.tags.includes('mandopop')), 'Mandopop events remain discoverable under Pop')
    assert.ok(popEvents.every(event => event.genre.label === 'Pop' && event.genre.hex === '#DC167C'))
    assert.ok(filterEvents(events, { ...blankFilters(), genres: ['punk-metal'] }).length === 0)
  })
  test('water-adjacent venues use their OneMap building locations', async () => {
    const { venues } = await fetchEventCatalog(USER.location)
    for (const [id, lat, lng] of [['kilo', 1.30307515150401, 103.8731497075906], ['bay-east', 1.290902253944687, 103.8687643036791], ['clarke-quay', 1.288838562482049, 103.8465580247433]]) {
      const venue = venues.find(item => item.id === id)
      assert.ok(Math.abs(venue.lat - lat) < .00001, id)
      assert.ok(Math.abs(venue.lng - lng) < .00001, id)
    }
  })
} finally { await server.close() }
