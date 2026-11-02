import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

import { buildCatalogueGraph } from './catalogueGraph.js'
import { artistCamera, subgenreLabels } from './genreCamera.js'
import { edmFocusCamera } from './edmFocus.js'

const source = readFileSync(new URL('./WebOfDots.jsx', import.meta.url), 'utf8')

test('recommendation artist jumps leave EDM-only scope and restore the target label', () => {
  const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
  const artists = buildCatalogueGraph(data).dots.map((dot, i) => ({ ...dot, i, cx: dot.x + dot.d / 2, cy: dot.y + dot.d / 2 }))
  const target = artists.find(artist => artist.genre !== 'electronic')
  const state = { edmFocused: false, selectedGenre: null }
  const context = {
    artists, artistCamera, edmFocusCamera, rightInset: 352,
    root: { current: { clientWidth: 1440, clientHeight: 738 } },
    useCallback: callback => callback,
    setMorphing: () => {}, setHover: () => {},
    setPicked: value => { state.picked = value },
    setSelectedGenre: value => { state.selectedGenre = value; context.selectedGenre = value },
    setEdmFocused: value => { state.edmFocused = value; context.edmFocused = value },
    flyTo: view => { state.view = view },
    selectedGenre: null, edmFocused: false, overviewBounds: null,
  }
  const callbacks = source.slice(source.indexOf('  const focusGenre = useCallback'), source.indexOf('  const tourArtist ='))
  vm.runInNewContext(`${callbacks}\nfocusGenre('electronic')`, context)
  assert.equal(state.edmFocused, true, 'first enter the EDM shortcut scope')
  vm.runInNewContext(`(() => { ${callbacks}\nfocusArtist(${JSON.stringify(target.artistId)}) })()`, context)
  assert.equal(state.edmFocused, false, 'artist jumps must clear the EDM-only label/dimming scope')
  assert.equal(state.selectedGenre, target.genre)
  assert.equal(state.picked, target.i)
  const labels = subgenreLabels(artists, null, state.view, 1440, 738,
    { rightInset: 352, stable: true, showAll: true, priorityGenre: state.selectedGenre })
  assert.ok(labels.some(label => label.artistId === target.artistId), 'jumped-to artist has a visible detail label')
})

test('audience lines are disabled through a reversible display flag, not removed from the graph', () => {
  assert.match(source, /export const SHOW_AUDIENCE_CONNECTIONS = false/)
  assert.match(source, /SHOW_AUDIENCE_CONNECTIONS && graph\.edges\.map/)
  assert.match(source, /edges\.flatMap/)
  assert.match(source, /neighbours=\{graph\.edges\.filter/)
})

test('wheel listener refreshes its zoom callback when the current map bounds change', () => {
  assert.match(source, /const zoomAt = useCallback\([\s\S]*?\}, \[overviewBounds, stopFlight\]\)/)
  assert.match(source, /el\.addEventListener\('wheel', onWheel, \{ passive: false \}\)[\s\S]*?el\.removeEventListener\('wheel', onWheel\)\s*\}, \[zoomAt\]\)/)
})
const fitView = source.slice(source.indexOf('  const fitView = () => {'), source.indexOf('  const reset = useCallback'))
function fit(width, height) {
  const constants = [...source.matchAll(/^export const MAP_[WH] = .+|^const RECENTRE_OFFSET_X = .+/gm)].map(([line]) => line.replace('export ', '')).join('\n')
  return vm.runInNewContext(`${constants}\n${fitView}\nfitView()`, { overviewBounds: null, root: { current: { clientWidth: width, clientHeight: height } } })
}

test('recentring nudges the web right without changing its zoom or vertical fit', () => {
  for (const [width, height] of [[1440, 828], [1920, 1008], [1440, 600]]) {
    const z = Math.min(1.8, Math.max(0.55, Math.min(width / 2000, height / 1100)))
    const view = fit(width, height)
    assert.equal(view.x, (width - 2000 * z) / 2 + 48 * z)
    assert.equal(view.y, (height - 1100 * z) / 2)
    assert.equal(view.z, z)
  }
})
