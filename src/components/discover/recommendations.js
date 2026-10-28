// A shared source keeps the playlist and the map's centre in sync.
export function artistTrackTitle(artist) {
  const id = artist.id ?? artist.artistId
  const named = {
    'demo-phase-canopy': 'Low Tide', 'demo-gridwake': 'Midnight Transit',
    'demo-peachlift': 'Slow Burn', 'demo-meterform': 'Kampong Bass',
    'demo-june-in-stereo': 'Coastline', 'demo-void-receipt': 'Hollow Bark',
    'dj-beatroot': 'Tracks of the Woods',
  }
  if (named[id]) return named[id]
  // Stable fictional titles for catalogue artists without recorded releases.
  let hash = 0
  for (const char of id) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0
  const first = ['Neon', 'Distant', 'Midnight', 'Paper', 'Quiet', 'Silver', 'Afterglow', 'Electric']
  const last = ['Signals', 'Hours', 'Tides', 'Echoes', 'Skylines', 'Currents', 'Circles', 'Rain']
  return `${first[hash % first.length]} ${last[Math.floor(hash / first.length) % last.length]}`
}

// Sample once when Discover mounts; camera changes must not reshuffle recommendations.
export function randomRecommendationCount(familyCount = 0, random = Math.random) {
  const minimum = Math.max(3, familyCount)
  const maximum = Math.max(8, minimum)
  return minimum + Math.floor(random() * (maximum - minimum + 1))
}

export function recommendedSongsFor(artists, preferredIds = [], preferredSubgenreIds = [], count = 6) {
  const demos = [
    ['Low Tide', 'electronic', 0], ['Midnight Transit', 'electronic', 1],
    ['Slow Burn', 'pop', 0], ['Kampong Bass', 'hiphop', 0],
    ['Coastline', 'pop', 1], ['Hollow Bark', 'punk-metal', 0],
  ].flatMap(([title, family, index]) => {
    const artist = artists.filter(item => item.primaryGenreId === family)[index]
    return artist ? [{ title, artist }] : []
  })
  if (!preferredIds.length && !preferredSubgenreIds.length) return demos.slice(0, count)
  const families = [...new Set(preferredIds.length ? preferredIds : artists
    .filter(artist => artist.subgenreIds.some(id => preferredSubgenreIds.includes(id))).map(artist => artist.primaryGenreId))]
  const score = artist => artist.subgenreIds.some(id => preferredSubgenreIds.includes(id)) ? 1 : 0
  const queues = families.map(family => artists.filter(artist => artist.primaryGenreId === family)
    .sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id)))
  const chosen = []
  const limit = Math.max(count, families.length)
  while (chosen.length < limit && queues.some(queue => queue.length)) {
    for (const queue of queues) {
      if (queue.length) chosen.push(queue.shift())
      if (chosen.length === limit) break
    }
  }
  return chosen.map(artist => ({
    artist, title: artistTrackTitle(artist),
  }))
}
