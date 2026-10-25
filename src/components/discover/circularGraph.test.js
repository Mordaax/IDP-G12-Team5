import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as model from './catalogueGraph.js'
import { genreCamera, cameraDetail } from './genreCamera.js'
import { personaliseGraph } from './personalisedGraph.js'

const catalogue = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))

test('personalisation retains genre positions and brings only the playlist artists into the shaded centre', () => {
  const base = model.circularGraph(model.buildCatalogueGraph(catalogue))
  const ids = ['demo-phase-canopy', 'demo-gridwake', 'demo-peachlift', 'demo-meterform', 'demo-june-in-stereo', 'demo-void-receipt']
  const personalised = personaliseGraph(base, ['rock', 'electronic'], [], catalogue.artists, ids)
  assert.deepEqual(personalised.overviewBounds, base.overviewBounds)
  assert.deepEqual(personalised.labels, base.labels)
  assert.ok(personalised.recommendationArea)
  for (const dot of personalised.dots) {
    const original = base.dots.find(item => item.artistId === dot.artistId)
    assert.equal(dot.d, original.d)
    const dx = dot.x + dot.d / 2 - 1200, dy = dot.y + dot.d / 2 - 550
    const oldX = original.x + original.d / 2 - 1200, oldY = original.y + original.d / 2 - 550
    if (!ids.includes(dot.artistId)) {
      assert.ok(Math.hypot(dx, dy) - dot.d / 2 > personalised.recommendationArea.radius)
      assert.ok(Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - Math.atan2(oldY, oldX)), Math.cos(Math.atan2(dy, dx) - Math.atan2(oldY, oldX)))) < .35)
    } else {
      assert.ok(Math.hypot(dx, dy) + dot.d / 2 < personalised.recommendationArea.radius)
    }
  }
  assert.strictEqual(personalised.edges, base.edges)
  assert.deepEqual(personalised.dots.map(dot => dot.artistId), base.dots.map(dot => dot.artistId))
})

test('a single preferred genre fills the centre rather than leaving half the circle vacant', () => {
  const base = model.circularGraph(model.buildCatalogueGraph(catalogue))
  const personalised = personaliseGraph(base, ['electronic'], [], catalogue.artists)
  const selected = personalised.dots.filter(dot => dot.isRecommended)
  const xs = selected.map(dot => dot.x + dot.d / 2 - 1200)
  const ys = selected.map(dot => dot.y + dot.d / 2 - 550)
  assert.ok(Math.min(...xs) < -50 && Math.max(...xs) > 50)
  assert.ok(Math.min(...ys) < -50 && Math.max(...ys) > 50)
  assert.ok(selected.some(dot => Math.hypot(dot.x + dot.d / 2 - 1200, dot.y + dot.d / 2 - 550) < 25))
})

test('the default map has artists in the centre before personalisation clears it', () => {
  const base = model.circularGraph(model.buildCatalogueGraph(catalogue))
  assert.ok(base.dots.filter(dot => Math.hypot(dot.x + dot.d / 2 - 1200, dot.y + dot.d / 2 - 550) < 130).length >= 5)
})

test('every genre occupies its own pizza section reaching from near the centre to the rim', () => {
  const graph = model.circularGraph(model.buildCatalogueGraph(catalogue))
  const width = Math.PI * 2 / graph.labels.length
  for (const [index, label] of graph.labels.entries()) {
    const centreAngle = -Math.PI / 2 + index * width
    const radii = []
    for (const dot of graph.dots.filter(dot => dot.genre === label[6])) {
      const dx = dot.x + dot.d / 2 - 1200, dy = dot.y + dot.d / 2 - 550
      const delta = Math.atan2(Math.sin(Math.atan2(dy, dx) - centreAngle), Math.cos(Math.atan2(dy, dx) - centreAngle))
      assert.ok(Math.abs(delta) <= width / 2, `${label[6]} must stay within its section`)
      radii.push(Math.hypot(dx, dy))
    }
    assert.ok(Math.min(...radii) < 230, `${label[6]} needs dots close to the centre`)
    assert.ok(Math.max(...radii) > 400, `${label[6]} needs dots near the rim`)
  }
})

test('the displayed web has a circular footprint while preserving artist and audience data', () => {
  assert.equal(typeof model.circularGraph, 'function')
  const base = model.buildCatalogueGraph(catalogue)
  const snapshot = structuredClone(base)
  const circle = model.circularGraph(base)
  assert.deepEqual(base, snapshot)
  assert.deepEqual(circle.edges, base.edges)
  assert.deepEqual(circle, model.circularGraph(base))
  const xs = circle.dots.map(dot => dot.x + dot.d / 2)
  const ys = circle.dots.map(dot => dot.y + dot.d / 2)
  const aspect = (Math.max(...xs) - Math.min(...xs)) / (Math.max(...ys) - Math.min(...ys))
  assert.ok(aspect > .85 && aspect < 1.15, `Circular outline, actual ratio ${aspect}`)
  for (const [index, dot] of circle.dots.entries()) {
    const { x, y, ...metadata } = dot
    const { x: oldX, y: oldY, ...original } = base.dots[index]
    assert.deepEqual(metadata, original)
    assert.ok(Math.hypot(x + dot.d / 2 - 1200, y + dot.d / 2 - 550) <= 476)
  }
  let minimum = Infinity
  for (const a of circle.dots) for (const b of circle.dots) {
    if (a !== b) minimum = Math.min(minimum, Math.hypot(a.x - b.x, a.y - b.y))
  }
  assert.ok(minimum >= 39, `Dots must remain separate, minimum gap ${minimum}`)
})

test('genre shortcuts still reach the correct scene in the circular display', () => {
  const { dots } = model.circularGraph(model.buildCatalogueGraph(catalogue))
  for (const [width, height] of [[1440, 600], [1440, 928], [1920, 1008]]) {
    for (const family of catalogue.genreFamilies) {
      const view = genreCamera(dots, family.id, width, height, { ensureDetail: true })
      const detail = cameraDetail(dots, view, width, height)
      assert.equal(detail.showArtists, true)
      assert.equal(detail.genre, family.id)
    }
  }
})

test('genre shortcuts remain usable after matching artists move into central slots', () => {
  const base = model.circularGraph(model.buildCatalogueGraph(catalogue))
  const graph = personaliseGraph(base, ['rock', 'electronic'], ['electronic--house'], catalogue.artists)
  for (const height of [600, 738, 928]) for (const family of catalogue.genreFamilies) {
    const view = genreCamera(graph.dots, family.id, 1440, height, { ensureDetail: true })
    assert.ok(view, `Missing camera for ${family.id}`)
    assert.equal(cameraDetail(graph.dots, view, 1440, height).genre, family.id)
  }
})
