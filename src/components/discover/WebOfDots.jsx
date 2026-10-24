import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link, { useGo } from '@/components/AppLink'
import { GENRE_BY_KEY, ROUTES } from '@/data'
import { useToast } from '@/lib/toast'
import { audienceLineWidth } from './catalogueGraph'
import { artistCamera, cameraDetail, fitArtistsCamera, subgenreLabels } from './genreCamera'
import { artistTrackTitle } from './recommendations'
import { personalisedCamera } from './personalisedGraph'
import './map-transition.css'

// The Discover "web of dots": one dot per artist, lines for shared audiences.
//   drag to move · scroll (or + / –) to zoom · hover a dot to see who it is and who shares
//   its fans · click a dot to open the artist.
// Stable catalogue IDs and explicit audience pairs, drawn on a 2000 × 1100 map.

export const MAP_W = 2000
export const MAP_H = 1100
// Display-only switch: set true to restore lines; relationship data and cards stay intact.
export const SHOW_AUDIENCE_CONNECTIONS = false
// Optical alignment of the web within the Discover frame, in map coordinates.
const RECENTRE_OFFSET_X = 48
const MIN_Z = 0.5
const MAX_Z = 4

export default function WebOfDots({
  ref: cameraRef,
  onGenreFocusChange,
  viewKey,
  overviewBounds,
  regions,
  recommendationArea,
  activePreview,
  onTogglePreview,
  previewRows = [],
  rightInset = 24,
  dots, // [{ x, y, d, fill, genre, … }] — top-left corner + diameter, like Figma
  edges = [], // explicit { sourceArtistId, targetArtistId, sharedListenerCount }
  labels = [], // [x, y, size, weight, colour, text]
  linkHrefs = {}, // label text → address
  isDim = () => false, // optional external dimming state; genre shortcuts never filter dots
  signedIn = false,
  label,
  controls, // ({ zoomIn, zoomOut, reset }) => buttons drawn over the map
  children, // anything else drawn on the map (taste chips, rings …)
}) {
  const root = useRef(null)
  const go = useGo()
  const toast = useToast()
  const viewRef = useRef(null)
  const flight = useRef(null)
  const [view, setView] = useState(null) // screen = map * z + (x, y)
  const [hover, setHover] = useState(null)
  const [picked, setPicked] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [following, setFollowing] = useState(() => new Set())
  const [localPreview, setLocalPreview] = useState(null)
  const playing = activePreview === undefined ? localPreview : activePreview
  const togglePreview = onTogglePreview ?? (track => setLocalPreview(current =>
    current?.artistId === track.artistId && current.title === track.title ? null : track))
  const drag = useRef(null)
  const dragged = useRef(false) // the last press was a drag, not a click
  const lastMode = useRef(viewKey)
  const [morphing, setMorphing] = useState(false)
  useLayoutEffect(() => {
    if (lastMode.current === viewKey) return
    lastMode.current = viewKey
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setMorphing(true)
    const timer = setTimeout(() => setMorphing(false), 1000)
    return () => clearTimeout(timer)
  }, [viewKey])

  const artists = useMemo(() => dots.map((dot, i) => ({ ...dot, i, cx: dot.x + dot.d / 2, cy: dot.y + dot.d / 2 })), [dots])
  const graph = useMemo(() => {
    const byId = new Map(artists.map(artist => [artist.artistId, artist]))
    const adj = new Map(artists.map(artist => [artist.i, new Set()]))
    const mapped = edges.flatMap(edge => {
      const a = byId.get(edge.sourceArtistId), b = byId.get(edge.targetArtistId)
      if (!a || !b) return []
      adj.get(a.i).add(b.i); adj.get(b.i).add(a.i)
      return [{ ...edge, a: a.i, b: b.i, x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy }]
    })
    return { adj, edges: mapped }
  }, [artists, edges])

  const stopFlight = useCallback(() => {
    if (flight.current != null) cancelAnimationFrame(flight.current)
    flight.current = null
  }, [])
  const flyTo = useCallback(target => {
    stopFlight()
    const start = viewRef.current || target
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setView(target); return }
    const started = performance.now()
    const step = now => {
      const progress = Math.min(1, (now - started) / 500)
      const eased = 1 - (1 - progress) ** 3
      setView({ x: start.x + (target.x - start.x) * eased,
        y: start.y + (target.y - start.y) * eased, z: start.z + (target.z - start.z) * eased })
      if (progress < 1) flight.current = requestAnimationFrame(step)
      else flight.current = null
    }
    flight.current = requestAnimationFrame(step)
  }, [stopFlight])
  useLayoutEffect(() => { viewRef.current = view }, [view])

  // ---- view: start centred, like the Figma frame ------------------------------------------
  // the whole web fits the window: bigger on large screens, smaller on short ones
  const fitView = () => {
    const el = root.current
    if (overviewBounds) return personalisedCamera(overviewBounds, el.clientWidth, el.clientHeight)
    const z = Math.min(1.8, Math.max(0.55, Math.min(el.clientWidth / MAP_W, el.clientHeight / MAP_H)))
    return { z, x: (el.clientWidth - MAP_W * z) / 2 + RECENTRE_OFFSET_X * z, y: (el.clientHeight - MAP_H * z) / 2 }
  }
  const reset = useCallback(() => {
    stopFlight()
    if (root.current) setView(fitView())
    setPicked(null)
    setHover(null)
    setSelectedGenre(null)
  }, [stopFlight, overviewBounds])
  useLayoutEffect(() => {
    reset()
    const onResize = () => reset()
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); stopFlight() }
  }, [reset, viewKey])

  const zoomAt = useCallback((factor, cx, cy) => {
    setMorphing(false)
    setSelectedGenre(null)
    stopFlight()
    setView((v) => {
      const minZoom = overviewBounds ? Math.min(MIN_Z, personalisedCamera(overviewBounds, root.current.clientWidth, root.current.clientHeight).z) : MIN_Z
      const z = Math.min(MAX_Z, Math.max(minZoom, v.z * factor))
      return { z, x: cx - ((cx - v.x) / v.z) * z, y: cy - ((cy - v.y) / v.z) * z }
    })
  }, [overviewBounds, stopFlight])
  const zoomCentre = (factor) => zoomAt(factor, root.current.clientWidth / 2, root.current.clientHeight / 2)

  const focusGenre = useCallback(key => {
    setMorphing(false)
    const el = root.current
    if (!el) return
    const togglingOut = selectedGenre === key
    const target = togglingOut ? fitView() : fitArtistsCamera(artists.filter(artist => artist.genre === key), el.clientWidth, el.clientHeight, { rightInset })
    if (!target) return
    setPicked(null); setHover(null)
    setSelectedGenre(togglingOut ? null : key)
    flyTo(target)
  }, [artists, flyTo, overviewBounds, rightInset, selectedGenre])
  const focusArtist = useCallback(id => {
    const artist = artists.find(item => item.artistId === id)
    const el = root.current
    if (!artist || !el) return
    setMorphing(false); setSelectedGenre(artist.genre); setHover(null); setPicked(artist.i)
    flyTo(artistCamera(artist, el.clientWidth, el.clientHeight, { rightInset }))
  }, [artists, flyTo, rightInset])
  const tourArtist = artists.find(artist => artist.artistId === 'dj-beatroot') || artists.find(artist => artist.genre === 'electronic')
  useImperativeHandle(cameraRef, () => ({ focusGenre, focusArtist, prepareTourStep(step) {
    if (step === 0 || step === 3) { reset(); return }
    if (!tourArtist || !root.current) return
    stopFlight()
    setHover(null)
    const z = 1.8
    setView({ z, x: root.current.clientWidth * .53 - tourArtist.cx * z, y: root.current.clientHeight * .42 - tourArtist.cy * z })
    setPicked(step === 2 ? tourArtist.i : null)
  } }), [focusGenre, focusArtist, reset, stopFlight, tourArtist])
  const { showArtists, genre: detailGenre } = cameraDetail(artists, view,
    root.current?.clientWidth ?? 0, root.current?.clientHeight ?? 0)
  useLayoutEffect(() => { onGenreFocusChange?.(selectedGenre || detailGenre) }, [selectedGenre, detailGenre, onGenreFocusChange])
  const detailLabels = useMemo(() => view?.z >= .95 && root.current
    ? subgenreLabels(artists, null, view, root.current.clientWidth, root.current.clientHeight,
      { rightInset, stable: true, limit: 12, priorityGenre: selectedGenre }) : [], [artists, selectedGenre, view, rightInset])

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
  }, [zoomAt])

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
      setMorphing(false)
      setSelectedGenre(null)
      stopFlight()
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
    setHover(null)
    setPicked((p) => (p === a.i ? null : a.i))
  }

  // ---- what to light up ---------------------------------------------------------------------
  const focus = hover ?? picked
  const near = focus != null ? graph.adj.get(focus) : null
  const lit = (i) => focus == null || i === focus || near?.has(i)

  const card = focus != null && view ? artists[focus] : null
  const playingArtist = artists.find(artist => artist.artistId === playing?.artistId)
  const cardPreview = card ? { artistId: card.artistId,
    title: previewRows.find(row => row.artist.id === card.artistId)?.title ?? artistTrackTitle(card) } : null

  return (
    <>
      <div
        ref={root}
        data-map-mode={viewKey}
        data-map-morphing={morphing ? 'true' : undefined}
        data-map-genre={selectedGenre || detailGenre || undefined}
        data-map-zoom={view?.z}
        data-map-detail={showArtists ? 'artists' : 'genres'}
        role="application"
        aria-label={label}
        className={`discover-map absolute inset-0 select-none overflow-hidden ${drag.current?.moved ? 'cursor-grabbing' : 'cursor-default'}`}
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {view && (
          <div className="discover-map__layer pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: MAP_W, height: MAP_H, transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}>
            <svg className="absolute left-0 top-0 overflow-visible" width={MAP_W} height={MAP_H} aria-label="Artist network">
              {recommendationArea && <g className="pointer-events-none" aria-label="Recommended artists">
                <circle className="discover-recommendation-area" data-recommendation-area="true" cx={recommendationArea.x} cy={recommendationArea.y} r={recommendationArea.radius} style={{ transformOrigin: `${recommendationArea.x}px ${recommendationArea.y}px` }} fill="var(--lrm-brand-tint)" fillOpacity=".75" stroke="var(--lrm-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                {view.z < .95 && <text x={recommendationArea.x} y={recommendationArea.y - recommendationArea.radius + 30} textAnchor="middle" fill="var(--lrm-muted)" fontSize={Math.min(19, 12 / view.z)} fontWeight="600">{recommendationArea.label}</text>}
              </g>}
              {regions && <g className="pointer-events-none" aria-label="Personalised match circles">
                {[...regions.rings].reverse().map(ring => <circle key={ring.id} data-match-ring={ring.id}
                  cx={regions.centre.x} cy={regions.centre.y} r={ring.maxRadius}
                  fill={ring.id === 'subgenre' ? 'var(--lrm-brand-tint)' : ring.id === 'genre' ? 'var(--lrm-canvas)' : 'var(--lrm-soft)'}
                  fillOpacity={0.55} stroke="var(--lrm-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
                {regions.rings.map(ring => <text key={ring.id} data-match-ring-label={ring.id}
                  x={regions.centre.x} y={regions.centre.y - ring.maxRadius + 23 / view.z}
                  textAnchor="middle" fill="var(--lrm-muted)" fontSize={12 / view.z} fontWeight={500}
                  stroke="var(--lrm-canvas)" strokeWidth={6 / view.z} paintOrder="stroke">{ring.label} · {ring.count}</text>)}
              </g>}
              {SHOW_AUDIENCE_CONNECTIONS && graph.edges.map(edge => {
                const active = focus != null && (edge.a === focus || edge.b === focus)
                const dim = isDim(artists[edge.a]) || isDim(artists[edge.b])
                return <line key={edge.id} data-audience-edge={edge.id} data-shared-listeners={edge.sharedListenerCount}
                  x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2}
                  stroke={active ? 'var(--lrm-ink)' : 'var(--lrm-muted)'}
                  strokeWidth={audienceLineWidth(edge.sharedListenerCount) + (active ? 0.8 : 0)}
                  vectorEffect="non-scaling-stroke" opacity={dim ? 0.025 : active ? 0.85 : focus != null ? 0.04 : 0.2} />
              })}
              {artists.filter((a) => !a.photo).map((a) => {
                const dim = (a.genre && isDim(a)) || !lit(a.i)
                const isFocus = a.i === focus
                return (
                  <circle
                    key={a.artistId}
                    data-artist-id={a.artistId}
                    data-tour={a.artistId === tourArtist?.artistId ? 'artist-dot' : undefined}
                    data-genre={a.genre}
                    data-preferred={a.isPreferred == null ? undefined : String(a.isPreferred)}
                    data-recommended={a.isRecommended ? 'true' : undefined}
                    data-match-tier={a.matchTier}
                    role="button"
                    tabIndex={isDim(a) ? -1 : 0}
                    aria-label={`${a.name}, ${a.subgenre}, ${GENRE_BY_KEY[a.genre].name}`}
                    aria-pressed={picked === a.i}
                    onFocus={() => setHover(a.i)}
                    onBlur={() => setHover(null)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dragged.current = false; clickArtist(a) } if (e.key === 'Escape') { setPicked(null); setHover(null) } }}
                    cx={a.cx}
                    cy={a.cy}
                    r={a.d / 2 * (isFocus ? 1.35 : 1)}
                    fill={showArtists ? a.fill : GENRE_BY_KEY[a.genre].dot}
                    stroke={picked === a.i ? '#181818' : a.stroke}
                    strokeWidth={picked === a.i ? 2 : a.sw}
                    vectorEffect={picked === a.i ? 'non-scaling-stroke' : undefined}
                    strokeDasharray={a.dash}
                    opacity={a.artistId !== playing?.artistId && a.genre && dim ? 0.15 : 1}
                    className={`transition-[opacity,r] duration-150 ${a.genre && !isDim(a) ? 'pointer-events-auto cursor-pointer' : ''}`}
                    onPointerEnter={a.genre ? () => setHover(a.i) : undefined}
                    onPointerLeave={a.genre ? () => setHover((h) => (h === a.i ? null : h)) : undefined}
                    onClick={a.genre ? () => clickArtist(a) : undefined}
                  />
                )
              })}
              {playingArtist && <circle key={`playing-${playingArtist.artistId}`} data-playing-artist={playingArtist.artistId} aria-hidden="true"
                cx={playingArtist.cx} cy={playingArtist.cy}
                r={playingArtist.d / 2 * (playingArtist.i === focus ? 1.35 : 1) + 6 / view.z}
                fill="none" stroke="#dc2626" strokeWidth="2.5" vectorEffect="non-scaling-stroke"
                style={{ transformOrigin: `${playingArtist.cx}px ${playingArtist.cy}px` }} className="discover-playing-ring pointer-events-none" />}
              {/* a bigger invisible target around small dots, so they're easy to hover */}
              {artists.filter((a) => a.genre && !a.photo && a.d < 12).map((a) => (
                <circle key={`hit${a.i}`} cx={a.cx} cy={a.cy} r={7 / view.z + 1} fill="transparent" className="pointer-events-auto cursor-pointer"
                  onPointerEnter={() => setHover(a.i)} onPointerLeave={() => setHover((h) => (h === a.i ? null : h))} onClick={() => clickArtist(a)} />
              ))}
            </svg>

            {artists.filter((a) => a.photo).map((a) => (
              <button key={a.i} type="button" aria-label={a.name} data-tour={a.artistId === tourArtist?.artistId ? 'artist-dot' : undefined}
                onPointerEnter={() => setHover(a.i)} onPointerLeave={() => setHover((h) => (h === a.i ? null : h))} onClick={() => clickArtist(a)}
                className={`pointer-events-auto absolute rounded-full transition-[transform,opacity] ${a.i === focus ? 'scale-125' : ''}`}
                style={{ left: a.x, top: a.y, width: a.d, height: a.d, opacity: lit(a.i) && !(a.genre && isDim(a)) ? 1 : 0.25 }}>
                <img src={a.photo} alt="" width={a.d} height={a.d} draggable={false} className="size-full max-w-none" />
              </button>
            ))}

            {!showArtists && !regions && labels.map(([x, y, size, weight, color, text]) => {
              const style = { left: x, top: y, fontSize: size, fontWeight: weight, color, opacity: focus != null ? 0.35 : 1 }
              const href = linkHrefs[text]
              return href ? (
                <Link key={text} to={href} draggable={false} className="pointer-events-auto absolute whitespace-nowrap leading-[1.4] underline-offset-4 transition-opacity hover:underline" style={style}>{text}</Link>
              ) : (
                <p key={text} data-map-family-label={text} className="absolute m-0 whitespace-nowrap rounded-control bg-surface/95 px-[6px] leading-[1.4] transition-opacity" style={style}>{text}</p>
              )
            })}

            <div className="pointer-events-auto">{children}</div>
          </div>
        )}

        {detailLabels.map(item => <div key={item.artistId} data-map-subgenre={item.artistId} aria-hidden="true"
          className={`pointer-events-none absolute z-10 flex items-center justify-center rounded-control bg-surface/95 px-[8px] text-center text-[11px] leading-[16px] font-medium ${item.recommended ? 'whitespace-nowrap' : 'whitespace-normal'}`}
          style={{ left: item.x, top: item.y, width: item.w, height: item.h, color: item.colour }}>{item.text}</div>)}
        {card && <ArtistCard artist={card} view={view} root={root} pinned={picked === card.i} neighbours={graph.edges.filter(edge => edge.a === card.i || edge.b === card.i).sort((a, b) => b.sharedListenerCount - a.sharedListenerCount).map(edge => ({ ...artists[edge.a === card.i ? edge.b : edge.a], sharedListenerCount: edge.sharedListenerCount }))}
          preview={cardPreview} isPlaying={playing?.artistId === cardPreview.artistId && playing.title === cardPreview.title}
          onTogglePreview={() => togglePreview(cardPreview)}
          signedIn={signedIn} following={following.has(card.name)}
          onFollow={() => { const on = !following.has(card.name); setFollowing((f) => { const n = new Set(f); if (on) n.add(card.name); else n.delete(card.name); return n }); toast(on ? `Following ${card.name}` : `Unfollowed ${card.name}`) }}
          onPick={(i) => setPicked(i)} onClose={() => setPicked(null)} go={go} />}
      </div>
      {controls?.({ zoomIn: () => zoomCentre(1.3), zoomOut: () => zoomCentre(1 / 1.3), reset })}
    </>
  )
}

/** Hover: a small label. Click: a card with the artist, who shares their fans, and what to do next. */
function ArtistCard({ artist: a, view, root, pinned, neighbours, signedIn, following, onFollow, onPick, onClose, go, preview, isPlaying, onTogglePreview }) {
  const genre = GENRE_BY_KEY[a.genre]
  const sx = a.cx * view.z + view.x
  const sy = a.cy * view.z + view.y
  const r = (a.d / 2) * view.z
  const w = pinned ? 280 : 220
  const right = sx + r + 14 + w < (root.current?.clientWidth ?? 1440)
  const style = { left: Math.max(12, right ? sx + r + 14 : sx - r - 14 - w), top: Math.max(12, Math.min(sy - 28, (root.current?.clientHeight ?? 828) - (pinned ? 360 : 145))), width: w }

  return (
    <div
      className={`absolute z-20 animate-pop rounded-panel border border-line bg-surface p-[14px] text-left shadow-pop ${pinned ? 'pointer-events-auto cursor-default' : 'pointer-events-none'}`}
      style={style}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-[10px]">
        {a.avatar || a.photo
          ? <img src={a.avatar || a.photo} alt="" width="36" height="36" className="size-[36px] rounded-full object-cover" />
          : <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: a.fill, color: a.foreground ?? '#fff' }}>{a.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[14px] font-semibold text-ink">{a.name}</p>
          <p className="m-0 flex items-center gap-[5px] text-[11px] text-muted"><span className="size-[7px] rounded-full" style={{ background: genre.dot }} />{a.subgenre}</p>
        </div>
        {pinned && <button type="button" onClick={onClose} aria-label="Close" className="-mr-[4px] -mt-[18px] flex size-[24px] items-center justify-center rounded-full text-[16px] text-subtle hover:bg-soft">×</button>}
      </div>
      <p className="m-0 mt-[10px] text-[11px] text-muted">
        {neighbours.length ? <>Shares an audience with <b className="font-semibold text-ink">{neighbours.length}</b> artist{neighbours.length === 1 ? '' : 's'}</> : 'No audience connections recorded'}
      </p>
      {!pinned && <p className="m-0 mt-[6px] text-[10px] text-subtle">Click to open</p>}

      {pinned && (
        <>
          <button type="button" onClick={onTogglePreview} aria-label={`${isPlaying ? 'Pause' : 'Play'} ${preview.title} by ${a.name}`} aria-pressed={isPlaying}
            className="mt-[12px] flex w-full items-center gap-[10px] rounded-control border border-line bg-soft p-[10px] text-left text-ink hover:bg-wash focus-visible:outline-2 focus-visible:outline-accent">
            <span aria-hidden="true" className={`flex size-[32px] shrink-0 items-center justify-center rounded-full text-[13px] ${isPlaying ? 'bg-brand text-on-accent' : 'bg-surface text-ink'}`}>{isPlaying ? 'Ⅱ' : '▶'}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold">{preview.title}</span><span className="block text-[10px] text-muted">{isPlaying ? 'Playing demo preview' : 'Play demo preview'}</span></span>
          </button>
          {neighbours.length > 0 && (
            <div className="mt-[8px] flex flex-wrap gap-[6px]">
              {neighbours.slice(0, 4).map((n) => (
                <button key={n.i} type="button" onClick={() => onPick(n.i)} className="flex items-center gap-[5px] rounded-full border border-line bg-soft px-[9px] py-[4px] text-[11px] font-medium text-ink hover:bg-soft">
                  <span className="size-[6px] rounded-full" style={{ background: GENRE_BY_KEY[n.genre].dot }} />{n.name} · {n.sharedListenerCount.toLocaleString()}
                </button>
              ))}
            </div>
          )}
          <p className="m-0 mt-[10px] text-[10px] text-muted">Pairwise shared listeners · prototype data</p>
          {!signedIn && <Link data-tour="artist-profile" to={`/artists/${a.artistId}`} className="mt-[10px] block text-[12px] font-semibold text-brand hover:underline">Open artist page →</Link>}
          <div className="mt-[12px] flex gap-[8px]">
            {!signedIn ? (
              <Link to={ROUTES.signup} className="flex h-[36px] flex-1 items-center justify-center rounded-control bg-accent text-[12px] font-semibold text-on-accent hover:bg-accent-hover">Sign up to follow</Link>
            ) : (
              <>
                <button type="button" onClick={onFollow} className={`h-[36px] flex-1 rounded-control text-[12px] font-semibold ${following ? 'border-[1.5px] border-ink text-ink' : 'bg-accent text-on-accent hover:bg-accent-hover'}`}>{following ? 'Following ✓' : 'Follow'}</button>
                <button type="button" data-tour="artist-profile" onClick={() => go(`/artists/${a.artistId}`)} className="h-[36px] flex-1 rounded-control border border-line text-[12px] font-semibold text-ink hover:bg-wash">Artist page</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
