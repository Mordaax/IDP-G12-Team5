import test from 'node:test'
import assert from 'node:assert/strict'

const setup = async (preview = null, existing = null) => {
  const module = await import('./artistSaveStudy.js')
  const events = [], data = new Map(existing || [])
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  const client = { get_distinct_id: () => 'participant-17', capture: (event, properties) => events.push({ event, properties }), getFeatureFlag: () => 'heart' }
  return { store: module.createArtistSaveStudy({ client, storage, preview }), events, data, client, module }
}

test('only assigned participants are measured, and viewing the button records exposure once', async () => {
  const { store, events } = await setup()
  store.expose('artist-a')
  assert.equal(events.length, 0)
  store.assign('heart')
  store.expose('artist-a'); store.expose('artist-a')
  assert.equal(store.getSnapshot().variant, 'heart')
  assert.equal(events.filter(row => row.event === 'artist_save_experiment_exposed').length, 1)
  assert.equal(events.filter(row => row.event === 'artist_save_control_viewed').length, 1)
  store.assign('control')
  assert.equal(store.getSnapshot().variant, 'heart', 'Never switch a participant mid-task')
})

test('saving, removing and re-saving an artist only counts one distinct artist', async () => {
  const { store, events, data, client, module } = await setup()
  store.assign('heart')
  store.setSaved('artist-a', true); store.setSaved('artist-a', true)
  store.setSaved('artist-a', false); store.setSaved('artist-a', true)
  store.setSaved('artist-b', true)
  const saves = events.filter(row => row.event === 'artist_saved_first_time')
  assert.deepEqual(saves.map(row => row.properties.artist_id), ['artist-a', 'artist-b'])
  assert.ok(saves.every(row => row.properties['$feature/discover-artist-save-control'] === 'heart'))
  const restored = module.createArtistSaveStudy({ client, storage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) } })
  restored.assign('heart'); restored.setSaved('artist-a', false); restored.setSaved('artist-a', true)
  assert.equal(events.filter(row => row.event === 'artist_saved_first_time').length, 2)
})

test('both controls save identically and forced previews send no experiment events', async () => {
  for (const variant of ['control', 'heart']) {
    const { store, events } = await setup(variant)
    store.expose('artist-a'); store.setSaved('artist-a', true)
    assert.deepEqual(store.getSnapshot().savedIds, ['artist-a'])
    store.finishTask(); store.submitFeedback({ preference: 'heart', ease: 4, reason: 'Easy to recognise' })
    assert.equal(events.length, 0)
  }
})

test('finishing includes zero saves and stops subsequent actions entering the task results', async () => {
  const { store, events } = await setup()
  store.assign('control'); store.expose('artist-a'); store.finishTask(); store.finishTask()
  const completion = events.filter(row => row.event === 'artist_save_task_completed')
  assert.equal(completion.length, 1)
  assert.equal(completion[0].properties.distinct_artists_saved, 0)
  store.setSaved('artist-a', true)
  assert.equal(events.filter(row => row.event === 'artist_saved_first_time').length, 0)
  assert.deepEqual(store.getSnapshot().savedIds, ['artist-a'])
  store.submitFeedback({ preference: 'no_preference', ease: 3, reason: 'Both seem clear' })
  assert.equal(events.filter(row => row.event === 'artist_save_feedback_submitted').length, 1)
})

test('existing saves synchronised before exposure do not become new conversions', async () => {
  const { store, events } = await setup()
  store.assign('control')
  store.setSaved('already-saved', true, { track: false })
  store.expose('already-saved')
  store.setSaved('already-saved', false)
  store.setSaved('already-saved', true)
  assert.equal(events.filter(row => row.event === 'artist_saved_first_time').length, 0)
})

test('disabled flags keep saving functional without recording conversions', async () => {
  const { store, events } = await setup()
  store.assign(false)
  store.setSaved('artist-a', true)
  assert.equal(store.getSnapshot().ready, true)
  assert.equal(store.getSnapshot().enrolled, false)
  assert.deepEqual(store.getSnapshot().savedIds, ['artist-a'])
  assert.equal(events.length, 0)
})
