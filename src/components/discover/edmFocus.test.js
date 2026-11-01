import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCatalogueGraph } from './catalogueGraph.js'
import * as focus from './edmFocus.js'
import { subgenreLabels } from './genreCamera.js'

const data = JSON.parse(readFileSync(new URL('../../data/artists.json', import.meta.url)))
const dots = buildCatalogueGraph(data).dots
const overlap = (a,b) => a.x < b.x+b.w && b.x < a.x+a.w && a.y < b.y+b.h && b.y < a.y+a.h

test('EDM navigation zooms to readable labels without ever relocating dots', () => {
 assert.equal(typeof focus.edmFocusCamera, 'function')
 const before = structuredClone(dots)
 for (const [width,height,rightInset] of [[1440,578,24],[1440,738,24],[1440,738,352],[1440,928,352],[1920,1008,24]]) {
  const view = focus.edmFocusCamera(dots,width,height,{rightInset})
  assert.ok(view.z>=1.6 && view.z<=4)
  const labels = subgenreLabels(dots.filter(dot=>dot.genre==='electronic'),'electronic',view,width,height,{rightInset,stable:true,showAll:true})
  assert.ok(labels.length>=3)
  for (const a of labels) for (const b of labels) if (a!==b) assert.ok(!overlap(a,b))
  assert.deepEqual(dots,before)
 }
})
