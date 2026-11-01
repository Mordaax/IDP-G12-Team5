import test from 'node:test'
import assert from 'node:assert/strict'
import { subgenreLabels } from './genreCamera.js'

test('nearby detail tags resolve collisions locally without flipping or detaching', () => {
 const dots = [
  { artistId: 'a', name: 'Afterclass Daydream', x: 800, y: 200, d: 24 },
  { artistId: 'b', name: 'Apricot Season', x: 872, y: 190, d: 24 },
 ]
 const labels = subgenreLabels(dots, null, {x:0,y:0,z:1}, 1440, 800, {stable:true,showAll:true})
 assert.equal(labels.length, 2)
 const [a,b] = labels
 assert.ok(a.x+a.w <= b.x || b.x+b.w <= a.x || a.y+a.h <= b.y || b.y+b.h <= a.y, 'Name badges must not overlap')
 for (const label of labels) {
  const dot = dots.find(dot=>dot.artistId===label.artistId)
  assert.ok(Math.abs(label.x+label.w/2-dot.x-dot.d/2)<=24)
  assert.ok(dot.y-label.y-label.h>=10 && dot.y-label.y-label.h<=26)
 }
})
