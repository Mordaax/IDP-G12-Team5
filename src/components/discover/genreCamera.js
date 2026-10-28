// Camera coordinates are map-local CSS pixels, independent of page zoom.
export function fitArtistsCamera(members, width, height, { rightInset = 352 } = {}) {
  if (!members.length) return null
  const left = 364, right = Math.max(left + 80, width - rightInset), top = 48, bottom = Math.max(top + 80, height - 80)
  const minX = Math.min(...members.map(dot => dot.x)) - 42
  const maxX = Math.max(...members.map(dot => dot.x + dot.d)) + 42
  const minY = Math.min(...members.map(dot => dot.y)) - 64
  const maxY = Math.max(...members.map(dot => dot.y + dot.d)) + 42
  const z = Math.min(1.6, (right - left) / (maxX - minX), (bottom - top) / (maxY - minY))
  return { z, x: (left + right) / 2 - (minX + maxX) / 2 * z,
    y: (top + bottom) / 2 - (minY + maxY) / 2 * z }
}

export function artistCamera(dot, width, height, { rightInset = 352 } = {}) {
  const left = 364, right = Math.max(left + 80, width - rightInset)
  const z = Math.min(1.8, (right - left) / 220, (height - 128) / 200)
  return { z, x: (left + right) / 2 - (dot.x + dot.d / 2) * z,
    y: (48 + height - 80) / 2 - (dot.y + dot.d / 2) * z }
}

export function genreCamera(dots, genre, width, height, { ensureDetail = false } = {}) {
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
  if (!members.some(dot => dot.matchTier)) {
    if (!ensureDetail) return fitted
    for (let zoom = Math.max(1.15, fitted.z); zoom <= 2.8; zoom += .1) {
      const candidate = { z: zoom, x: (left + right) / 2 - (minX + maxX) / 2 * zoom,
        y: (top + bottom) / 2 - (minY + maxY) / 2 * zoom }
      if (cameraDetail(dots, candidate, width, height).genre === genre && readable(candidate)) return candidate
    }
  }
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
  // A personalised circular map can spread a scene across several nearby slots.
  // Try a local artist cluster when framing the whole match tier is too broad.
  if (ensureDetail) {
    const anchors = [...members].sort((a, b) => {
      const nearby = dot => members.filter(other => Math.hypot(dot.x - other.x, dot.y - other.y) < 170).length
      return nearby(b) - nearby(a) || a.artistId.localeCompare(b.artistId)
    })
    for (let zoom = 2.8; zoom <= 4.01; zoom += .4) for (const anchor of anchors) {
      const candidate = { z: zoom, x: (left + right) / 2 - (anchor.x + anchor.d / 2) * zoom,
        y: (top + bottom) / 2 - (anchor.y + anchor.d / 2) * zoom }
      if (cameraDetail(dots, candidate, width, height).genre === genre && readable(candidate)) return candidate
    }
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

export function subgenreLabels(dots, genre, view, width, height, { rightInset = 16, dense = false, priorityGenre, stable = false, limit = Infinity, showAll = false } = {}) {
  const obstacles = dots.map(d => ({ x: (d.x + d.d / 2) * view.z + view.x - d.d / 2 * view.z - 5,
    y: (d.y + d.d / 2) * view.z + view.y - d.d / 2 * view.z - 5,
    w: d.d * view.z + 10, h: d.d * view.z + 10 }))
  const labels = []

  for (const dot of dots.filter(d => genre == null || d.genre === genre).sort((a, b) =>
    Number(!!b.isRecommended) - Number(!!a.isRecommended) || Number(b.genre === priorityGenre) - Number(a.genre === priorityGenre) || (stable ? 0 : b.name.length - a.name.length) || a.artistId.localeCompare(b.artistId))) {
    if (labels.length >= limit) break
    const cx = (dot.x + dot.d / 2) * view.z + view.x
    const cy = (dot.y + dot.d / 2) * view.z + view.y
    if (cx < 352 || cx > width - rightInset || cy < 12 || cy > height - 80) continue
    const r = dot.d / 2 * view.z
    const naturalWidth = dot.name.length * (dot.isRecommended ? 6 : 7) + 16
    const w = Math.min(dot.isRecommended ? 180 : showAll ? 96 : 128, naturalWidth)
    const h = showAll ? Math.ceil(naturalWidth / w) * 16 + 6 : !dot.isRecommended && naturalWidth > 128 ? 38 : 22
    const options = (stable ? [10] : [10, 28, 50, 78, 106, 134]).flatMap(gap => {
      const above = { x: cx - w / 2, y: cy - r - gap - h, w, h }
      if (!dense || stable) return [above]
      return [above,
        { x: cx - w / 2, y: cy + r + gap, w, h },
        { x: cx + r + gap, y: cy - h / 2, w, h },
        { x: cx - r - gap - w, y: cy - h / 2, w, h },
        { x: cx + r + gap, y: cy - r - gap - h, w, h },
        { x: cx - r - gap - w, y: cy - r - gap - h, w, h },
        { x: cx + r + gap, y: cy + r + gap, w, h },
        { x: cx - r - gap - w, y: cy + r + gap, w, h },
      ]
    })
    // Detail zoom must identify every visible artist, not silently suppress
    // names to satisfy the overview's collision-avoidance policy.
    const fits = rect => rect.x >= 352 && rect.x + rect.w <= width - rightInset && rect.y >= 12 && rect.y + rect.h <= height - 80 && ![...obstacles, ...labels].some(other => overlaps(rect, other))
    const nearby = showAll ? [10, 28, 50, 78, 106, 134].flatMap(gap => [
      { x: Math.max(352, Math.min(cx - w / 2, width - rightInset - w)), y: cy - r - gap - h, w, h },
      { x: Math.max(352, Math.min(cx - w / 2, width - rightInset - w)), y: cy + r + gap, w, h },
    ]) : []
    const position = showAll
      ? nearby.find(fits)
        ?? nearby.find(rect => rect.y >= 12 && rect.y + h <= height - 80 && !labels.some(other => overlaps(rect, other)))
        ?? nearby.find(rect => rect.y >= 12 && rect.y + h <= height - 80)
      : options.find(fits)
    if (position) labels.push({ ...position, artistId: dot.artistId, text: dot.name, colour: dot.labelColour ?? dot.fill,
      ...(dot.isRecommended ? { recommended: true } : {}) })
  }

  return labels
}
