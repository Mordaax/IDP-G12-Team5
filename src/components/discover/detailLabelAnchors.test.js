import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'
import { sizeNewArtistDots, selectNewArtistIds } from './artistRecency.js'
import { fitArtistsCamera, subgenreLabels } from './genreCamera.js'

const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const dots = sizeNewArtistDots(buildCatalogueGraph(data).dots, new Set(selectNewArtistIds(data.artists)))

test('detail labels stay attached immediately above their own dots after every scene shortcut', () => {
  for (const [width, height] of [[1440, 760], [1440, 928], [1920, 1008]]) {
    for (const family of data.genreFamilies) {
      const view = fitArtistsCamera(dots.filter(dot => dot.genre === family.id), width, height, { rightInset: 24 })
      const labels = subgenreLabels(dots, null, view, width, height, { rightInset: 24, stable: true, showAll: true, priorityGenre: family.id })
      const visible = dots.filter(dot => {
        const x = (dot.x + dot.d / 2) * view.z + view.x
        const y = (dot.y + dot.d / 2) * view.z + view.y
        return x >= 352 && x <= width - 24 && y >= 12 && y <= height - 80
      })
      assert.equal(labels.length, visible.length)
      for (const label of labels) {
        const dot = dots.find(dot => dot.artistId === label.artistId)
        const top = dot.y * view.z + view.y
        const bottom = (dot.y + dot.d) * view.z + view.y
        if (top - 10 - label.h >= 12) {
          assert.ok(top - label.y - label.h >= 10 - .001 && top - label.y - label.h <= 26 + .001, `${dot.name}: detached or flipped label in ${family.id}`)
        } else {
          assert.ok(Math.abs(label.y - bottom - 10) < .001, `${dot.name}: edge fallback must stay attached`)
        }
      }
    }
  }
})
