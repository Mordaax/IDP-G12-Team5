import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from '@/components/AppLink'
import { GENRE_BY_KEY, ROUTES, SUBGENRE_BY_ID } from '@/data'

// A local listener profile for the forum-to-message demonstration, not an artist record.
export function JoelProfileCard({ onClose }) {
  const tastes = [
    { name: GENRE_BY_KEY.electronic.name, dot: GENRE_BY_KEY.electronic.dot },
    { name: SUBGENRE_BY_ID['electronic--synthwave'].label, dot: SUBGENRE_BY_ID['electronic--synthwave'].colour.css },
  ]
  return <>
    <button type="button" onClick={() => onClose(true)} aria-label="Close Joel Tan profile" className="absolute right-[10px] top-[10px] flex size-[28px] items-center justify-center rounded-control text-[20px] text-muted hover:bg-soft focus-visible:outline-2 focus-visible:outline-accent">×</button>
    <div className="flex items-center gap-[12px] pr-[20px]">
      <span aria-hidden="true" className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-divider text-[20px] font-semibold text-ink">JT</span>
      <div className="min-w-0">
        <h2 className="font-display m-0 text-[20px] font-semibold leading-normal text-ink">Joel Tan</h2>
        <p className="m-0 text-[12px] leading-normal text-muted">@joeltan</p>
      </div>
    </div>
    <p className="m-0 mt-[14px] text-[13px] leading-[1.5] text-muted">Always up for a synthwave gig and sharing local music finds.</p>
    <div aria-label="Joel's music tastes" className="mt-[12px] flex flex-wrap gap-[6px]">
      {tastes.map(taste => <span key={taste.name} className="inline-flex items-center gap-[5px] rounded-full border border-line bg-surface px-[9px] py-[4px] text-[11px] text-ink">
        <span aria-hidden="true" className="size-[6px] shrink-0 rounded-full" style={{ background: taste.dot }} />{taste.name}
      </span>)}
    </div>
    <div className="mt-[14px] flex justify-end border-t border-divider pt-[12px]">
      <Link to={`${ROUTES.messages}?c=joel-tan`} aria-label="Message Joel Tan" title="Message Joel Tan" className="flex size-[40px] items-center justify-center rounded-control bg-accent text-on-accent hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 3V11.5A8.5 8.5 0 0 1 9.5 3h3a8.5 8.5 0 0 1 8.5 8.5Z" /><path d="M7 9h8M7 13h6" /></svg>
      </Link>
    </div>
  </>
}

function ProfilePopover({ anchor, id, onClose }) {
  const card = useRef(null)
  const [position, setPosition] = useState({ visibility: 'hidden', left: 0, top: 0 })
  useLayoutEffect(() => {
    const place = () => {
      if (!anchor || !card.current) return
      const a = anchor.getBoundingClientRect()
      const box = card.current.getBoundingClientRect()
      const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1
      const left = Math.max(8, Math.min(a.left, window.innerWidth - box.width - 8))
      const below = a.bottom + 8
      const top = Math.max(8, Math.min(below + box.height <= window.innerHeight - 8 ? below : a.top - box.height - 8, window.innerHeight - box.height - 8))
      setPosition({ left: left / zoom, top: top / zoom })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [anchor])
  useEffect(() => {
    card.current?.focus({ preventScroll: true })
    const onKey = event => { if (event.key === 'Escape') { event.preventDefault(); onClose(true) } }
    const onOutside = event => { if (!card.current?.contains(event.target) && !anchor?.contains(event.target)) onClose(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onOutside)
    }
  }, [anchor, onClose])
  return createPortal(<div ref={card} id={id} role="dialog" aria-label="Joel Tan profile" tabIndex={-1} style={position}
    className="fixed z-[2500] w-[320px] max-w-[calc(100vw-32px)] whitespace-normal rounded-panel border border-line bg-surface p-[18px] text-left font-normal shadow-pop outline-none">
    <JoelProfileCard onClose={onClose} />
  </div>, document.body)
}

export default function JoelProfileButton() {
  const [open, setOpen] = useState(false)
  const trigger = useRef(null)
  const id = useId()
  const close = useCallback(restoreFocus => {
    setOpen(false)
    if (restoreFocus) trigger.current?.focus({ preventScroll: true })
  }, [])
  return <>
    <button ref={trigger} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined}
      onClick={() => setOpen(value => !value)} className="rounded-control font-semibold text-ink hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-accent">Joel Tan</button>
    {open && <ProfilePopover anchor={trigger.current} id={id} onClose={close} />}
  </>
}
