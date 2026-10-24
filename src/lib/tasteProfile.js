const STORAGE_KEY = 'lrm.taste-profile'
// Failed writes must win over stale disk data for the rest of this page session.
const memoryProfiles = new Map()

function defaultStorage() {
  try { return globalThis.localStorage ?? null } catch { return null }
}

function normaliseList(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean))]
}

function normaliseProfile(value) {
  return { selected: normaliseList(value?.selected), songs: normaliseList(value?.songs) }
}

export function loadTasteProfile(storage = defaultStorage()) {
  if (memoryProfiles.has(storage)) return normaliseProfile(memoryProfiles.get(storage))
  try {
    const profile = JSON.parse(storage.getItem(STORAGE_KEY))
    return profile && Array.isArray(profile.selected) && Array.isArray(profile.songs)
      ? normaliseProfile(profile) : null
  } catch {
    return null
  }
}

// Selection is unweighted: a child also aligns its parent family.
export function preferredGenreIds(selected, catalogue) {
  const picks = new Set(normaliseList(selected))
  const preferred = new Set()
  for (const family of catalogue.genreFamilies) {
    if (picks.has(family.id) || picks.has(family.label)) preferred.add(family.id)
  }
  for (const child of catalogue.subgenres) {
    if (picks.has(child.id) || picks.has(child.label)) preferred.add(child.familyId)
  }
  return catalogue.genreFamilies.filter(family => preferred.has(family.id)).map(family => family.id)
}

export function preferredSubgenreIds(selected, catalogue) {
  const picks = new Set(normaliseList(selected))
  return catalogue.subgenres.filter(child => picks.has(child.id) || picks.has(child.label)).map(child => child.id)
}

export function saveTasteProfile(value, storage = defaultStorage()) {
  const profile = normaliseProfile(value)
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(profile))
    memoryProfiles.delete(storage)
  } catch {
    memoryProfiles.set(storage, normaliseProfile(profile))
  }
  return profile
}
