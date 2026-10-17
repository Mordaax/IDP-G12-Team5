import Link from '@/components/AppLink'

// Bottom-right map controls. `recentre` is either a route (Link) or a click handler.
//   light → signed-out screens (📸 1–2): Help & tour, Recentre, zoom
//   dark  → signed-in screens (📸 7–9): Recentre, zoom
export default function MapButtons({ dark = false, onHelp, recentreTo, onRecentre, onZoomIn, onZoomOut }) {
  const Recentre = recentreTo ? Link : 'button'
  const pill = dark
    ? 'border border-[var(--lrm-raw-3c3c43)] bg-[var(--lrm-raw-2c2c31)] text-[var(--lrm-raw-e7e5ea)] hover:bg-[var(--lrm-raw-3a3a40)]'
    : 'bg-white text-ink-2 ring-1 ring-inset ring-line hover:bg-wash'
  return (
    <div className="absolute bottom-[24px] right-[40px] z-10 flex items-end">
      {!dark && (
        <button type="button" onClick={onHelp} className={`mr-[12px] flex items-center gap-[7px] whitespace-nowrap rounded-[999px] px-[14px] py-[10px] ${pill}`}>
          <span className="text-[13px] leading-normal font-bold">?</span>
          <span className="text-[12px] leading-[1.4] font-semibold">Help &amp; tour</span>
        </button>
      )}
      <Recentre to={recentreTo} type={recentreTo ? undefined : 'button'} onClick={onRecentre} className={`flex items-center gap-[8px] rounded-[999px] px-[14px] py-[10px] ${pill}`}>
        <span className="size-[11px] shrink-0 rounded-full bg-brand" />
        <span className="whitespace-nowrap text-[12px] leading-[1.4] font-semibold">Recentre</span>
      </Recentre>
      <div className={`ml-[61px] flex flex-col overflow-hidden rounded-[14px] shadow-[0px_2px_10px_0px_rgba(var(--lrm-raw-rgb-000000),0.3)] ${dark ? 'border border-[var(--lrm-raw-3c3c43)] bg-[var(--lrm-raw-2c2c31)] text-[var(--lrm-raw-e7e5ea)]' : 'bg-white text-ink-2 ring-1 ring-inset ring-line'}`}>
        <button type="button" aria-label="Zoom in" onClick={onZoomIn} className={`flex w-[42px] justify-center py-[10px] text-[17px] leading-[1.4] font-bold ${dark ? 'hover:bg-[var(--lrm-raw-3a3a40)]' : 'hover:bg-soft'}`}>+</button>
        <button type="button" aria-label="Zoom out" onClick={onZoomOut} className={`flex w-[42px] justify-center py-[10px] text-[17px] leading-[1.4] font-bold ${dark ? 'hover:bg-[var(--lrm-raw-3a3a40)]' : 'hover:bg-soft'}`}>–</button>
      </div>
    </div>
  )
}
