// Offline fixture generation only: persist the result, never reroll on render.
// Either-endpoint nearest-two eligibility; enforce the degree cap explicitly.
function randomFrom(seed) {
  let state = seed >>> 0
  return () => {
    state += 0x6D2B79F5
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const distance = (a, b) => Math.hypot(a.x + a.d / 2 - b.x - b.d / 2, a.y + a.d / 2 - b.y - b.d / 2)

export function generateProximityConnections(dots, { seed }) {
  const random = randomFrom(seed)
  const ordered = [...dots].sort((a, b) => a.artistId.localeCompare(b.artistId))
  const minimumWithTwo = Math.ceil(ordered.length * 0.4)
  if (!ordered.length) return []
  const nearest = new Map(ordered.map(a => [a.artistId, ordered.filter(b => b !== a)
    .sort((b, c) => distance(a, b) - distance(a, c) || b.artistId.localeCompare(c.artistId))
    .slice(0, 2).map(b => b.artistId)]))
  const candidates = []
  for (let i = 0; i < ordered.length; i++) for (let j = i + 1; j < ordered.length; j++) {
    const a = ordered[i], b = ordered[j]
    if (nearest.get(a.artistId).includes(b.artistId) || nearest.get(b.artistId).includes(a.artistId)) {
      candidates.push({ a: a.artistId, b: b.artistId, distance: distance(a, b) })
    }
  }
  for (let attempt = 0; attempt < 128; attempt++) {
    const degrees = new Map(ordered.map(dot => [dot.artistId, 0]))
    for (const pair of candidates) {
      degrees.set(pair.a, degrees.get(pair.a) + 1)
      degrees.set(pair.b, degrees.get(pair.b) + 1)
    }
    // Randomly remove longer local edges first, never isolating an artist.
    // Incoming nearest-neighbour choices can exceed two, so cap them explicitly.
    const ranked = candidates.map(pair => ({ ...pair,
      priority: -Math.log(Math.max(Number.EPSILON, random())) * Math.max(0.001, pair.distance),
    })).sort((a, b) => b.priority - a.priority || a.a.localeCompare(b.a) || a.b.localeCompare(b.b))
    const selected = new Set(ranked)
    for (const pair of ranked) {
      const da = degrees.get(pair.a), db = degrees.get(pair.b)
      if ((da > 2 || db > 2) && da > 1 && db > 1) {
        selected.delete(pair)
        degrees.set(pair.a, da - 1); degrees.set(pair.b, db - 1)
      }
    }
    if ([...degrees.values()].some(n => n < 1 || n > 2)) continue
    let withTwo = [...degrees.values()].filter(n => n === 2).length
    if (withTwo < minimumWithTwo) continue
    for (const pair of ranked) {
      if (selected.has(pair) && degrees.get(pair.a) === 2 && degrees.get(pair.b) === 2 && withTwo - 2 >= minimumWithTwo) {
        selected.delete(pair)
        degrees.set(pair.a, 1); degrees.set(pair.b, 1)
        withTwo -= 2
      }
    }
    return [...selected].sort((a, b) => a.a.localeCompare(b.a) || a.b.localeCompare(b.b)).map(pair => ({
      id: `proximity-${pair.a}--${pair.b}`,
      sourceArtistId: pair.a, targetArtistId: pair.b,
      sharedListenerCount: 40 + Math.floor(random() * 761),
      isFictional: true,
    }))
  }
  throw new Error('Cannot give every artist one or two local links with at least 40% having two; do not relax proximity or the degree cap silently.')
}
