import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('./WebOfDots.jsx', import.meta.url), 'utf8')
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
