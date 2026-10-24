// Display-only concentric personalisation. Identities, colours and audience edges stay unchanged.
const CX = 1200, CY = 550
import { recommendedSongsFor } from './recommendations.js'

export function personaliseGraph(base, preferredIds, preferredSubgenreIds = [], artists = [], recommendedIds) {
  if (base.overviewBounds) return personaliseDefaultPositions(base, recommendedIds ?? recommendedSongsFor(artists, preferredIds, preferredSubgenreIds).map(row => row.artist.id))
  const families = [...new Set(base.dots.map(dot => dot.genre))].sort()
  const preferred = families.filter(id => preferredIds.includes(id))
  if (!preferred.length) return base
  const byId = new Map(artists.map(artist => [artist.id, artist]))
  const childPicks = new Set(preferredSubgenreIds)
  const groups = { subgenre: [], genre: [], other: [] }
  for (const dot of base.dots) {
    const genreMatch = preferred.includes(dot.genre)
    const childMatch = genreMatch && (byId.get(dot.artistId)?.subgenreIds ?? []).some(id => childPicks.has(id))
    groups[childMatch ? 'subgenre' : genreMatch ? 'genre' : 'other'].push(dot)
  }
  const placed = new Map()
  const rings = []
  let boundary = 0
  for (const [id, label] of [['subgenre', 'Genre + subgenre match'], ['genre', 'Genre match'], ['other', 'Other genres']]) {
    const members = groups[id].sort((a, b) => a.genre.localeCompare(b.genre) || a.subgenre.localeCompare(b.subgenre) || a.artistId.localeCompare(b.artistId))
    const minRadius = boundary
    // Allocate a compact patch to each family, not a slice of each successive
    // full-circle lane. Stable family angles also align split exact/broad tiers.
    const clusters = families.map((family, index) => {
      const dots = members.filter(dot => dot.genre === family)
      // A golden-angle scatter fills a round patch without rectangular rows.
      const points = dots.map((dot, i) => {
        const angle = i * Math.PI * (3 - Math.sqrt(5))
        const radius = dots.length === 1 ? 0 : 44 * Math.sqrt(i + .5)
        return { dot, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
      })
      const extent = Math.max(0, ...points.map(p => Math.hypot(p.x, p.y) + p.dot.d / 2))
      return { points, extent, angle: -Math.PI / 2 + index * 2 * Math.PI / families.length }
    }).filter(cluster => cluster.points.length)
    const extent = Math.max(0, ...clusters.map(cluster => cluster.extent))
    let radius = minRadius + extent + 76
    // Disjoint enclosing discs guarantee spacing between neighbouring patches;
    // radial padding guarantees the same between different match regions.
    for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
      radius = Math.max(radius, (clusters[i].extent + clusters[j].extent + 120) /
        (2 * Math.abs(Math.sin((clusters[i].angle - clusters[j].angle) / 2))))
    }
    for (const cluster of clusters) for (const { dot, x, y } of cluster.points) {
      placed.set(dot.artistId, { ...dot,
        x: CX + Math.cos(cluster.angle) * radius + x - dot.d / 2,
        y: CY + Math.sin(cluster.angle) * radius + y - dot.d / 2,
        matchTier: id, isPreferred: id !== 'other' })
    }
    boundary = members.length ? radius + extent + 56 : minRadius + 100
    rings.push({ id, label, count: members.length, minRadius, maxRadius: boundary })
  }
  const dots = base.dots.map(dot => placed.get(dot.artistId))
  const extent = boundary + 32
  const overviewBounds = {
    minX: CX - extent, maxX: CX + extent,
    minY: CY - extent, maxY: CY + extent,
  }
  const labels = base.labels.map(label => {
    const members = dots.filter(dot => dot.genre === label[6])
    return members.length ? [members.reduce((sum, dot) => sum + dot.x + dot.d / 2, 0) / members.length - 70,
      Math.min(...members.map(dot => dot.y)) - 40, ...label.slice(2)] : label
  })
  return { ...base, dots, labels, overviewBounds, regions: { centre: { x: CX, y: CY }, rings } }
}

// Fill the centre, assigning artists to the nearest available central slot.
// This keeps movement short without reserving empty space for unselected genres.
function centralSlots(selected) {
  const slots = selected.map((_, index) => {
    if (!index) return { x: CX, y: CY }
    const angle = -Math.PI / 2 + (index - 1) * Math.PI * 2 / (selected.length - 1)
    return { x: CX + Math.cos(angle) * 94, y: CY + Math.sin(angle) * 94 }
  })
  const cache = new Map()
  function assign(index, mask) {
    if (index === selected.length) return { cost: 0, indices: [] }
    if (cache.has(mask)) return cache.get(mask)
    const dot = selected[index]
    let best = { cost: Infinity, indices: [] }
    for (let slot = 0; slot < slots.length; slot++) {
      if (mask & (1 << slot)) continue
      const tail = assign(index + 1, mask | (1 << slot))
      const cost = tail.cost + (dot.x + dot.d / 2 - slots[slot].x) ** 2 + (dot.y + dot.d / 2 - slots[slot].y) ** 2
      if (cost < best.cost) best = { cost, indices: [slot, ...tail.indices] }
    }
    cache.set(mask, best)
    return best
  }
  const assignment = assign(0, 0).indices
  return new Map(selected.map((dot, index) => [dot.artistId, slots[assignment[index]]]))
}

function personaliseDefaultPositions(base, recommendedIds) {
  const selected = base.dots.filter(dot => recommendedIds.includes(dot.artistId)).sort((a, b) => a.artistId.localeCompare(b.artistId))
  if (!selected.length) return base
  const slots = centralSlots(selected)
  const dots = base.dots.map(dot => {
    const dx = dot.x + dot.d / 2 - CX, dy = dot.y + dot.d / 2 - CY
    let angle = Math.atan2(dy, dx)
    let radius = Math.hypot(dx, dy)
    const isRecommended = recommendedIds.includes(dot.artistId)
    if (isRecommended) {
      const slot = slots.get(dot.artistId)
      angle = Math.atan2(slot.y - CY, slot.x - CX)
      radius = Math.hypot(slot.x - CX, slot.y - CY)
    } else {
      // Open the centre smoothly while keeping each genre's existing angle.
      radius = Math.sqrt(180 ** 2 + (475 ** 2 - 180 ** 2) * Math.min(1, (radius / 475) ** 2))
    }
    return { ...dot, x: CX + Math.cos(angle) * radius - dot.d / 2,
      y: CY + Math.sin(angle) * radius - dot.d / 2, ...(isRecommended ? { isRecommended: true } : {}) }
  })
  // Separate neighbours after the inward/outward motion, retaining the framing.
  for (let pass = 0; pass < 80; pass++) {
    for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i], b = dots[j]
      if (!!a.isRecommended !== !!b.isRecommended) continue
      const dx = b.x - a.x, dy = b.y - a.y, distance = Math.max(.01, Math.hypot(dx, dy))
      if (distance >= 42) continue
      const shift = (42 - distance) / (2 * distance)
      a.x -= dx * shift; a.y -= dy * shift
      b.x += dx * shift; b.y += dy * shift
    }
    for (const dot of dots) {
      const dx = dot.x + dot.d / 2 - CX, dy = dot.y + dot.d / 2 - CY
      const radius = Math.max(.01, Math.hypot(dx, dy))
      const bounded = dot.isRecommended ? Math.min(radius, 120) : Math.max(180, Math.min(475, radius))
      dot.x = CX + dx / radius * bounded - dot.d / 2
      dot.y = CY + dy / radius * bounded - dot.d / 2
    }
  }
  return { ...base, dots,
    recommendationArea: { x: CX, y: CY, radius: 145, label: 'Recommended for you' } }
}

// Show all three concentric regions on opening and recentre; keep pan/zoom and genre shortcuts.
export function personalisedCamera(bounds, width, height) {
  const left = 364, right = width - 352, top = 120, bottom = height - 80
  const z = Math.min(1, (right - left) / (bounds.maxX - bounds.minX), (bottom - top) / (bounds.maxY - bounds.minY))
  return { z, x: (left + right) / 2 - (bounds.minX + bounds.maxX) / 2 * z,
    y: (top + bottom) / 2 - (bounds.minY + bounds.maxY) / 2 * z }
}
