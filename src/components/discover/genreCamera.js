// Camera coordinates are map-local CSS pixels, independent of page zoom.
export function genreCamera(dots, genre, width, height) {
  const members = dots.filter(dot => dot.genre === genre)
  if (!members.length) return null
  const left = 364, right = width - 24, top = 48, bottom = height - 80
  const minX = Math.min(...members.map(d => d.x)) - 35
  const maxX = Math.max(...members.map(d => d.x + d.d)) + 35
  const minY = Math.min(...members.map(d => d.y)) - 40
  const maxY = Math.max(...members.map(d => d.y + d.d)) + 40
  const z = Math.min(2.8, (right - left) / (maxX - minX), (bottom - top) / (maxY - minY))
  const fitted = { z, x: (left + right) / 2 - (minX + maxX) / 2 * z,
    y: (top + bottom) / 2 - (minY + maxY) / 2 * z }
  // A family may occupy both exact-child and family-only rings. Frame a whole
  // compact tier cluster if fitting both would lose artist detail.
  // Default-map fitting and camera-driven semantic state are unchanged.
  const readable = view => subgenreLabels(dots, null, view, width, height)
    .some(label => members.some(dot => dot.artistId === label.artistId))
  if (!members.some(dot => dot.matchTier)) return fitted
  if (cameraDetail(dots, fitted, width, height).genre === genre && readable(fitted)) return fitted
  const clusters = [...new Set(members.map(dot => dot.matchTier))]
    .map(tier => ({ tier, dots: members.filter(dot => dot.matchTier === tier) }))
    .sort((a, b) => b.dots.length - a.dots.length || a.tier.localeCompare(b.tier))
  for (const cluster of clusters) {
    const x1 = Math.min(...cluster.dots.map(dot => dot.x)) - 35
    const x2 = Math.max(...cluster.dots.map(dot => dot.x + dot.d)) + 35
    const y1 = Math.min(...cluster.dots.map(dot => dot.y)) - 40
    const y2 = Math.max(...cluster.dots.map(dot => dot.y + dot.d)) + 40
    const zoom = Math.max(1.15, Math.min(2.8, (right - left) / (x2 - x1), (bottom - top) / (y2 - y1)))
    const candidate = { z: zoom, x: (left + right) / 2 - (x1 + x2) / 2 * zoom,
      y: (top + bottom) / 2 - (y1 + y2) / 2 * zoom }
    if (cameraDetail(dots, candidate, width, height).genre === genre && readable(candidate)) return candidate
  }
  // No verified geometric solution: do not return a known-wrong family/overview.
  return null
}

// Semantic detail depends only on the current camera, never its input source.
export function cameraDetail(dots, view, width, height) {
  if (!view || view.z < 1.15) return { showArtists: false, genre: null }
  const visible = dots.filter(dot => {
    const x = (dot.x + dot.d / 2) * view.z + view.x
    const y = (dot.y + dot.d / 2) * view.z + view.y
    return x >= 352 && x <= width - 16 && y >= 12 && y <= height - 80
  })
  const families = [...new Set(visible.map(dot => dot.genre))]
  const score = genre => visible.filter(dot => dot.genre === genre).length
  const distance = genre => Math.min(...visible.filter(dot => dot.genre === genre).map(dot => Math.hypot(
    (dot.x + dot.d / 2) * view.z + view.x - (352 + width - 16) / 2,
    (dot.y + dot.d / 2) * view.z + view.y - (height - 68) / 2)))
  families.sort((a, b) => score(b) - score(a) || distance(a) - distance(b) || a.localeCompare(b))
  return { showArtists: true, genre: families[0] ?? null }
}

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

export function subgenreLabels(dots, genre, view, width, height) {
  const obstacles = dots.map(d => ({ x: (d.x + d.d / 2) * view.z + view.x - d.d / 2 * view.z - 5,
    y: (d.y + d.d / 2) * view.z + view.y - d.d / 2 * view.z - 5,
    w: d.d * view.z + 10, h: d.d * view.z + 10 }))
  const labels = []
  for (const dot of dots.filter(d => genre == null || d.genre === genre).sort((a, b) => b.name.length - a.name.length || a.artistId.localeCompare(b.artistId))) {
    const cx = (dot.x + dot.d / 2) * view.z + view.x
    const cy = (dot.y + dot.d / 2) * view.z + view.y
    if (cx < 352 || cx > width - 16 || cy < 12 || cy > height - 80) continue
    const r = dot.d / 2 * view.z
    const naturalWidth = dot.name.length * 7 + 16
    const w = Math.min(128, naturalWidth), h = naturalWidth > 128 ? 38 : 22
    // Keep every candidate centred above its artist; never switch sides.
    const options = [10, 28, 50, 78, 106, 134].map(gap => (
      { x: cx - w / 2, y: cy - r - gap - h, w, h }
    ))
    const position = options.find(rect => rect.x >= 352 && rect.x + w <= width - 16 && rect.y >= 12 && rect.y + h <= height - 80 && ![...obstacles, ...labels].some(other => overlaps(rect, other)))
    if (position) labels.push({ ...position, artistId: dot.artistId, text: dot.name, colour: dot.labelColour ?? dot.fill })
  }
  return labels
}
