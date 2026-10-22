import Link from '@/components/AppLink'

// Things drawn on top of the Discover web of dots (signed-in screens 📸 7–9).

/** The taste-profile percentages in one box along the bottom of the screen (outside the web of dots). */
export function TasteBar() {
  const CHIPS = [
    { dot: '#0fb3a1', text: '78% Electronic Dance Music' },
    { dot: '#8b5cf6', text: '67% Alt-pop' },
    { dot: '#ec6a9c', text: '35% Contemporary Mandopop' },
  ]
  return (
    <div className="absolute bottom-[24px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[18px] whitespace-nowrap rounded-control bg-surface px-[16px] py-[10px] ring-1 ring-inset ring-line">
      {CHIPS.map((c) => (
        <span key={c.text} className="flex items-center gap-[7px] text-[12px] leading-normal text-ink">
          <span className="size-[8px] shrink-0 rounded-full" style={{ background: c.dot }} />{c.text}
        </span>
      ))}
    </div>
  )
}

/** Figma: "taste-label" pill. */
export function TasteLabel({ x, y, to, large = false }) {
  const Tag = to ? Link : 'div'
  return large ? (
    <Tag to={to} className="absolute block h-[37px] w-[206px] rounded-[18.5px] border border-brand bg-surface shadow-pop" style={{ left: x, top: y }}>
      <span className="absolute left-[11px] top-[13px] size-[8px] rounded-full bg-brand" />
      <span className="absolute left-[27px] top-[5px] whitespace-nowrap text-[20px] leading-[24px] font-semibold text-ink">Your taste profile</span>
    </Tag>
  ) : (
    <Tag to={to} className="absolute block h-[30px] w-[168px] rounded-[15px] border border-brand bg-surface shadow-pop transition-transform hover:scale-105" style={{ left: x, top: y }}>
      <span className="absolute left-[11px] top-[10px] size-[8px] rounded-full bg-brand" />
      <span className="absolute left-[27px] top-[6px] whitespace-nowrap text-[12px] leading-normal font-semibold text-ink">Your taste profile</span>
    </Tag>
  )
}

/** Subgenre labels of the zoomed Synthwave view (📸 8–9). Figma positions, minus the 72px nav. */
export function SubgenreLabels() {
  return [
    [576, 349, 'Synthwave'],
    [615, 132, 'Trance'],
    [372, 360, 'Hardcore'],
  ].map(([x, y, t]) => (
    <p key={t} className="absolute m-0 whitespace-nowrap text-[16px] leading-[1.4] font-medium text-ink-soft" style={{ left: x, top: y }}>{t}</p>
  ))
}
