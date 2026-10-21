import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('./theme.js', import.meta.url), 'utf8').replaceAll('export ', '')
function themeHarness(saved) {
  const values = new Map(saved ? [['lrm.theme', saved]] : [])
  const root = { dataset: {} }
  const events = {}
  const context = vm.createContext({ document: { documentElement: root }, localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }, window: { addEventListener: (name, handler) => { events[name] = handler } } })
  vm.runInContext(source, context)
  return { context, root, values, events, run: code => vm.runInContext(code, context) }
}

test('a fresh browser uses the team style guide', () => {
  assert.equal(themeHarness().run('getTheme()'), 'style-guide')
})
test('legacy comparison is an explicit remembered choice', () => {
  const app = themeHarness()
  app.run("setTheme('discover')")
  assert.equal(app.values.get('lrm.theme'), 'discover')
  assert.equal(app.run('getTheme()'), 'discover')
})
test('resetting the saved choice in another tab restores the guide', () => {
  const app = themeHarness()
  app.run("setTheme('discover')")
  app.events.storage({ key: 'lrm.theme', newValue: null })
  assert.equal(app.run('getTheme()'), 'style-guide')
})
test('first paint defaults to the guide even when storage is blocked', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  const document = { documentElement: { dataset: {} } }
  vm.runInNewContext(script, { document, localStorage: { getItem() { throw new Error('blocked') } } })
  assert.equal(document.documentElement.dataset.theme, 'style-guide')
})
