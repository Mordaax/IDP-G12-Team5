// Deterministic spatial layout, independent of audience links.
// Optional future links must derive from these positions, never the other way around.
const CENTRES = {
  pop: [750, 240], rock: [1160, 220], 'punk-metal': [1600, 260],
  hiphop: [1560, 650], 'rnb-soul': [1130, 790], electronic: [700, 650], traditional: [1830, 930],
}
// Stable noise makes the map organic without moving artists between reloads.
function noise(id, salt) {
  let hash = 2166136261
  for (const character of `${id}:${salt}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619)
  hash ^= hash >>> 16
  hash = Math.imul(hash, 2246822507)
  hash ^= hash >>> 13
  return (hash >>> 0) / 4294967296
}
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function buildCatalogueGraph(catalogue) {
  const children = Object.fromEntries(catalogue.subgenres.map(child => [child.id, child]))
  const dots = []
  const preferences = new Map()
  for (const family of catalogue.genreFamilies) {
    const [cx, cy] = CENTRES[family.id]
    const members = catalogue.artists.filter(artist => artist.primaryGenreId === family.id && artist.mapPlacement !== 'append').sort((a, b) => a.id.localeCompare(b.id))
    members.forEach(artist => {
      preferences.set(artist.id, {
        x: cx + (noise(artist.id, 'anchor-x') - 0.5) * 150,
        y: cy + (noise(artist.id, 'anchor-y') - 0.5) * 130,
        spacing: 58 + noise(artist.id, 'spacing') * 112,
        minX: 490 + noise(artist.id, 'left-bound') * 40,
        maxX: 1920 - noise(artist.id, 'right-bound') * 40,
        minY: 70 + noise(artist.id, 'top-bound') * 60,
        maxY: 1030 - noise(artist.id, 'bottom-bound') * 40,
      })
      dots.push({ artistId: artist.id, name: artist.name, genre: family.id,
        subgenre: children[artist.subgenreIds[0]].label,
        fill: children[artist.subgenreIds[0]].colour.css, d: 24,
        foreground: children[artist.subgenreIds[0]].colour.foreground ?? '#fff',
        labelColour: children[artist.subgenreIds[0]].colour.textCss ?? children[artist.subgenreIds[0]].colour.css,
        x: cx + (noise(artist.id, 'x1') + noise(artist.id, 'x2') - 1) * 260,
        y: cy + (noise(artist.id, 'y1') + noise(artist.id, 'y2') - 1) * 210,
      })
    })
  }
  // Relax once at load, not on every render. Repulsion supplies breathing room without rigid rings.
  for (let iteration = 0; iteration < 190; iteration++) {
    const force = new Map(dots.map(dot => {
      const { x, y } = preferences.get(dot.artistId)
      return [dot.artistId, { x: (x - dot.x) * 0.0045, y: (y - dot.y) * 0.0045 }]
    }))
    for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i], b = dots[j], dx = b.x - a.x, dy = b.y - a.y
      const distance = Math.max(0.01, Math.hypot(dx, dy))
      const spacing = (preferences.get(a.artistId).spacing + preferences.get(b.artistId).spacing) / 2
      if (distance < spacing) {
        const push = (spacing - distance) * 0.24 / distance
        force.get(a.artistId).x -= dx * push; force.get(a.artistId).y -= dy * push
        force.get(b.artistId).x += dx * push; force.get(b.artistId).y += dy * push
      }
    }
    for (const dot of dots) {
      const f = force.get(dot.artistId)
      const bounds = preferences.get(dot.artistId)
      dot.x = clamp(dot.x + clamp(f.x, -8, 8), bounds.minX, bounds.maxX)
      dot.y = clamp(dot.y + clamp(f.y, -8, 8), bounds.minY, bounds.maxY)
    }
  }
  // A final collision projection enforces a readable minimum gap, including at cluster boundaries.
  for (let pass = 0; pass < 45; pass++) {
    for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i], b = dots[j], dx = b.x - a.x, dy = b.y - a.y
      const distance = Math.max(0.01, Math.hypot(dx, dy))
      if (distance < 52) {
        const shift = (52 - distance) / (2 * distance)
        const ab = preferences.get(a.artistId), bb = preferences.get(b.artistId)
        a.x = clamp(a.x - dx * shift, ab.minX, ab.maxX); a.y = clamp(a.y - dy * shift, ab.minY, ab.maxY)
        b.x = clamp(b.x + dx * shift, bb.minX, bb.maxX); b.y = clamp(b.y + dy * shift, bb.minY, bb.maxY)
      }
    }
  }
  // Place additions beside their scene without moving existing dots or changing nearest-two pairs.
  for (const artist of catalogue.artists.filter(artist => artist.mapPlacement === 'append').sort((a, b) => a.id.localeCompare(b.id))) {
    const family = catalogue.genreFamilies.find(family => family.id === artist.primaryGenreId)
    const child = children[artist.subgenreIds[0]]
    const members = dots.filter(dot => dot.genre === family.id)
    const cx = members.reduce((sum, dot) => sum + dot.x, 0) / members.length
    const cy = members.reduce((sum, dot) => sum + dot.y, 0) / members.length
    const exclusions = dots.map(dot => ({ ...dot, radius: Math.max(72,
      dots.filter(other => other !== dot).map(other => Math.hypot(dot.x - other.x, dot.y - other.y)).sort((a, b) => a - b)[1] + 1) }))
    let position = null
    let bestDistance = Infinity
    for (let x = 490; x <= 1900; x += 24) for (let y = 70; y <= 1010; y += 24) {
      const distance = Math.hypot(x - cx, y - cy)
      if (distance < bestDistance && exclusions.every(dot => Math.hypot(x - dot.x, y - dot.y) >= dot.radius)) {
        position = { x, y }; bestDistance = distance
      }
    }
    if (!position) throw new Error(`No clear map position for ${artist.id}`)
    dots.push({ artistId: artist.id, name: artist.name, genre: family.id,
      avatar: artist.images?.avatar,
      subgenre: child?.label ?? family.label, fill: child?.colour.css ?? family.hex,
      foreground: child?.colour.foreground ?? '#fff', labelColour: child?.colour.textCss ?? child?.colour.css ?? family.hex,
      d: 24, ...position })
  }
  const labels = catalogue.genreFamilies.map(family => {
    const members = dots.filter(dot => dot.genre === family.id)
    return [members.reduce((sum, dot) => sum + dot.x, 0) / members.length - 100,
      Math.min(...members.map(dot => dot.y)) - 48, 20, 600, family.hex, family.label, family.id]
  })
  // Rendering uses top-left + diameter; the simulation above uses centre coordinates.
  for (const dot of dots) { dot.x = Math.round((dot.x - dot.d / 2) * 100) / 100; dot.y = Math.round((dot.y - dot.d / 2) * 100) / 100 }
  return { dots, edges: catalogue.sharedAudiences, labels }
}

// Line weight represents pairwise shared listeners, never artist popularity or unique totals.
export function audienceLineWidth(count) {
  return 1.3 * Math.max(0.65, Math.min(2.8, 0.65 + Math.sqrt(Math.max(0, count) / 2400) * 2.15))
}

// Shape the display into a loose disc. The seeded layout and audience data stay intact.
export function circularGraph(base) {
  const cx = 1200, cy = 550, radius = 475
  const sectorWidth = Math.PI * 2 / base.labels.length
  const angles = new Map(base.labels.map((label, index) => [label[6], -Math.PI / 2 + index * sectorWidth]))
  const positions = new Map()
  for (const label of base.labels) {
    const members = base.dots.filter(dot => dot.genre === label[6]).sort((a, b) => a.artistId.localeCompare(b.artistId))
    members.forEach((dot, index) => {
      const angle = angles.get(dot.genre) + (((index * .61803398875 + .23) % 1) - .5) * sectorWidth * .8
      const r = radius * Math.sqrt((index + .2) / members.length)
      positions.set(dot.artistId, { ...dot, x: cx + Math.cos(angle) * r - dot.d / 2, y: cy + Math.sin(angle) * r - dot.d / 2 })
    })
  }
  const dots = base.dots.map(dot => positions.get(dot.artistId))
  const ordered = [...dots].sort((a, b) => a.artistId.localeCompare(b.artistId))
  for (let pass = 0; pass < 90; pass++) {
    for (let i = 0; i < ordered.length; i++) for (let j = i + 1; j < ordered.length; j++) {
      const a = ordered[i], b = ordered[j]
      const dx = b.x - a.x, dy = b.y - a.y
      const distance = Math.max(.01, Math.hypot(dx, dy))
      if (distance >= 42) continue
      const shift = (42 - distance) / (2 * distance)
      a.x -= dx * shift; a.y -= dy * shift
      b.x += dx * shift; b.y += dy * shift
    }
    for (const dot of dots) {
      const dx = dot.x + dot.d / 2 - cx, dy = dot.y + dot.d / 2 - cy
      const distance = Math.hypot(dx, dy)
      const centreAngle = angles.get(dot.genre)
      const offset = Math.atan2(Math.sin(Math.atan2(dy, dx) - centreAngle), Math.cos(Math.atan2(dy, dx) - centreAngle))
      const angle = centreAngle + clamp(offset, -sectorWidth * .43, sectorWidth * .43)
      const r = clamp(distance, 20, radius)
      dot.x = cx + Math.cos(angle) * r - dot.d / 2
      dot.y = cy + Math.sin(angle) * r - dot.d / 2
    }
  }
  const labels = base.labels.map(label => {
    const angle = angles.get(label[6])
    return [cx + Math.cos(angle) * 510 - label[5].length * 5,
      cy + Math.sin(angle) * 510 - 10, ...label.slice(2)]
  })
  return { ...base, dots, labels, overviewBounds: {
    minX: cx - radius - 48, maxX: cx + radius + 48,
    minY: cy - radius - 48, maxY: cy + radius + 48,
  } }
}
