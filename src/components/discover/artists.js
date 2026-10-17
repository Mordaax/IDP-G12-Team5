// Who each dot on the Discover web is. The Figma file only has positions and colours, so the
// artists from db.json ("events" → "artists") go on the biggest dots of their genre, and the
// rest get made-up (but stable) local act names.
import { EVENTS_DB, GENRES } from '@/data'

// db.json event genres → Discover genre keys
const EVENT_GENRE = { 'indie-rock': 'indie', pop: 'pop', mandopop: 'mandopop', electronic: 'electronic', 'hip-hop': 'hiphop', traditional: 'ethnic' }

// dot colour (hex without #) → genre key; the darker teals are electronic subgenres
export const GENRE_BY_HEX = {
  ...Object.fromEntries(GENRES.map((g) => [g.dot.slice(1).toLowerCase(), g.key])),
  '146b73': 'electronic', b8ebdd: 'electronic', '0b7f77': 'electronic',
}

const ADJ = ['Neon', 'Paper', 'Velvet', 'Static', 'Lunar', 'Coral', 'Hollow', 'Golden', 'Midnight', 'Tidal', 'Kopi', 'Monsoon', 'Harbour', 'Satellite', 'Glass', 'Little', 'Wild', 'Silver', 'Crimson', 'Echo', 'Orchid', 'Paperplane', 'Night', 'Sunday']
const NOUN = ['Lanterns', 'Tides', 'Atlas', 'Bloom', 'Ferries', 'Signals', 'Avenue', 'Machines', 'Rooftops', 'Weather', 'Comets', 'Gardens', 'Theory', 'Hearts', 'Parade', 'Mangroves', 'Radio', 'Monarchs', 'Season', 'Collective', 'Club', 'Arcade', 'Ghosts', 'Riot']

const hash = (s) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Fans grow with the dot size ("Bigger dot = more fans"). */
export const fansFor = (d) => {
  const n = Math.round(150 + (d - 5) * 380)
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : `${n}`
}

/**
 * Give every artist dot a name. `featured` pins names to spots, e.g. FallingIslands to the dot
 * under the red ring: [{ x, y, name }] in map coordinates.
 */
export function nameDots(dots, featured = []) {
  const used = new Set()
  const out = dots.map(() => null)
  featured.forEach((f) => {
    let best = -1
    let bestDist = Infinity
    dots.forEach((d, i) => {
      if (!d.genre) return
      const dist = Math.hypot(d.x + d.d / 2 - f.x, d.y + d.d / 2 - f.y)
      if (dist < bestDist) { bestDist = dist; best = i }
    })
    if (best >= 0) {
      out[best] = { name: f.name, artistId: f.artistId ?? null, to: f.to ?? null }
      used.add(f.name)
    }
  })
  // real artists on the biggest dots of their genre
  const real = EVENTS_DB.artists.filter((a) => !used.has(a.name))
  for (const g of GENRES) {
    const pool = real.filter((a) => EVENT_GENRE[a.genreId] === g.key)
    const order = dots.map((d, i) => [d, i]).filter(([d, i]) => d.genre === g.key && !out[i]).sort((a, b) => b[0].d - a[0].d)
    pool.forEach((a, k) => {
      if (!order[k]) return
      out[order[k][1]] = { name: a.name, artistId: a.id }
      used.add(a.name)
    })
  }
  // everyone else: a stable made-up name
  dots.forEach((d, i) => {
    if (out[i] || !d.genre) return
    let h = hash(`${Math.round(d.x)},${Math.round(d.y)}`)
    let name
    do {
      name = `${ADJ[h % ADJ.length]} ${NOUN[(h >>> 8) % NOUN.length]}`
      h = hash(name + h)
    } while (used.has(name))
    used.add(name)
    out[i] = { name, artistId: null }
  })
  return out
}
