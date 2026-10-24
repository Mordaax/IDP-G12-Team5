// Display-only concentric personalisation. Identities, colours and audience edges stay unchanged.
const CX = 1200, CY = 550

export function personaliseGraph(base, preferredIds, preferredSubgenreIds = [], artists = []) {
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
      const columns = Math.ceil(Math.sqrt(dots.length))
      const rows = Math.ceil(dots.length / columns)
      const points = dots.map((dot, i) => ({ dot,
        x: (i % columns - (Math.min(columns, dots.length - Math.floor(i / columns) * columns) - 1) / 2) * 76,
        y: (Math.floor(i / columns) - (rows - 1) / 2) * 76 }))
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

// Show all three concentric regions on opening and recentre; keep pan/zoom and genre shortcuts.
export function personalisedCamera(bounds, width, height) {
  const left = 364, right = width - 352, top = 120, bottom = height - 80
  const z = Math.min(1, (right - left) / (bounds.maxX - bounds.minX), (bottom - top) / (bounds.maxY - bounds.minY))
  return { z, x: (left + right) / 2 - (bounds.minX + bounds.maxX) / 2 * z,
    y: (top + bottom) / 2 - (bounds.minY + bounds.maxY) / 2 * z }
}
