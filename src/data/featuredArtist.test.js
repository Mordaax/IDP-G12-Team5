import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import db from './db.json' with { type: 'json' }

const root = new URL('../../', import.meta.url)
test('the featured legacy artist is DJ Beatroot with the supplied profile image', () => {
  const artist = db.events.artists.find(artist => artist.id === 'fallingislands')
  assert.equal(artist.name, 'DJ Beatroot')
  assert.equal(artist.isFictional, true)
  assert.equal(db.images.fallingAvatar, '/assets/img/dj-beatroot.png')
  assert.ok(existsSync(new URL(`public${db.images.fallingAvatar}`, root)))
  assert.equal(db.events.artists.length, 15, 'Renaming the featured fixture must not duplicate artists')
  assert.equal(db.events.events.filter(event => event.headliner === artist.id).length, 3)
})

test('visible source copy and event artwork no longer name the original artist', () => {
  const oldName = /Falling\s*Islands|FALLINGISLANDS/
  function scan(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory)
      if (entry.isDirectory()) { scan(path); continue }
      if (!/\.(jsx|js|json|svg)$/.test(entry.name) || /\.test\./.test(entry.name)) continue
      assert.doesNotMatch(readFileSync(path, 'utf8'), oldName, fileURLToPath(path))
    }
  }
  scan(new URL('src/', root))
  scan(new URL('public/images/events/', root))
})
