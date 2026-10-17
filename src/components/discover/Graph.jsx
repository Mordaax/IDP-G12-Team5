import Link from '@/components/AppLink'

// Things drawn on top of the Discover web of dots (signed-in screens 📸 7–9).

/** Figma: taste-profile chips under the graph (📸 7–9). */
export function TasteChips() {
  const CHIPS = [
    { x: 372, w: 200, dot: '#0fb3a1', text: '78% Electronic Dance Music' },
    { x: 582.4, w: 104, dot: '#8b5cf6', text: '67% Alt-pop' },
    { x: 697, w: 207, dot: '#ec6a9c', text: '35% Contemporary Mandopop' },
  ]
  return CHIPS.map((c) => (
    <div key={c.text} className="absolute top-[700px] h-[30px] rounded-[15px] bg-white ring-1 ring-inset ring-line" style={{ left: c.x, width: c.w }}>
      <span className="absolute left-[12px] top-[11px] size-[8px] rounded-full" style={{ background: c.dot }} />
      <span className="absolute left-[26px] top-[7px] whitespace-nowrap text-[12px] leading-normal text-ink">{c.text}</span>
    </div>
  ))
}

/** Figma: "taste-label" pill. */
export function TasteLabel({ x, y, to, large = false }) {
  const Tag = to ? Link : 'div'
  return large ? (
    <Tag to={to} className="absolute block h-[37px] w-[206px] rounded-[18.5px] border border-brand bg-white shadow-[0px_2px_8px_0px_rgba(var(--lrm-raw-rgb-000000),0.1)]" style={{ left: x, top: y }}>
      <span className="absolute left-[11px] top-[13px] size-[8px] rounded-full bg-brand" />
      <span className="absolute left-[27px] top-[5px] whitespace-nowrap text-[20px] leading-[24px] font-semibold text-ink">Your taste profile</span>
    </Tag>
  ) : (
    <Tag to={to} className="absolute block h-[30px] w-[168px] rounded-[15px] border border-brand bg-white shadow-[0px_2px_8px_0px_rgba(var(--lrm-raw-rgb-000000),0.1)] transition-transform hover:scale-105" style={{ left: x, top: y }}>
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
