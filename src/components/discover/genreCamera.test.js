import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'

const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const dots = buildCatalogueGraph(data).dots

test('genre shortcuts fit every family inside the unobstructed map and zoom beyond overview', async () => {
  const { genreCamera } = await import('./genreCamera.js')
  for (const [width, height] of [[1440, 928], [1440, 1500], [1920, 1008]]) {
    for (const family of data.genreFamilies) {
      const view = genreCamera(dots, family.id, width, height)
      assert.ok(view.z > Math.min(width / 2000, height / 1100))
      for (const dot of dots.filter(d => d.genre === family.id)) {
        assert.ok(dot.x * view.z + view.x >= 364)
        assert.ok((dot.x + dot.d) * view.z + view.x <= width - 24)
        assert.ok(dot.y * view.z + view.y >= 48)
        assert.ok((dot.y + dot.d) * view.z + view.y <= height - 80)
      }
      assert.deepEqual(view, genreCamera([...dots].reverse(), family.id, width, height))
    }
  }
  assert.equal(genreCamera(dots, 'missing', 1440, 928), null)
})

test('zoomed artist-name labels stay outside sidebar, dots and one another', async () => {
  const { genreCamera, subgenreLabels } = await import('./genreCamera.js')
  for (const family of data.genreFamilies) {
    const view = genreCamera(dots, family.id, 1440, 928)
    const labels = subgenreLabels(dots, family.id, view, 1440, 928)
    assert.equal(labels.length, dots.filter(dot => dot.genre === family.id).length)
    for (const a of labels) {
      assert.ok(a.x >= 352 && a.x + a.w <= 1424 && a.y >= 12 && a.y + a.h <= 848)
      for (const dot of dots) {
        const obstacle = { x: dot.x * view.z + view.x - 5, y: dot.y * view.z + view.y - 5,
          w: dot.d * view.z + 10, h: dot.d * view.z + 10 }
        assert.ok(a.x + a.w <= obstacle.x || obstacle.x + obstacle.w <= a.x || a.y + a.h <= obstacle.y || obstacle.y + obstacle.h <= a.y)
      }
      for (const b of labels.filter(b => b !== a)) assert.ok(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
    }
  }
})

test('bright dots use dark saturated same-hue text for zoomed labels', async () => {
  const { genreCamera, subgenreLabels } = await import('./genreCamera.js')
  const pastels = data.subgenres.filter(child => child.colour.textCss)
  assert.equal(pastels.length, 6)
  for (const child of pastels) {
    const view = genreCamera(dots, child.familyId, 1440, 928)
    const labels = subgenreLabels(dots, child.familyId, view, 1440, 928)
    for (const dot of dots.filter(dot => dot.subgenre === child.label)) {
      const label = labels.find(label => label.artistId === dot.artistId)
      assert.equal(label.colour, `hsl(${child.colour.hue} 65% 30%)`)
      assert.notEqual(label.colour, dot.fill, 'Bright dot fill must not become faint text')
      assert.equal(dot.fill, child.colour.css, 'Keep the bright dot unchanged')
    }
  }
})

test('every focused artist gets a horizontally centred tag above its dot', async () => {
  const { genreCamera, subgenreLabels } = await import('./genreCamera.js')
  for (const [width, height] of [[1440, 928], [1440, 1616], [1920, 1008]]) {
    for (const family of data.genreFamilies) {
      const view = genreCamera(dots, family.id, width, height)
      const members = dots.filter(dot => dot.genre === family.id)
      const labels = subgenreLabels(dots, family.id, view, width, height)
      assert.equal(labels.length, members.length, `Every ${family.id} dot needs its tag`)
      for (const label of labels) {
        const dot = members.find(dot => dot.artistId === label.artistId)
        assert.equal(label.text, dot.name)
        assert.equal(label.colour, dot.labelColour ?? dot.fill)
        const cx = (dot.x + dot.d / 2) * view.z + view.x
        const top = dot.y * view.z + view.y
        assert.ok(Math.abs(label.x + label.w / 2 - cx) < 0.001)
        assert.ok(label.y + label.h <= top - 10 + 0.001)
      }
    }
  }
})
