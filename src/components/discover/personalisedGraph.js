// Display-only personalisation: translate whole genre webs without changing
// artist identities, their local web shape, or their audience relationships.
const CX = 1200, CY = 550, RX = 550, RY = 350

export function personaliseGraph(base, preferredIds) {
  const families = [...new Set(base.dots.map(dot => dot.genre))].sort()
  const preferred = families.filter(id => preferredIds.includes(id))
  if (!preferred.length) return base
  const peripheral = families.filter(id => !preferred.includes(id))
  const bounds = new Map(families.map(id => {
    const members = base.dots.filter(dot => dot.genre === id)
    return [id, { x: (Math.min(...members.map(d => d.x)) + Math.max(...members.map(d => d.x))) / 2,
      y: (Math.min(...members.map(d => d.y)) + Math.max(...members.map(d => d.y))) / 2 }]
  }))
  const placed = new Map()
  const columns = preferred.length <= 2 ? preferred.length : preferred.length <= 4 ? 2 : 3
  const rows = Math.ceil(preferred.length / columns)
  for (const family of preferred) {
    const index = preferred.indexOf(family), row = Math.floor(index / columns), column = index % columns
    const rowWidth = Math.min(columns, preferred.length - row * columns)
    const anchorX = CX + (column - (rowWidth - 1) / 2) * 640
    const anchorY = CY + (row - (rows - 1) / 2) * 600
    const centre = bounds.get(family)
    for (const dot of base.dots.filter(d => d.genre === family)) {
      placed.set(dot.artistId, { ...dot, x: anchorX + dot.x - centre.x - dot.d / 2,
        y: anchorY + dot.y - centre.y - dot.d / 2, isPreferred: true })
    }
  }
  const coreRadius = Math.max(...[...placed.values()].map(dot => Math.hypot(
    (dot.x + dot.d / 2 - CX) / RX, (dot.y + dot.d / 2 - CY) / RY))) + 0.03
  const outerMinimum = coreRadius + 0.4
  for (const family of peripheral) {
    const centre = bounds.get(family), members = base.dots.filter(d => d.genre === family)
    const localRadius = Math.max(...members.map(dot => Math.hypot((dot.x - centre.x) / RX, (dot.y - centre.y) / RY)))
    const angle = -Math.PI / 2 + peripheral.indexOf(family) * Math.PI * 2 / peripheral.length
    const radius = outerMinimum + localRadius + 0.12
    const anchorX = CX + Math.cos(angle) * RX * radius, anchorY = CY + Math.sin(angle) * RY * radius
    for (const dot of members) {
      placed.set(dot.artistId, { ...dot, x: anchorX + dot.x - centre.x - dot.d / 2,
        y: anchorY + dot.y - centre.y - dot.d / 2, isPreferred: false })
    }
  }
  // With every family relevant there is no preferred/peripheral distinction.
  // Keep the established full layout rather than inventing an irrelevant rim.
  const dots = peripheral.length ? base.dots.map(dot => placed.get(dot.artistId))
    : base.dots.map(dot => ({ ...dot, isPreferred: true }))
  const relevant = dots.filter(dot => dot.isPreferred)
  const overviewBounds = {
    minX: Math.min(...relevant.map(d => d.x)) - 80, maxX: Math.max(...relevant.map(d => d.x + d.d)) + 80,
    minY: Math.min(...relevant.map(d => d.y)) - 80, maxY: Math.max(...relevant.map(d => d.y + d.d)) + 80,
  }
  const labels = base.labels.map(label => {
    const members = dots.filter(dot => dot.genre === label[6])
    return members.length ? [members.reduce((sum, dot) => sum + dot.x + dot.d / 2, 0) / members.length - 70,
      Math.min(...members.map(dot => dot.y)) - 40, ...label.slice(2)] : label
  })
  return { ...base, dots, labels, overviewBounds,
    regions: { coreRadius, peripheralRadius: outerMinimum } }
}

// Open on the preferred centre, not on the potentially distant irrelevant rim.
// All artists remain reachable by dragging or using the genre shortcuts.
export function personalisedCamera(bounds, width, height) {
  const left = 364, right = width - 24, top = 120, bottom = height - 80
  const z = Math.min(1, (right - left) / (bounds.maxX - bounds.minX), (bottom - top) / (bounds.maxY - bounds.minY))
  return { z, x: (left + right) / 2 - (bounds.minX + bounds.maxX) / 2 * z,
    y: (top + bottom) / 2 - (bounds.minY + bounds.maxY) / 2 * z }
}
