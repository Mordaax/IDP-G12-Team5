import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link, { useGo } from '@/components/AppLink'
import { GENRE_BY_KEY, ROUTES } from '@/data'
import { useToast } from '@/lib/toast'
import { GENRE_BY_HEX, fansFor, nameDots } from './artists'

// The Discover "web of dots": one dot per artist, lines for shared audiences.
//   drag to move · scroll (or + / –) to zoom · hover a dot to see who it is and who shares
//   its fans · click a dot to open the artist.
// Positions come from Figma (src/data/db.json → "discover"), drawn on a 1440 × 828 map.

export const MAP_W = 1440
export const MAP_H = 828
const MIN_Z = 0.5
const MAX_Z = 4

// ---- the shared-audience lines ---------------------------------------------------------------
// Each graph-links*.svg is a single path of straight segments; read it once and turn it into
// [x1, y1, x2, y2] segments in map coordinates.
const linkCache = new Map()
function loadSegments(src) {
  if (!linkCache.has(src)) {
    linkCache.set(src, fetch(src).then((r) => r.text()).then((svg) => {
      const vb = (svg.match(/viewBox="([^"]+)"/)?.[1] || '0 0 1 1').split(/[\s,]+/).map(Number)
      const d = svg.match(/ d="([^"]+)"/)?.[1] || ''
      const tokens = d.match(/[MLHVZmlhvz]|-?\d*\.?\d+(?:e-?\d+)?/g) || []
      const segs = []
      let cmd = 'M'
      let x = 0, y = 0, sx = 0, sy = 0
      for (let i = 0; i < tokens.length; ) {
        if (/[a-z]/i.test(tokens[i])) cmd = tokens[i++]
        const rel = cmd === cmd.toLowerCase()
        const num = () => Number(tokens[i++])
        switch (cmd.toUpperCase()) {
          case 'M': x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num(); sx = x; sy = y; cmd = rel ? 'l' : 'L'; break
          case 'L': { const nx = (rel ? x : 0) + num(); const ny = (rel ? y : 0) + num(); segs.push([x, y, nx, ny]); x = nx; y = ny; break }
          case 'H': { const nx = (rel ? x : 0) + num(); segs.push([x, y, nx, y]); x = nx; break }
          case 'V': { const ny = (rel ? y : 0) + num(); segs.push([x, y, x, ny]); y = ny; break }
          case 'Z': segs.push([x, y, sx, sy]); x = sx; y = sy; break
          default: i++
        }
      }
      return { vb, segs }
    }))
  }
  return linkCache.get(src)
}

// Colours baked into the Figma graph data go through the theme as var(--lrm-raw-<hex>, #hex):
// unchanged by default, and src/theme/raw-colours.css maps the non-genre ones (the dashed ring,
// cluster labels, sub-genre shades) to guide colours in the style-guide theme.
const themed = (c) => (c && /^#[0-9a-f]{6}$/i.test(c) ? `var(--lrm-raw-${c.slice(1).toLowerCase()}, ${c})` : c)

/** Parse the compact Figma dot strings: "x,y,d,hex[,s<stroke>/<width>/<dash-gap>] …" */
export function parseDots(str) {
  return str.split(' ').map((s) => {
    const [x, y, d, fill, stroke] = s.split(',')
    const st = stroke?.startsWith('s') ? stroke.slice(1).split('/') : null
    const hex = fill === '-' ? null : fill.toLowerCase()
    return {
      x: +x, y: +y, d: +d,
      fill: hex ? themed(`#${hex}`) : 'none',
      hex,
      genre: hex ? GENRE_BY_HEX[hex] || null : null, // dashed rings are decoration, not artists
      stroke: st ? themed(`#${st[0]}`) : undefined,
      sw: st ? st[1] : undefined,
      dash: st && st[2] ? st[2].replace('-', ' ') : undefined,
    }
  })
}

export default function WebOfDots({
  dots, // [{ x, y, d, fill, genre, … }] — top-left corner + diameter, like Figma
  links, // { src, x, y, w, h }: where the line layer sits on the map
  labels = [], // [x, y, size, weight, colour, text]
  linkHrefs = {}, // label text → address
  photos = [], // [{ x, y, size, src, name }] artist photo dots
  featured = [], // pin names to spots: [{ x, y, name, artistId, to }]
  isDim = () => false, // (dot) → true to fade it (genre filter / chips)
  signedIn = false,
  label,
  controls, // ({ zoomIn, zoomOut, reset }) => buttons drawn over the map
  children, // anything else drawn on the map (taste chips, rings …)
}) {
  const root = useRef(null)
  const go = useGo()
  const toast = useToast()
  const [view, setView] = useState(null) // screen = map * z + (x, y)
  const [hover, setHover] = useState(null)
  const [picked, setPicked] = useState(null)
  const [segments, setSegments] = useState([])
  const [following, setFollowing] = useState(() => new Set())
  const drag = useRef(null)
  const dragged = useRef(false) // the last press was a drag, not a click

  // ---- artists: dots + photo dots, with names and who they share fans with ----------------
  const artists = useMemo(() => {
    const all = [
      ...dots.map((d) => ({ ...d, cx: d.x + d.d / 2, cy: d.y + d.d / 2 })),
      ...photos.map((p) => ({ x: p.x, y: p.y, d: p.size, cx: p.x + p.size / 2, cy: p.y + p.size / 2, genre: p.genre, photo: p.src, fill: 'none', to: p.to })),
    ]
    const names = nameDots(all, [
      ...photos.map((p) => ({ x: p.x + p.size / 2, y: p.y + p.size / 2, name: p.name, artistId: p.artistId })),
      ...featured,
    ])
    return all.map((a, i) => ({ ...a, i, ...(names[i] || {}) }))
  }, [dots, photos, featured])

  useEffect(() => {
    let alive = true
    loadSegments(links.src).then(({ vb, segs }) => {
      if (!alive) return
      const kx = links.w / vb[2]
      const ky = links.h / vb[3]
      setSegments(segs.map(([x1, y1, x2, y2]) => [links.x + (x1 - vb[0]) * kx, links.y + (y1 - vb[1]) * ky, links.x + (x2 - vb[0]) * kx, links.y + (y2 - vb[1]) * ky]))
    })
    return () => { alive = false }
  }, [links.src, links.x, links.y, links.w, links.h])

  // snap each line end to the artist it touches → who shares an audience with whom
  const graph = useMemo(() => {
    const people = artists.filter((a) => a.genre)
    const nearest = (x, y) => {
      let best = null
      let bestDist = Infinity
      for (const a of people) {
        const dist = Math.hypot(a.cx - x, a.cy - y)
        if (dist < bestDist) { bestDist = dist; best = a }
      }
      return best && bestDist <= Math.max(8, best.d / 2 + 4) ? best.i : null
    }
    const adj = new Map(artists.map((a) => [a.i, new Set()]))
    const edges = []
    for (const [x1, y1, x2, y2] of segments) {
      const a = nearest(x1, y1)
      const b = nearest(x2, y2)
      edges.push({ x1, y1, x2, y2, a, b })
      if (a != null && b != null && a !== b) {
        adj.get(a).add(b)
        adj.get(b).add(a)
      }
    }
    return { adj, edges, base: edges.map((e) => `M${e.x1} ${e.y1}L${e.x2} ${e.y2}`).join('') }
  }, [artists, segments])

  // ---- view: start centred, like the Figma frame ------------------------------------------
  // the whole web fits the window: bigger on large screens, smaller on short ones
  const fitView = () => {
    const el = root.current
    const z = Math.min(1.8, Math.max(0.55, Math.min(el.clientWidth / MAP_W, el.clientHeight / MAP_H)))
    return { z, x: (el.clientWidth - MAP_W * z) / 2, y: (el.clientHeight - MAP_H * z) / 2 }
  }
  const reset = useCallback(() => {
    if (root.current) setView(fitView())
    setPicked(null)
  }, [])
  useLayoutEffect(() => {
    reset()
    const onResize = () => setView(fitView())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [reset])

  const zoomAt = (factor, cx, cy) =>
    setView((v) => {
      const z = Math.min(MAX_Z, Math.max(MIN_Z, v.z * factor))
      return { z, x: cx - ((cx - v.x) / v.z) * z, y: cy - ((cy - v.y) / v.z) * z }
    })
  const zoomCentre = (factor) => zoomAt(factor, root.current.clientWidth / 2, root.current.clientHeight / 2)

  // page zoom on small windows (see lib/viewport.js): pointer positions are in screen px
  const pageZoom = () => parseFloat(document.documentElement.style.zoom) || 1

  useEffect(() => {
    const el = root.current
    const onWheel = (e) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const z = pageZoom()
      const amount = Math.max(-40, Math.min(40, e.deltaY))
      zoomAt(Math.exp(-amount * 0.006), (e.clientX - r.left) / z, (e.clientY - r.top) / z)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false }
    dragged.current = false
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const z = pageZoom()
    const dx = (e.clientX - d.sx) / z
    const dy = (e.clientY - d.sy) / z
    if (!d.moved && Math.hypot(dx, dy) < 4) return
    if (!d.moved) {
      root.current.setPointerCapture(e.pointerId)
      setHover(null)
    }
    d.moved = true
    dragged.current = true
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }))
  }
  const onPointerUp = (e) => {
    const d = drag.current
    if (d?.moved) root.current.releasePointerCapture(e.pointerId)
    else if (d && e.target === root.current) setPicked(null) // click on empty map closes the card
    drag.current = null
  }

  const clickArtist = (a) => {
    if (dragged.current) return
    if (a.to) return go(a.to)
    setPicked((p) => (p === a.i ? null : a.i))
  }

  // ---- what to light up ---------------------------------------------------------------------
  const focus = hover ?? picked
  const near = focus != null ? graph.adj.get(focus) : null
  const lit = (i) => focus == null || i === focus || near.has(i)
  const focusEdges = focus != null ? graph.edges.filter((e) => e.a === focus || e.b === focus).map((e) => `M${e.x1} ${e.y1}L${e.x2} ${e.y2}`).join('') : ''
  const anyDim = artists.some((a) => a.genre && isDim(a))

  const card = focus != null && view ? artists[focus] : null

  return (
    <>
      <div
        ref={root}
        role="application"
        aria-label={label}
        className={`absolute inset-0 select-none overflow-hidden ${drag.current?.moved ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {view && (
          <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: MAP_W, height: MAP_H, transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}>
            <svg className="absolute left-0 top-0 overflow-visible" width={MAP_W} height={MAP_H} aria-hidden="true">
              <path d={graph.base} fill="none" stroke="var(--lrm-raw-4e4a57)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity={focus != null ? 0.15 : anyDim ? 0.3 : 0.9} className="transition-opacity duration-200" />
              {focusEdges && <path d={focusEdges} fill="none" stroke="var(--lrm-raw-1a1a1a)" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
              {artists.filter((a) => !a.photo).map((a) => {
                const dim = (a.genre && isDim(a)) || !lit(a.i)
                const isFocus = a.i === focus
                return (
                  <circle
                    key={a.i}
                    cx={a.cx}
                    cy={a.cy}
                    r={a.d / 2 * (isFocus ? 1.35 : 1)}
                    fill={a.fill}
                    stroke={isFocus ? 'var(--lrm-raw-1a1a1a)' : a.stroke}
                    strokeWidth={isFocus ? 2 : a.sw}
                    vectorEffect={isFocus ? 'non-scaling-stroke' : undefined}
                    strokeDasharray={a.dash}
                    opacity={a.genre && dim ? 0.15 : 1}
                    className={`transition-[opacity,r] duration-150 ${a.genre ? 'pointer-events-auto cursor-pointer' : ''}`}
                    onPointerEnter={a.genre ? () => setHover(a.i) : undefined}
                    onPointerLeave={a.genre ? () => setHover((h) => (h === a.i ? null : h)) : undefined}
                    onClick={a.genre ? () => clickArtist(a) : undefined}
                  />
                )
              })}
              {/* a bigger invisible target around small dots, so they're easy to hover */}
              {artists.filter((a) => a.genre && !a.photo && a.d < 12).map((a) => (
                <circle key={`hit${a.i}`} cx={a.cx} cy={a.cy} r={7 / view.z + 1} fill="transparent" className="pointer-events-auto cursor-pointer"
                  onPointerEnter={() => setHover(a.i)} onPointerLeave={() => setHover((h) => (h === a.i ? null : h))} onClick={() => clickArtist(a)} />
              ))}
            </svg>

            {artists.filter((a) => a.photo).map((a) => (
              <button key={a.i} type="button" aria-label={a.name}
                onPointerEnter={() => setHover(a.i)} onPointerLeave={() => setHover((h) => (h === a.i ? null : h))} onClick={() => clickArtist(a)}
                className={`pointer-events-auto absolute rounded-full transition-[transform,opacity] ${a.i === focus ? 'scale-125' : ''}`}
                style={{ left: a.x, top: a.y, width: a.d, height: a.d, opacity: lit(a.i) && !(a.genre && isDim(a)) ? 1 : 0.25 }}>
                <img src={a.photo} alt="" width={a.d} height={a.d} draggable={false} className="size-full max-w-none" />
              </button>
            ))}

            {labels.map(([x, y, size, weight, color, text]) => {
              const style = { left: x, top: y, fontSize: size, fontWeight: weight, color: themed(color), opacity: focus != null ? 0.35 : 1 }
              const href = linkHrefs[text]
              return href ? (
                <Link key={text} to={href} draggable={false} className="pointer-events-auto absolute whitespace-nowrap leading-[1.4] underline-offset-4 transition-opacity hover:underline" style={style}>{text}</Link>
              ) : (
                <p key={text} className="absolute m-0 whitespace-nowrap leading-[1.4] transition-opacity" style={style}>{text}</p>
              )
            })}

            <div className="pointer-events-auto">{children}</div>
          </div>
        )}

        {card && <ArtistCard artist={card} view={view} root={root} pinned={picked === card.i} neighbours={[...graph.adj.get(card.i)].map((i) => artists[i])}
          signedIn={signedIn} following={following.has(card.name)}
          onFollow={() => { const on = !following.has(card.name); setFollowing((f) => { const n = new Set(f); if (on) n.add(card.name); else n.delete(card.name); return n }); toast(on ? `Following ${card.name}` : `Unfollowed ${card.name}`) }}
          onPick={(i) => setPicked(i)} onClose={() => setPicked(null)} go={go} />}
      </div>
      {controls?.({ zoomIn: () => zoomCentre(1.3), zoomOut: () => zoomCentre(1 / 1.3), reset })}
    </>
  )
}

/** Hover: a small label. Click: a card with the artist, who shares their fans, and what to do next. */
function ArtistCard({ artist: a, view, root, pinned, neighbours, signedIn, following, onFollow, onPick, onClose, go }) {
  const genre = GENRE_BY_KEY[a.genre]
  const sx = a.cx * view.z + view.x
  const sy = a.cy * view.z + view.y
  const r = (a.d / 2) * view.z
  const w = pinned ? 280 : 220
  const right = sx + r + 14 + w < (root.current?.clientWidth ?? 1440)
  const style = { left: right ? sx + r + 14 : sx - r - 14 - w, top: Math.max(12, sy - 28), width: w }

  return (
    <div
      className={`absolute z-20 animate-pop rounded-panel border border-line bg-surface p-[14px] text-left shadow-pop ${pinned ? 'pointer-events-auto cursor-default' : 'pointer-events-none'}`}
      style={style}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-[10px]">
        {a.photo
          ? <img src={a.photo} alt="" width="36" height="36" className="size-[36px] rounded-full" />
          : <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: a.fill }}>{a.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[14px] font-semibold text-ink">{a.name}</p>
          <p className="m-0 flex items-center gap-[5px] text-[11px] text-muted"><span className="size-[7px] rounded-full" style={{ background: genre.dot }} />{genre.name} · {fansFor(a.d)} fans</p>
        </div>
        {pinned && <button type="button" onClick={onClose} aria-label="Close" className="-mr-[4px] -mt-[18px] flex size-[24px] items-center justify-center rounded-full text-[16px] text-subtle hover:bg-soft">×</button>}
      </div>
      <p className="m-0 mt-[10px] text-[11px] text-muted">
        {neighbours.length ? <>Shares fans with <b className="font-semibold text-ink">{neighbours.length}</b> artist{neighbours.length === 1 ? '' : 's'}</> : 'No shared audiences yet'}
      </p>
      {!pinned && <p className="m-0 mt-[6px] text-[10px] text-subtle">Click to open</p>}

      {pinned && (
        <>
          {neighbours.length > 0 && (
            <div className="mt-[8px] flex flex-wrap gap-[6px]">
              {neighbours.slice(0, 4).map((n) => (
                <button key={n.i} type="button" onClick={() => onPick(n.i)} className="flex items-center gap-[5px] rounded-full border border-line bg-soft px-[9px] py-[4px] text-[11px] font-medium text-ink hover:bg-soft">
                  <span className="size-[6px] rounded-full" style={{ background: GENRE_BY_KEY[n.genre].dot }} />{n.name}
                </button>
              ))}
            </div>
          )}
          <div className="mt-[12px] flex gap-[8px]">
            {!signedIn ? (
              <Link to={ROUTES.signup} className="flex h-[36px] flex-1 items-center justify-center rounded-control bg-accent text-[12px] font-semibold text-on-accent hover:bg-accent-hover">Sign up to follow</Link>
            ) : (
              <>
                <button type="button" onClick={onFollow} className={`h-[36px] flex-1 rounded-control text-[12px] font-semibold ${following ? 'border-[1.5px] border-ink text-ink' : 'bg-accent text-on-accent hover:bg-accent-hover'}`}>{following ? 'Following ✓' : 'Follow'}</button>
                {a.artistId === 'fallingislands'
                  ? <button type="button" onClick={() => go(ROUTES.artist)} className="h-[36px] flex-1 rounded-control border-[1.5px] border-ink text-[12px] font-semibold text-ink hover:bg-wash">Artist page</button>
                  : a.artistId
                    ? <button type="button" onClick={() => go(`${ROUTES.eventsList}?artist=${a.artistId}`)} className="h-[36px] flex-1 rounded-control border-[1.5px] border-ink text-[12px] font-semibold text-ink hover:bg-wash">See gigs</button>
                    : <span className="flex h-[36px] flex-1 items-center justify-center text-center text-[11px] leading-tight text-subtle">No gigs announced</span>}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
