import { useCallback, useEffect, useId, useRef, useState } from 'react'

// Native scrolling with a persistent rail, even when the OS hides scrollbars.
export default function GenreOptions({ children, label = 'Genre options' }) {
  const id = useId()
  const viewport = useRef(null)
  const content = useRef(null)
  const dragOffset = useRef(null)
  const [scroll, setScroll] = useState({ top: 0, max: 0, thumb: 100 })
  const measure = useCallback(() => {
    const element = viewport.current
    if (!element) return
    const next = { top: element.scrollTop, max: Math.max(0, element.scrollHeight - element.clientHeight), thumb: Math.min(100, Math.max(15, element.clientHeight / element.scrollHeight * 100)) }
    setScroll((old) => old.top === next.top && old.max === next.max && old.thumb === next.thumb ? old : next)
  }, [])
  useEffect(() => {
    const observer = new ResizeObserver(measure)
    observer.observe(viewport.current)
    observer.observe(content.current)
    measure()
    return () => observer.disconnect()
  }, [measure])

  const moveThumb = (event) => {
    const element = viewport.current
    const track = event.currentTarget.getBoundingClientRect()
    const travel = track.height * (1 - scroll.thumb / 100)
    if (travel > 0) element.scrollTop = Math.max(0, Math.min(1, (event.clientY - track.top - dragOffset.current) / travel)) * scroll.max
  }
  const onPointerDown = (event) => {
    if (event.button !== 0 || !scroll.max) return
    event.preventDefault()
    event.currentTarget.focus()
    const track = event.currentTarget.getBoundingClientRect()
    const thumb = event.currentTarget.firstElementChild.getBoundingClientRect()
    dragOffset.current = event.target === event.currentTarget.firstElementChild ? event.clientY - thumb.top : track.height * scroll.thumb / 200
    event.currentTarget.setPointerCapture(event.pointerId)
    moveThumb(event)
  }
  const onKeyDown = (event) => {
    const element = viewport.current
    const positions = { ArrowUp: element.scrollTop - 30, ArrowDown: element.scrollTop + 30, PageUp: element.scrollTop - element.clientHeight, PageDown: element.scrollTop + element.clientHeight, Home: 0, End: scroll.max }
    if (!(event.key in positions)) return
    event.preventDefault()
    element.scrollTop = positions[event.key]
  }

  return <div className="events-genres">
    <div ref={viewport} id={id} className="events-filters__genres" role="region" aria-label={label} tabIndex={0} onScroll={measure}>
      <div ref={content}>{children}</div>
    </div>
    <div className="events-genres__scrollbar" role="scrollbar" aria-label={`Scroll ${label.toLowerCase()}`} aria-controls={id} aria-orientation="vertical" aria-valuemin={0} aria-valuemax={Math.round(scroll.max)} aria-valuenow={Math.round(scroll.top)} aria-disabled={!scroll.max} tabIndex={0} onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerMove={(event) => { if (dragOffset.current !== null) moveThumb(event) }} onPointerUp={() => { dragOffset.current = null }} onPointerCancel={() => { dragOffset.current = null }} onLostPointerCapture={() => { dragOffset.current = null }}>
      <span className="events-genres__thumb" style={{ height: `${scroll.thumb}%`, top: `${scroll.max ? scroll.top / scroll.max * (100 - scroll.thumb) : 0}%` }} />
    </div>
  </div>
}
