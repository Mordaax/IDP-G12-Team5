// "/" — every page of the site on one canvas, laid out like the Figma file, with the
// flow between them drawn as arrows. Drag or scroll to move around, Ctrl/⌘ + scroll
// (or the buttons) to zoom, click a page to open it.
//
// Thumbnails live in public/assets/img/pages/ and are screenshots of the running site
// (see README → "Page thumbnails").
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link, { useGo } from '@/components/AppLink'
import { IMG, ROUTES } from '@/data'
import { signIn, signOut } from '@/lib/session'
import ThemeToggle from '@/components/ThemeToggle'

const W = 1440 // every page is drawn at the size of the Figma frames
const H = 900
const COL = W + 220
const ROW = H + 300

// Pages seen signed out; every other page is opened signed in as Kit Tan (the mock account).
const GUEST_PAGES = ['discover', 'electronic', 'signup', 'signup-filled']

// [key, title, address, column, row] — positions follow the Figma canvas
const PAGES = [
  ['discover', '1 Discover (web of dots)', ROUTES.discover, 0, 0],
  ['electronic', '2 Discover (electronic music subgenres)', ROUTES.discoverElectronic, 1, 0],
  ['signup', '3 Auth (Sign up)', ROUTES.signup, 2, 0],
  ['signup-filled', '4 Auth (Kit Tan Sign up)', ROUTES.signupFilled, 3, 0],
  ['onboarding', '5 Onboarding (before connect spotify)', ROUTES.onboarding, 0, 1],
  ['spotify', '6 Onboarding (connect spotify)', ROUTES.onboardingSpotify, 1, 1],
  ['manual', 'Onboarding (your taste profile — manual)', ROUTES.onboardingManual, 1, 2],
  ['for-you', '7 Discover (for you)', ROUTES.forYou, 2, 1],
  ['recommended', '8 Discover (artist widget expanded)', ROUTES.recommended, 3, 1],
  ['artist-widget', '9 Discover (artist widget expanded)', ROUTES.artistWidget, 4, 1],
  ['notifications', 'Notifications', ROUTES.notifications, 0, 2],
  ['profile', 'Profile (Dashboard)', ROUTES.profile, 0, 3],
  ['messages', 'Profile (Messages)', ROUTES.messages, 1, 3],
  ['artist', '10 Artist page (Artist profile portfolio)', ROUTES.artist, 3, 2],
  ['artist-events', '11 Artist page (Artist profile events)', ROUTES.artistEvents, 4, 2],
  ['events-map', '13 Events (Map) Filtered', `${ROUTES.eventsMap}?artist=fallingislands`, 3, 3],
  ['events-list', '12 Events (List) Filtered', `${ROUTES.eventsList}?artist=fallingislands`, 4, 3],
  ['event', '13 Events (Details)', ROUTES.event, 5, 3],
  ['event-forum', '14 Events (Details — Forum)', ROUTES.eventForum, 6, 3],
  ['events-all', 'Events (Map) — all events near you', ROUTES.eventsMap, 2, 3],
  ['forum', '15 Forum (BattleBox 2026)', ROUTES.thread, 3, 4],
  ['forum-typing', '16 Forum (Typing Kit Tan reply)', ROUTES.threadTyping, 4, 4],
  ['forum-replied', '17 Forum (Kit Tan reply)', ROUTES.threadReplied, 5, 4],
  ['thanks', '18 End of demo (thank you)', ROUTES.thanks, 6, 4],
].map(([key, title, to, c, r]) => ({ key, title, to, x: c * COL, y: r * ROW, guest: GUEST_PAGES.includes(key) }))

const BY_KEY = Object.fromEntries(PAGES.map((p) => [p.key, p]))

// How you get from one page to the next: [from, to, what you click]
const FLOW = [
  ['discover', 'electronic', 'Electronic'],
  ['discover', 'signup', 'Create an account'],
  ['electronic', 'signup', 'Synthwave'],
  ['signup', 'signup-filled', 'Fill in the form'],
  ['signup-filled', 'onboarding', 'Create account'],
  ['onboarding', 'spotify', 'Connect Spotify'],
  ['onboarding', 'manual', 'Choose manually'],
  ['spotify', 'for-you', 'Next'],
  ['manual', 'for-you', 'Save profile'],
  ['for-you', 'recommended', 'Your taste profile'],
  ['recommended', 'artist-widget', 'FallingIslands'],
  ['artist-widget', 'artist', 'Open artist page'],
  ['artist', 'artist-events', 'Upcoming Event'],
  ['artist-events', 'events-list', 'See all upcoming events'],
  ['events-list', 'events-map', 'Map'],
  ['events-map', 'events-all', 'Reset filters'],
  ['events-list', 'event', 'Event card'],
  ['event', 'event-forum', 'Discussions'],
  ['event-forum', 'forum', 'Forum threads'],
  ['forum', 'forum-typing', 'Join the conversation'],
  ['forum-typing', 'forum-replied', 'Comment'],
  ['forum-replied', 'thanks', 'Buy tickets'],
  ['for-you', 'notifications', 'Bell'],
  ['notifications', 'profile', 'Your profile'],
  ['profile', 'messages', 'Message'],
]

const BOUNDS = {
  w: Math.max(...PAGES.map((p) => p.x)) + W,
  h: Math.max(...PAGES.map((p) => p.y)) + H,
}
const MIN_Z = 0.03
const MAX_Z = 1.2

export default function Overview() {
  const root = useRef(null)
  const go = useGo()
  const [view, setView] = useState(null) // { z, x, y }: screen = world * z + (x, y)
  const [hover, setHover] = useState(null)
  const [showFlow, setShowFlow] = useState(true)
  const drag = useRef(null)

  const fit = useCallback(() => {
    const el = root.current
    if (!el) return
    const pad = 80
    const z = Math.min((el.clientWidth - pad * 2) / BOUNDS.w, (el.clientHeight - pad * 2 - 40) / BOUNDS.h)
    setView({ z, x: (el.clientWidth - BOUNDS.w * z) / 2, y: (el.clientHeight - BOUNDS.h * z) / 2 + 20 })
  }, [])

  useLayoutEffect(() => {
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [fit])

  const zoomAt = (factor, cx, cy) =>
    setView((v) => {
      const z = Math.min(MAX_Z, Math.max(MIN_Z, v.z * factor))
      return { z, x: cx - ((cx - v.x) / v.z) * z, y: cy - ((cy - v.y) / v.z) * z }
    })

  // scroll pans, Ctrl/⌘ + scroll (or a trackpad pinch) zooms — like Figma
  useEffect(() => {
    const el = root.current
    const onWheel = (e) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-Math.max(-30, Math.min(30, e.deltaY)) * 0.01), e.clientX - r.left, e.clientY - r.top)
      else setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (!d.moved && Math.hypot(dx, dy) < 5) return
    if (!d.moved) root.current.setPointerCapture(e.pointerId)
    d.moved = true
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }))
  }
  const onPointerUp = (e) => {
    if (drag.current?.moved) root.current.releasePointerCapture(e.pointerId)
    // a drag must not count as a click on the page underneath
    setTimeout(() => (drag.current = null), 0)
  }
  const openPage = (e, page) => {
    e.preventDefault()
    if (drag.current?.moved) return
    go(page.to)
    if (page.guest) signOut()
    else signIn()
  }

  const center = () => ({ x: root.current.clientWidth / 2, y: root.current.clientHeight / 2 })

  return (
    <div className="relative h-[var(--screen-h)] w-full overflow-hidden bg-[#efe9e3] select-none">
      {/* top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex h-[56px] items-center justify-between border-b border-black/5 bg-white/85 px-[20px] backdrop-blur">
        <div className="flex items-center gap-[12px]">
          <img src={IMG.brand} alt="" width="32" height="32" className="size-[32px] object-contain" />
          <div className="leading-tight">
            <p className="m-0 text-[14px] font-semibold text-ink">LittleRedMusic — all pages</p>
            <p className="m-0 text-[11px] text-muted">{PAGES.length} pages · drag or scroll to move · Ctrl/⌘ + scroll to zoom · click a page to open it (pages 1–4 signed out, the rest as Kit Tan)</p>
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <label className="mr-[8px] flex cursor-pointer items-center gap-[6px] text-[12px] text-ink">
            <input type="checkbox" checked={showFlow} onChange={(e) => setShowFlow(e.target.checked)} className="accent-[#0d99ff]" />
            Show flow
          </label>
          <div className="flex items-center rounded-[8px] border border-black/10 bg-white text-[13px]">
            <button type="button" aria-label="Zoom out" onClick={() => { const c = center(); zoomAt(1 / 1.3, c.x, c.y) }} className="h-[30px] w-[30px] hover:bg-black/5">−</button>
            <button type="button" onClick={fit} title="Fit all pages" className="h-[30px] min-w-[56px] border-x border-black/10 px-[8px] tabular-nums hover:bg-black/5">{view ? `${Math.round(view.z * 100)}%` : ''}</button>
            <button type="button" aria-label="Zoom in" onClick={() => { const c = center(); zoomAt(1.3, c.x, c.y) }} className="h-[30px] w-[30px] hover:bg-black/5">+</button>
          </div>
          <ThemeToggle className="ml-[8px]" />
          <Link to="/style-guide" className="ml-[8px] rounded-[8px] border border-black/10 bg-white px-[14px] py-[7px] text-[13px] font-semibold text-ink hover:bg-black/5">Style guide</Link>
          <Link to={ROUTES.discover} onClick={signOut} className="ml-[8px] rounded-[8px] bg-brand px-[14px] py-[7px] text-[13px] font-semibold text-white hover:brightness-95">Open the site →</Link>
        </div>
      </header>

      {/* canvas */}
      <div
        ref={root}
        className={`absolute inset-0 ${drag.current?.moved ? 'cursor-grabbing' : 'cursor-default'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        {view && (
          <>
            {PAGES.map((p) => {
              const left = p.x * view.z + view.x
              const top = p.y * view.z + view.y
              const w = W * view.z
              const h = H * view.z
              const on = hover === p.key
              return (
                <div key={p.key} className="absolute" style={{ left, top, width: w, height: h }}>
                  <p className={`absolute bottom-full left-0 m-0 mb-[6px] flex max-w-full items-center gap-[5px] truncate text-[12px] ${on ? 'text-[#0d99ff]' : 'text-[#6b6560]'}`}>
                    <FrameIcon />{p.title}
                  </p>
                  <a
                    href={p.to}
                    onClick={(e) => openPage(e, p)}
                    onMouseEnter={() => setHover(p.key)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(p.key)}
                    onBlur={() => setHover(null)}
                    draggable={false}
                    aria-label={`Open ${p.title}`}
                    className={`block size-full overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)] outline-none ${on ? 'ring-2 ring-[#0d99ff]' : ''}`}
                  >
                    <img src={`/assets/img/pages/${p.key}.jpg`} alt="" draggable={false} loading="lazy" className="pointer-events-none size-full object-cover object-top" />
                  </a>
                </div>
              )
            })}
            {showFlow && <Flow view={view} hover={hover} />}
          </>
        )}
      </div>
    </div>
  )
}

/** Prototype-style arrows between pages, drawn in screen space so they stay crisp at any zoom. */
function Flow({ view, hover }) {
  const s = (wx, wy) => [wx * view.z + view.x, wy * view.z + view.y]
  const showLabels = view.z > 0.17 // labels only once zoomed in, so the overview stays readable
  return (
    <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#0d99ff" />
        </marker>
        <marker id="flow-arrow-dim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#0d99ff" opacity="0.35" />
        </marker>
      </defs>
      {FLOW.map(([from, to, label]) => {
        const a = BY_KEY[from]
        const b = BY_KEY[to]
        const dx = b.x - a.x
        const dy = b.y - a.y
        // leave from the side facing the other page
        let p1, p2, c1, c2
        if (Math.abs(dy) > Math.abs(dx) * 0.6 && dy !== 0) {
          const down = dy > 0
          p1 = s(a.x + W / 2, down ? a.y + H : a.y)
          p2 = s(b.x + W / 2, down ? b.y - 34 : b.y + H)
          const k = Math.abs(p2[1] - p1[1]) * 0.5
          c1 = [p1[0], p1[1] + (down ? k : -k)]
          c2 = [p2[0], p2[1] - (down ? k : -k)]
        } else {
          const right = dx > 0
          p1 = s(right ? a.x + W : a.x, a.y + H / 2)
          p2 = s(right ? b.x : b.x + W, b.y + H / 2)
          const k = Math.abs(p2[0] - p1[0]) * 0.5
          c1 = [p1[0] + (right ? k : -k), p1[1]]
          c2 = [p2[0] - (right ? k : -k), p2[1]]
        }
        const active = !hover || hover === from || hover === to
        const mid = [(p1[0] + 3 * c1[0] + 3 * c2[0] + p2[0]) / 8, (p1[1] + 3 * c1[1] + 3 * c2[1] + p2[1]) / 8]
        return (
          <g key={`${from}-${to}`} opacity={active ? 1 : 0.35}>
            <circle cx={p1[0]} cy={p1[1]} r="3.5" fill="#0d99ff" />
            <path d={`M${p1} C${c1} ${c2} ${p2}`} fill="none" stroke="#0d99ff" strokeWidth={active && hover ? 2.5 : 1.75} markerEnd={`url(#${active ? 'flow-arrow' : 'flow-arrow-dim'})`} />
            {showLabels && (
              <foreignObject x={mid[0] - 80} y={mid[1] - 11} width="160" height="22">
                <div className="flex h-full items-center justify-center">
                  <span className="truncate rounded-full bg-[#0d99ff] px-[8px] py-[2px] text-[10px] font-medium text-white shadow">{label}</span>
                </div>
              </foreignObject>
            )}
          </g>
        )
      })}
    </svg>
  )
}

const FrameIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <path d="M3 0.5v10M8 0.5v10M0.5 3h10M0.5 8h10" />
  </svg>
)
