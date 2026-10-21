// 18 End of demo (thank you) — Figma 1431:3775. Click anywhere to start the demo again.
import Link from '@/components/AppLink'
import { ROUTES } from '@/data'

export default function Thanks() {
  return (
    <Link to={ROUTES.discover} aria-label="Restart the demo" className="flex min-h-[var(--screen-h)] flex-col items-center justify-center bg-surface text-center">
      <p className="m-0 text-[12px] leading-[1.4] font-semibold text-subtle">LITTLEREDMUSIC</p>
      <h1 className="font-display m-0 mt-[14px] text-[56px] leading-[1.4] font-bold text-ink">Thank you</h1>
      <p className="m-0 mt-[16px] text-[18px] leading-[1.4] text-muted">End of lo-fi demo</p>
      <p className="m-0 mt-[40px] text-[12px] text-faint">Click anywhere to start again</p>
    </Link>
  )
}
