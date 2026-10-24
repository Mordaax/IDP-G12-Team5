import { useEffect, useRef, useState } from 'react'
import Link, { useGo } from '@/components/AppLink'
import { IMG, ROUTES, USER } from '@/data'
import { accountMenu, homeLink, navLinks } from '@/lib/nav'
import { useSession } from '@/lib/useSession'
import { useArtistProfile } from '@/lib/useArtistProfile'

// The site nav bar (Figma "nav-bar", 72px, full width), including Events routes.
//   signed out → "Sign up" / "Log in" pills
//   signed in  → bell (→ Notifications) + Kit Tan's account menu
export default function NavBar({ active = 'discover' }) {
  const { signedIn } = useSession()
  return (
    <header style={{ zoom: 'var(--nav-zoom, 1)' }} className="lrm-navbar sticky top-0 z-40 grid h-[72px] w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-divider bg-surface px-[24px]">
      <Link to={homeLink(signedIn)} className="block size-[40px] justify-self-start" aria-label="LittleRedMusic home">
        <img src={IMG.brand} alt="" width={40} height={40} className="size-full object-contain" />
      </Link>

      <nav aria-label="Main" className="flex items-center gap-[24px] whitespace-nowrap font-nav text-[14px] font-semibold">
        {navLinks(signedIn).map((l) => (
          <Link
            key={l.key}
            to={l.to}
            aria-current={l.key === active ? 'page' : undefined}
            className={l.key === active ? 'text-ink' : 'text-muted transition-colors hover:text-ink'}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="justify-self-end">
        {signedIn ? (
          <UserMenu />
        ) : (
          <div className="flex items-center gap-[10px]">
            <Link to={ROUTES.signup} className="flex h-[36px] w-[84px] items-center justify-center rounded-control bg-accent text-[13px] font-semibold text-on-accent hover:bg-accent-hover">Sign up</Link>
            <Link to={ROUTES.login} className="flex h-[36px] w-[84px] items-center justify-center rounded-control border border-line bg-surface text-[13px] font-semibold text-ink hover:bg-soft">Log in</Link>
          </div>
        )}
      </div>
    </header>
  )
}

function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const go = useGo()
  const { signOut } = useSession()
  const { unread } = useArtistProfile()

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const item = 'block w-full px-[14px] py-[9px] text-left text-[13px] text-ink hover:bg-soft'
  return (
    <div ref={ref} className="relative flex items-center gap-[12px]">
      <Link to={ROUTES.messages} className="relative flex size-[24px] items-center" aria-label="Messages (2 unread)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6a.5.5 0 0 1-.8-.4V16h0A2.5 2.5 0 0 1 4 13.5z" /></svg>
        <span className="absolute right-[1px] top-[1px] size-[7px] rounded-full bg-brand ring-2 ring-white" />
      </Link>
      <Link to={ROUTES.notifications} className="relative flex size-[24px] items-center" aria-label="Notifications">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10.27 21a2 2 0 0 0 3.46 0" /></svg>
      </Link>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={unread ? 'Account menu, new profile activity' : 'Account menu'} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-[12px]">
        <span className="relative flex size-[36px] items-center justify-center rounded-[18px] bg-divider font-nav text-[13px] font-bold text-ink">{USER.initials}{unread && <span data-profile-unread="avatar" aria-hidden="true" className="absolute right-0 top-0 size-[7px] rounded-full bg-brand ring-2 ring-surface" />}</span>
        <span className="whitespace-nowrap text-[13px] font-medium text-ink">{USER.name}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[48px] w-[210px] animate-pop overflow-hidden rounded-card border border-divider bg-surface py-[6px] shadow-pop">
          <p className="m-0 px-[14px] pb-[6px] pt-[4px] text-[11px] text-subtle">{USER.email}</p>
          {accountMenu.map((m) => <Link key={m.to} role="menuitem" to={m.to} className={item}>{m.label}{m.to === ROUTES.profile && unread && <span data-profile-unread="menu" aria-label="New profile activity" className="ml-[8px] inline-block size-[7px] rounded-full bg-brand" />}</Link>)}
          <div className="my-[6px] h-px bg-divider" />
          <button role="menuitem" type="button" className={item} onClick={() => { go(ROUTES.discover); signOut() }}>Log out</button>
        </div>
      )}
    </div>
  )
}
