export const ARTIST_SAVE_FLAG = 'discover-artist-save-control'
export const validSaveVariant = value => value === 'control' || value === 'heart'
export const ARTIST_COLLECTION_KEY = 'lrm.artist-collection.v1'

export function createArtistSaveStudy({ client = null, storage = null, preview = null, now = Date.now } = {}) {
  const isPreview = validSaveVariant(preview)
  const read = (key, fallback) => { try { return JSON.parse(storage?.getItem(key)) ?? fallback } catch { return fallback } }
  const write = (key, value) => { try { storage?.setItem(key, JSON.stringify(value)) } catch { /* Saving remains usable in memory. */ } }
  const collectionKey = isPreview ? `${ARTIST_COLLECTION_KEY}.preview.${preview}` : ARTIST_COLLECTION_KEY
  const initial = read(collectionKey, [])
  const savedIds = Array.isArray(initial) ? initial.filter(id => typeof id === 'string') : []
  const participant = client?.get_distinct_id() ?? 'offline'
  const ledgerKey = `lrm.${ARTIST_SAVE_FLAG}.v1.${participant}`
  let ledger = read(ledgerKey, {})
  let snapshot = { variant: isPreview ? preview : 'control', ready: isPreview || !client, enrolled: false,
    preview: isPreview, savedIds, exposed: false, finished: false, feedbackSubmitted: false }
  const listeners = new Set()
  const publish = change => { snapshot = { ...snapshot, ...change }; listeners.forEach(listener => listener()) }
  const persist = () => write(ledgerKey, ledger)
  const properties = extra => ({ experiment_key: ARTIST_SAVE_FLAG, variant: snapshot.variant,
    [`$feature/${ARTIST_SAVE_FLAG}`]: snapshot.variant, source: 'discover_artist_card', ...extra })
  const capture = (event, extra = {}) => {
    if (!snapshot.enrolled || isPreview) return
    try { client?.capture(event, properties(extra)) } catch { /* Analytics must not block the control. */ }
  }
  const api = {
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    assign(value) {
      if (isPreview || (snapshot.enrolled && snapshot.exposed)) return
      if (!validSaveVariant(value)) { publish({ ready: true, enrolled: false }); return }
      if (!validSaveVariant(ledger.variant)) {
        ledger = { variant: value, baselineIds: [...snapshot.savedIds], countedIds: [], viewedIds: [] }
        persist()
      }
      publish({ ready: true, enrolled: true, variant: ledger.variant, exposed: !!ledger.startedAt,
        finished: !!ledger.completed, feedbackSubmitted: !!ledger.feedbackSubmitted })
    },
    expose(artistId) {
      if (!snapshot.ready || !snapshot.enrolled || isPreview || ledger.completed) return
      if (!ledger.startedAt) {
        ledger.baselineIds = [...snapshot.savedIds]
        ledger.startedAt = now()
        // This call records PostHog's standard experiment exposure only once a control is shown.
        try { client?.getFeatureFlag(ARTIST_SAVE_FLAG) } catch { /* Explicit exposure still records below. */ }
        capture('artist_save_experiment_exposed')
        publish({ exposed: true })
      }
      if (!(ledger.viewedIds || []).includes(artistId)) {
        ledger.viewedIds = [...(ledger.viewedIds || []), artistId]
        capture('artist_save_control_viewed', { artist_id: artistId, already_saved: snapshot.savedIds.includes(artistId) })
      }
      persist()
    },
    setSaved(artistId, saved, { track = true, variant = 'control' } = {}) {
      if (!artistId || snapshot.savedIds.includes(artistId) === saved) return
      if (track) api.expose(artistId)
      const ids = saved ? [...snapshot.savedIds, artistId] : snapshot.savedIds.filter(id => id !== artistId)
      write(collectionKey, ids)
      publish({ savedIds: ids })
      if (saved && track && !isPreview) {
        try { client?.capture('artist_saved', { artist_id: artistId, variant }) } catch { /* Analytics must not block the control. */ }
      }
      if (!track || !snapshot.enrolled || isPreview || ledger.completed) return
      capture('artist_save_toggled', { artist_id: artistId, saved })
      if (saved && !(ledger.baselineIds || []).includes(artistId) && !(ledger.countedIds || []).includes(artistId)) {
        ledger.countedIds = [...(ledger.countedIds || []), artistId]
        capture('artist_saved_first_time', { artist_id: artistId, distinct_artists_saved: ledger.countedIds.length })
        persist()
      }
    },
    finishTask() {
      if (snapshot.finished || (!snapshot.exposed && !isPreview)) return
      capture('artist_save_task_completed', { distinct_artists_saved: (ledger.countedIds || []).length,
        duration_ms: Math.max(0, now() - (ledger.startedAt || now())) })
      ledger.completed = true
      if (!isPreview) persist()
      publish({ finished: true })
    },
    submitFeedback({ preference, ease, reason = '' }) {
      if (snapshot.feedbackSubmitted || !snapshot.finished || !['control', 'heart', 'no_preference'].includes(preference)
        || !Number.isInteger(ease) || ease < 1 || ease > 5) return false
      capture('artist_save_feedback_submitted', { preferred_control: preference, ease_rating: ease, reason: reason.trim().slice(0, 1000) })
      ledger.feedbackSubmitted = true
      if (!isPreview) persist()
      publish({ feedbackSubmitted: true })
      return true
    },
  }
  return api
}
