import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './discover-tour.css'

const SEEN_KEY = 'lrm.discoverTour.v1'
export function shouldShowDiscoverTour() {
  if (typeof window === 'undefined') return false
  try { return !localStorage.getItem(SEEN_KEY) } catch { return true }
}
export function rememberDiscoverTour() {
  try { localStorage.setItem(SEEN_KEY, 'seen') } catch { /* The tour still closes without storage. */ }
}
const STEPS = [
  { target: '[data-tour="genre-choice"]', title: 'Start with a genre', body: 'Choose a scene you enjoy. Try Electronic / EDM to zoom into its artists.' },
  { target: '[data-tour="artist-dot"]', title: 'Meet a local artist', body: 'Every dot is an artist. Click the highlighted dot to open their card.' },
  { target: '[data-tour="artist-profile"]', title: 'Take a closer look', body: 'Open the artist’s profile for their music and upcoming gigs. You can reopen this walkthrough anytime from Help & tour.' },
]

export default function DiscoverTour({ cameraRef, onClose }) {
  const [step, setStep] = useState(0)
  const [layout, setLayout] = useState(null)
  const card = useRef(null)
  const initialFocus = useRef(document.activeElement)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    card.current?.focus()
    return () => { if (initialFocus.current?.isConnected) initialFocus.current.focus?.() }
  }, [])

  useEffect(() => {
    cameraRef.current?.prepareTourStep(step)
    let frame
    const measure = () => {
      const target = document.querySelector(STEPS[step].target)
      const rect = target?.getBoundingClientRect()
      const width = window.innerWidth, height = window.innerHeight
      const next = { width, height, zoom: 1 / (parseFloat(document.documentElement.style.zoom) || 1),
        x: rect ? Math.max(4, rect.left - 8) : width / 2 - 40,
        y: rect ? Math.max(4, rect.top - 8) : height / 2 - 40,
        w: rect ? rect.width + 16 : 80, h: rect ? rect.height + 16 : 80 }
      setLayout(old => old && Object.keys(next).every(key => Math.abs(old[key] - next[key]) < .5) ? old : next)
      frame = requestAnimationFrame(measure)
    }
    measure()
    const onClick = event => {
      if (!event.target.closest?.(STEPS[step].target)) return
      if (step === STEPS.length - 1) closeRef.current()
      else setStep(value => value + 1)
    }
    document.addEventListener('click', onClick)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('click', onClick) }
  }, [step, cameraRef])

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current() }
      if (event.key !== 'Tab') return
      const target = document.querySelector(STEPS[step].target)
      const choices = [target, ...card.current.querySelectorAll('button')].filter(el => el && !el.disabled)
      const index = choices.indexOf(document.activeElement)
      event.preventDefault()
      choices[(index + (event.shiftKey ? -1 : 1) + choices.length) % choices.length]?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [step])

  const boxWidth = Math.min(340, (layout?.width || window.innerWidth) - 32)
  const cardHeight = card.current?.offsetHeight || 250
  let left = layout ? layout.x + layout.w + 20 : 16
  let top = layout?.y || 16
  if (layout && left + boxWidth > layout.width - 16) {
    left = layout.x - boxWidth - 20
    if (left < 16) { left = (layout.width - boxWidth) / 2; top = layout.y + layout.h + 20 }
  }
  if (layout) top = Math.max(16, Math.min(top, layout.height - cardHeight - 16))

  return createPortal(<div className="discover-tour" style={{ width: layout?.width || window.innerWidth, height: layout?.height || window.innerHeight, zoom: layout?.zoom || 1 }}>
    {layout && <svg className="discover-tour__shade" width={layout.width} height={layout.height} aria-hidden="true">
      <path fillRule="evenodd" d={`M0 0H${layout.width}V${layout.height}H0Z M${layout.x} ${layout.y}h${layout.w}v${layout.h}h-${layout.w}Z`} />
      <rect x={layout.x} y={layout.y} width={layout.w} height={layout.h} rx="8" />
    </svg>}
    <section ref={card} className="discover-tour__card" role="dialog" aria-labelledby="discover-tour-title" aria-describedby="discover-tour-body" tabIndex={-1} style={{ width: boxWidth, left: Math.max(16, left), top }}>
      <div className="discover-tour__top"><span>DISCOVER · {step + 1} OF {STEPS.length}</span><button type="button" onClick={onClose}>Skip tour</button></div>
      <h2 id="discover-tour-title">{STEPS[step].title}</h2>
      <p id="discover-tour-body">{STEPS[step].body}</p>
      <div className="discover-tour__bottom"><span className="discover-tour__progress" aria-hidden="true">{STEPS.map((_, i) => <i key={i} className={i === step ? 'is-current' : ''} />)}</span><div>{step > 0 && <button type="button" className="discover-tour__back" onClick={() => setStep(value => value - 1)}>Back</button>}<button type="button" className="discover-tour__next" onClick={() => step === STEPS.length - 1 ? onClose() : setStep(value => value + 1)}>{step === STEPS.length - 1 ? 'Finish tour' : 'Next →'}</button></div></div>
    </section>
  </div>, document.body)
}
