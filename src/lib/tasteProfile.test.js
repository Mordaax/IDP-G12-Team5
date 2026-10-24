import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const catalogue = JSON.parse(readFileSync(new URL('../data/artists.json', import.meta.url), 'utf8'))

test('genre family matching resolves family and child names or IDs in catalogue order', async () => {
  const { preferredGenreIds } = await import(moduleUrl)
  const pop = catalogue.genreFamilies.find(family => family.label === 'Pop')
  const rock = catalogue.genreFamilies.find(family => family.label === 'Rock & Alternative')
  const electronic = catalogue.genreFamilies.find(family => family.label === 'Electronic / EDM')
  const dreamPop = catalogue.subgenres.find(child => child.label === 'Dream pop')
  const house = catalogue.subgenres.find(child => child.label === 'House')
  assert.deepEqual(preferredGenreIds(['House', rock.id, dreamPop.id, pop.label, house.id, 'Dream pop', 'unknown', null], catalogue),
    catalogue.genreFamilies.filter(family => [pop.id, rock.id, electronic.id].includes(family.id)).map(family => family.id))
  assert.deepEqual(preferredGenreIds(['Dream pop'], catalogue), [pop.id], 'a child prefers its entire family')
  assert.deepEqual(preferredGenreIds(['Slow Burn'], catalogue), [], 'songs do not match genres')
  assert.deepEqual(preferredGenreIds([], catalogue), [])
  assert.deepEqual(preferredGenreIds(null, catalogue), [])
})

const moduleUrl = new URL('./tasteProfile.js', import.meta.url)

test('subgenre matching preserves exact child choices without expanding broad genre selections', async () => {
  const { preferredSubgenreIds } = await import(moduleUrl)
  assert.equal(typeof preferredSubgenreIds, 'function')
  assert.deepEqual(preferredSubgenreIds(['Pop', 'electronic'], catalogue), [])
  assert.deepEqual(preferredSubgenreIds([' Dream pop ', 'electronic--house', 'House', null, 'unknown'], catalogue), ['pop--dream-pop', 'electronic--house'])
  assert.deepEqual(preferredSubgenreIds(null, catalogue), [])
})

test('malformed saved data is ignored; valid arrays are trimmed, deduplicated and copied', async () => {
  const { loadTasteProfile, saveTasteProfile } = await import(moduleUrl)
  for (const raw of ['{', 'null', '[]', '42', '{}', '{"selected":"Pop","songs":[]}', '{"selected":[],"songs":null}']) {
    assert.equal(loadTasteProfile(memoryStorage(raw)), null)
  }
  const storage = memoryStorage()
  const input = { selected: [' Dream pop ', '', null, 'Dream pop', 3], songs: [' Slow Burn ', 'Slow Burn', false], weights: [99] }
  const saved = saveTasteProfile(input, storage)
  assert.deepEqual(saved, { selected: ['Dream pop'], songs: ['Slow Burn'] })
  saved.selected.push('Pop')
  input.songs.push('Other song')
  assert.deepEqual(loadTasteProfile(storage), { selected: ['Dream pop'], songs: ['Slow Burn'] })
  assert.deepEqual(saveTasteProfile({}, storage), { selected: [], songs: [] })
  assert.deepEqual(loadTasteProfile(storage), { selected: [], songs: [] })
})
test('blocked reads and writes retain a defensive page-memory profile, including stale readable storage', async () => {
  const { loadTasteProfile, saveTasteProfile } = await import(moduleUrl)
  const blocked = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
  const stale = { getItem() { return JSON.stringify({ selected: ['Pop'], songs: [] }) }, setItem() { throw new Error('quota') } }
  for (const storage of [blocked, stale, null]) {
    const saved = saveTasteProfile({ selected: ['House'], songs: ['Slow Burn'] }, storage)
    saved.selected.push('Pop')
    const loaded = loadTasteProfile(storage)
    assert.deepEqual(loaded, { selected: ['House'], songs: ['Slow Burn'] })
    loaded.songs.push('Other song')
    assert.deepEqual(loadTasteProfile(storage).songs, ['Slow Burn'])
  }
})

test('default storage access is safe when the localStorage getter itself is blocked', async () => {
  const { loadTasteProfile, saveTasteProfile } = await import(moduleUrl)
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError') } })
    const profile = { selected: ['Dream pop'], songs: [] }
    assert.deepEqual(saveTasteProfile(profile), profile)
    assert.deepEqual(loadTasteProfile(), profile)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else delete globalThis.localStorage
  }
})

const memoryStorage = (initial = null) => {
  let value = initial
  return {
    getItem(key) { assert.equal(key, 'lrm.taste-profile'); return value },
    setItem(key, next) { assert.equal(key, 'lrm.taste-profile'); value = next },
  }
}

test('taste profiles round-trip selected genres and editable songs using the dedicated key', async () => {
  const { loadTasteProfile, saveTasteProfile } = await import(moduleUrl)
  const storage = memoryStorage()
  assert.equal(loadTasteProfile(storage), null)
  const profile = { selected: ['Dream pop'], songs: ['Slow Burn'] }
  assert.deepEqual(saveTasteProfile(profile, storage), profile)
  assert.deepEqual(loadTasteProfile(storage), profile)
})
