import Link from '@/components/AppLink'

// Bottom-right map controls. `recentre` is either a route (Link) or a click handler.
// Both signed-in and signed-out controls use warm semantic surfaces.
export default function MapButtons({ dark = false, onHelp, recentreTo, onRecentre, onZoomIn, onZoomOut }) {
  const Recentre = recentreTo ? Link : 'button'
  const pill = dark
    ? 'border border-line bg-surface text-ink hover:bg-soft'
    : 'bg-surface text-ink-2 ring-1 ring-inset ring-line hover:bg-wash'
  return (
    <div role="group" aria-label="Map controls" className="absolute bottom-[24px] right-[40px] z-20 flex items-center gap-[8px]">
      {onHelp && (
        <button type="button" onClick={onHelp} title="Help & tour" className={`flex h-[44px] items-center gap-[8px] whitespace-nowrap rounded-control px-[16px] shadow-pop ${pill}`}>
          <span aria-hidden="true" className="text-[16px] font-semibold">?</span>
          <span className="text-[12px] font-semibold">Guide</span>
        </button>
      )}
      <div role="group" aria-label="Map view" className="flex h-[44px] shrink-0 items-center overflow-hidden divide-x divide-line rounded-control border border-line bg-surface text-ink shadow-pop [&>:focus-visible]:outline-2 [&>:focus-visible]:-outline-offset-2 [&>:focus-visible]:outline-accent">
        <button type="button" aria-label="Zoom in" title="Zoom in" onClick={onZoomIn} className="flex h-full w-[44px] items-center justify-center rounded-l-control text-[20px] font-medium hover:bg-soft">+</button>
        <Recentre to={recentreTo} type={recentreTo ? undefined : 'button'} onClick={onRecentre} aria-label="Recentre" title="Recentre" className="flex h-full w-[44px] items-center justify-center hover:bg-soft">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
          </svg>
        </Recentre>
        <button type="button" aria-label="Zoom out" title="Zoom out" onClick={onZoomOut} className="flex h-full w-[44px] items-center justify-center rounded-r-control text-[20px] font-medium hover:bg-soft">−</button>
      </div>
    </div>
  )
}
