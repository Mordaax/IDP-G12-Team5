import Link from '@/components/AppLink'

// Map controls. Help & tour sits in the top-right corner; Recentre and the zoom buttons share the
// bottom-right corner (Recentre on the left of the zoom buttons), so none of them can sit under a side panel.
// `recentre` is either a route (Link) or a click handler.
// Both signed-in and signed-out controls use warm semantic surfaces.
export default function MapButtons({ dark = false, onHelp, recentreTo, onRecentre, onZoomIn, onZoomOut }) {
  const Recentre = recentreTo ? Link : 'button'
  const pill = dark
    ? 'border border-line bg-surface text-ink hover:bg-soft'
    : 'bg-surface text-ink-2 ring-1 ring-inset ring-line hover:bg-wash'
  return (
    <>
      {onHelp && (
        <button type="button" onClick={onHelp} className={`absolute right-[40px] top-[24px] z-30 flex items-center gap-[7px] whitespace-nowrap rounded-control px-[14px] py-[10px] ${pill}`}>
          <span className="text-[13px] leading-normal font-bold">?</span>
          <span className="text-[12px] leading-[1.4] font-semibold">Help &amp; tour</span>
        </button>
      )}
      <div className="absolute bottom-[24px] right-[40px] z-10 flex items-end gap-[24px]">
        <Recentre to={recentreTo} type={recentreTo ? undefined : 'button'} onClick={onRecentre} className={`flex items-center gap-[9px] rounded-control border-[1.5px] border-brand px-[18px] py-[12px] shadow-pop ${pill}`}>
          <span className="size-[12px] shrink-0 rounded-full bg-brand" />
          <span className="whitespace-nowrap text-[13px] leading-[1.4] font-bold">Recentre</span>
        </Recentre>
        <div className={`flex flex-col overflow-hidden rounded-control shadow-pop ${dark ? 'border border-line bg-surface text-ink' : 'bg-surface text-ink-2 ring-1 ring-inset ring-line'}`}>
          <button type="button" aria-label="Zoom in" onClick={onZoomIn} className="flex w-[42px] justify-center py-[10px] text-[17px] leading-[1.4] font-bold hover:bg-soft">+</button>
          <button type="button" aria-label="Zoom out" onClick={onZoomOut} className="flex w-[42px] justify-center py-[10px] text-[17px] leading-[1.4] font-bold hover:bg-soft">–</button>
        </div>
      </div>
    </>
  )
}
