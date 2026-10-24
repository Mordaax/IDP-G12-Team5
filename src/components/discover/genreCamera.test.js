import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'

const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const dots = buildCatalogueGraph(data).dots

test('dense labels expose more names in a crowded zoomed cluster without overlapping dots or labels', async () => {
  const { subgenreLabels } = await import('./genreCamera.js')
  const crowded = Array.from({ length: 12 }, (_, index) => ({ artistId: `artist-${index}`, name: `Artist ${index + 1}`,
    x: 600 + index % 4 * 42, y: 220 + Math.floor(index / 4) * 44, d: 24, genre: 'rock', fill: '#333' }))
  const view = { x: 0, y: 0, z: 1.2 }
  const sparse = subgenreLabels(crowded, null, view, 1440, 738, { rightInset: 352 })
  const dense = subgenreLabels(crowded, null, view, 1440, 738, { rightInset: 352, dense: true })
  assert.ok(dense.length > sparse.length, `Expected more names than ${sparse.length}, got ${dense.length}`)
  for (const label of dense) {
    assert.ok(label.x >= 352 && label.x + label.w <= 1088)
    for (const other of dense.filter(item => item !== label)) assert.ok(label.x + label.w <= other.x || other.x + other.w <= label.x || label.y + label.h <= other.y || other.y + other.h <= label.y)
    for (const dot of crowded) assert.ok(label.x + label.w <= dot.x * view.z - 5 || (dot.x + dot.d) * view.z + 5 <= label.x || label.y + label.h <= dot.y * view.z - 5 || (dot.y + dot.d) * view.z + 5 <= label.y)
  }
})

test('gentle scene framing keeps the whole genre between both menus', async () => {
  const { fitArtistsCamera, artistCamera } = await import('./genreCamera.js')
  assert.equal(typeof fitArtistsCamera, 'function')
  assert.equal(typeof artistCamera, 'function')
  for (const [width, height] of [[1440, 738], [1440, 928], [1920, 1008]]) {
    for (const family of data.genreFamilies) {
      const members = dots.filter(dot => dot.genre === family.id)
      const view = fitArtistsCamera(members, width, height, { rightInset: 352 })
      assert.ok(view.z <= 1.6)
      for (const dot of members) {
        assert.ok(dot.x * view.z + view.x >= 364)
        assert.ok((dot.x + dot.d) * view.z + view.x <= width - 352)
        assert.ok(dot.y * view.z + view.y >= 48)
        assert.ok((dot.y + dot.d) * view.z + view.y <= height - 80)
      }
      const jump = artistCamera(members[0], width, height, { rightInset: 352 })
      const x = (members[0].x + members[0].d / 2) * jump.z + jump.x
      assert.ok(x > 364 && x < width - 352)
      assert.ok(jump.z <= 1.8)
    }
  }
})

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
  assert.equal(pastels.length, 7)
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
