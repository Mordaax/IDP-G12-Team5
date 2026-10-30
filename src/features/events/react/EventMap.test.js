import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('./EventMap.jsx', import.meta.url), 'utf8')
const focusEffect = source.match(/  useEffect\(\(\) => \{\n    const marker = focusId[\s\S]*?\n  \}, \[[^\]]*\]\)/)?.[0]

test('location consent reapplies event focus to the recreated map when ready stays true', () => {
  assert.ok(focusEffect, 'focus effect exists')
  const venue = { lat: 1.3, lng: 103.85 }
  const views = []
  const map = { current: { setView: (...args) => views.push(args) } }
  const markers = { current: new Map([['focused-event', {
    getLatLng: () => venue,
    getElement: () => ({ classList: { add() {} } }),
  }]]) }
  let previousDependencies
  const context = {
    ready: true, events: [], focusId: 'focused-event', userLocation: null, map, markers,
    useEffect(effect, dependencies) {
      if (!previousDependencies || dependencies.some((value, index) => !Object.is(value, previousDependencies[index]))) effect()
      previousDependencies = dependencies
    },
  }
  vm.runInNewContext(focusEffect, context)
  assert.equal(views.length, 1)

  // React batches cleanup's setReady(false) with setup's setReady(true).
  // Consent replaces the map, but events, focusId and ready remain unchanged.
  const replacementViews = []
  map.current = { setView: (...args) => replacementViews.push(args) }
  context.userLocation = { lat: 1.295, lng: 103.849 }
  vm.runInNewContext(focusEffect, context)
  assert.equal(replacementViews.length, 1, 'the replacement map must receive its focused camera view')
  assert.equal(replacementViews[0][0], venue)
  assert.equal(replacementViews[0][1], 16)
})
