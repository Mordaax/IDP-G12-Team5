import test from 'node:test'
import assert from 'node:assert/strict'
import * as camera from './genreCamera.js'

const dots = [
  { artistId: 'a', genre: 'pop', name: 'First Artist', x: 500, y: 200, d: 24, fill: '#111' },
  { artistId: 'b', genre: 'rock', name: 'Second Artist', x: 1600, y: 200, d: 24, fill: '#222' },
]

test('camera zoom alone switches between genre and artist detail', () => {
  assert.equal(typeof camera.cameraDetail, 'function')
  assert.deepEqual(camera.cameraDetail(dots, { x: 0, y: 0, z: 0.7 }, 1440, 928), { showArtists: false, genre: null })
  assert.deepEqual(camera.cameraDetail(dots, { x: 0, y: 0, z: 1.5 }, 1440, 928), { showArtists: true, genre: 'pop' })
  assert.deepEqual(camera.cameraDetail(dots, { x: -1600, y: 0, z: 1.5 }, 1440, 928), { showArtists: true, genre: 'rock' })
  assert.deepEqual(camera.cameraDetail(dots, { x: 8000, y: 8000, z: 2 }, 1440, 928), { showArtists: true, genre: null })
})

test('artist labels do not float in from dots outside the visible map area', () => {
  const labels = camera.subgenreLabels([{ ...dots[0], y: 600 }], null, { x: 0, y: 0, z: 1.5 }, 1440, 928)
  assert.equal(labels.length, 0)
})

test('zoomed labels cover visible artists across genres without a clicked family', () => {
  const view = { x: 0, y: 0, z: 1.5 }
  const nearby = [dots[0], { ...dots[1], x: 750 }]
  const labels = camera.subgenreLabels(nearby, null, view, 1440, 928)
  assert.deepEqual(new Set(labels.map(label => label.artistId)), new Set(['a', 'b']))
  for (const label of labels) {
    const dot = nearby.find(dot => dot.artistId === label.artistId)
    assert.ok(Math.abs(label.x + label.w / 2 - (dot.x + dot.d / 2) * view.z) < 0.001)
    assert.ok(label.y + label.h <= dot.y * view.z - 10)
  }
})
