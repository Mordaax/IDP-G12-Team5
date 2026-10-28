// A stable shuffled cohort illustrates artist recency without inventing join dates
// or changing the catalogue, seeded layout, recommendations or audience network.
export const NEW_ARTIST_SCALE = 1.5

export function selectNewArtistIds(artists, count = 15) {
  const score = id => {
    let hash = 2166136261
    for (const character of `new-artists:${id}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
    return hash >>> 0
  }
  return [...new Set(artists.map(artist => artist.id).filter(id => id !== 'dj-beatroot'))]
    .sort((a, b) => score(a) - score(b) || a.localeCompare(b)).slice(0, count)
}

// Apply after layout/personalisation so only the displayed size changes. Keep
// centres fixed so links, camera targets and the protected DJ dot never move.
export function sizeNewArtistDots(dots, newArtistIds) {
  return dots.map(dot => {
    if (dot.artistId === 'dj-beatroot' || !newArtistIds.has(dot.artistId)) return dot
    const d = dot.d * NEW_ARTIST_SCALE
    const offset = (d - dot.d) / 2
    return { ...dot, d, x: dot.x - offset, y: dot.y - offset, isNewArtist: true }
  })
}
