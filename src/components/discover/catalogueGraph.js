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
    const members = catalogue.artists.filter(artist => artist.primaryGenreId === family.id).sort((a, b) => a.id.localeCompare(b.id))
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
