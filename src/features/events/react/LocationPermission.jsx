import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './location-permission.css'

export function LocationIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
}

export default function LocationPermission({ onRequest, onSkip }) {
  const panel = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); onSkip() }
      if (event.key !== 'Tab') return
      const buttons = [...panel.current.querySelectorAll('button')]
      const first = buttons[0], last = buttons.at(-1)
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', onKey)
      const target = previous?.isConnected && previous !== document.body ? previous : document.querySelector('[data-location-control]')
      target?.focus()
    }
  }, [onSkip])
  const content = <div className="location-permission__backdrop" onClick={event => { if (event.target === event.currentTarget) onSkip() }}>
    <section ref={panel} tabIndex={-1} className="location-permission" role="dialog" aria-modal="true" aria-labelledby="location-permission-title" aria-describedby="location-permission-description location-permission-help">
      <button type="button" className="location-permission__close" aria-label="Continue without location" onClick={onSkip}>×</button>
      <span className="location-permission__icon"><LocationIcon /></span>
      <h2 id="location-permission-title">Find gigs near you</h2>
      <p id="location-permission-description">Use your location to see where you are on the map and find events nearby.</p>
      <p id="location-permission-help" className="location-permission__help">You can still explore all events without sharing your location.</p>
      <div className="location-permission__actions">
        <button type="button" className="location-permission__primary" onClick={onRequest}>Use my location</button>
        <button type="button" className="location-permission__secondary" onClick={onSkip}>Continue without location</button>
      </div>
    </section>
  </div>
  return typeof document === 'undefined' ? content : createPortal(content, document.body)
}
