import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)))
test('Vercel builds the Vite app and serves its React entry for direct page requests', () => {
  assert.equal(config.framework, 'vite')
  assert.equal(config.buildCommand, 'npm run build')
  assert.equal(config.outputDirectory, 'dist')
  for (const path of ['/discover/for-you', '/discover/for-you?view=personalised', '/events/map', '/artists/dj-beatroot', '/forum/battlebox', '/login']) {
    const rewrite = config.rewrites.find(rule => new RegExp(`^${rule.source}$`).test(path.split('?')[0]))
    assert.equal(rewrite?.destination, '/index.html', `Direct request to ${path} needs the SPA entry`)
  }
})
