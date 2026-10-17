import { useEffect, useRef } from 'react'
import Link from '@/components/AppLink'
import ThemeToggle from '@/components/ThemeToggle'
import { setViewportFit } from '@/lib/viewport'

/** The feat/style-guide page, exactly as on that branch, with a small switch to go back. */
export default function TeamStyleGuide() {
  const host = useRef(null)

  useEffect(() => {
    let unmount
    let cancelled = false
    setViewportFit(false) // the guide is responsive; don't zoom it like the 1440px Figma pages
    import('@/style-guide/mountTeamGuide').then(({ mountTeamGuide }) => {
      if (!cancelled) unmount = mountTeamGuide(host.current)
    })
    return () => {
      cancelled = true
      unmount?.()
      setViewportFit(true)
    }
  }, [])

  return (
    <>
      <div ref={host} />
      <div className="fixed bottom-[20px] left-[20px] z-[200] flex items-center gap-[8px] rounded-[10px] border border-black/10 bg-white/95 p-[6px] shadow-[0_6px_24px_rgba(var(--lrm-raw-rgb-000000),0.15)] backdrop-blur">
        <ThemeToggle />
        <Link to="/" className="rounded-[8px] px-[10px] py-[6px] text-[12px] font-medium text-ink hover:bg-black/5">All pages</Link>
      </div>
    </>
  )
}
