// /style-guide — the site theme at a glance: every colour, font and shared component, read live
// from src/theme/theme.css (change a value there and this page, React and Vue pages all follow).
// Structure follows the team's draft guide on the feat/style-guide branch.
import { useEffect, useState } from 'react'
import Link from '@/components/AppLink'
import { GENRES, IMG, ROUTES, USER } from '@/data'

const SECTIONS = [
  ['overview', 'Overview'], ['colours', 'Colours'], ['typography', 'Typography'], ['shape', 'Shape & elevation'],
  ['buttons', 'Buttons'], ['forms', 'Forms'], ['chips', 'Chips, tags & genres'], ['cards', 'Cards & panels'], ['nav', 'Navigation'],
]

const COLOUR_GROUPS = [
  ['Text', [['ink', 'Headings, body, dark buttons'], ['ink-soft', 'Secondary body text'], ['muted', 'Captions, labels, inactive tabs'], ['subtle', 'Timestamps, counts'], ['faint', 'Disabled, empty icons']]],
  ['Surfaces & lines', [['canvas', 'Page background'], ['surface', 'Cards, panels'], ['soft', 'Inputs, chips, selected rows'], ['wash', 'Hover on white'], ['line', 'Card and control borders'], ['divider', 'Separators']]],
  ['Brand & action', [['brand', 'LittleRedMusic red'], ['brand-hover', 'Hover / pressed'], ['brand-tint', 'Quiet selection'], ['accent', 'Primary buttons (= brand)']]],
  ['Feedback', [['success', 'Success'], ['warning', 'Warning'], ['danger', 'Error'], ['info', 'Information']]],
]

const TYPE = [
  ['Page title', 'text-[28px] font-semibold', '28 · 600', 'Events'],
  ['Hero title', 'text-[48px] font-extrabold leading-tight', '48 · 800', 'FallingIslands'],
  ['Panel heading', 'text-[24px] leading-[32px] font-semibold', '24 · 600', 'Your 4-step guide to the web of dots.'],
  ['Section heading', 'text-[16px] font-bold', '16 · 700', 'About this event'],
  ['Body', 'text-[14px] leading-[22px] text-muted', '14 / 22 · 400', 'Every dot is an artist playing in Singapore; the lines are the audiences they share.'],
  ['Label', 'text-[13px] font-medium', '13 · 500', 'Contemporary Mandopop'],
  ['Caption', 'text-[12px] text-muted', '12 · 400', '178 artists · 412 shared-audience links'],
  ['Overline', 'text-[11px] font-bold tracking-[0.66px] text-muted', '11 · 700 · caps', 'HOW TO READ THIS MAP'],
]

function useToken(name) {
  const [v, setV] = useState('')
  useEffect(() => setV(getComputedStyle(document.documentElement).getPropertyValue(`--lrm-${name}`).trim()), [name])
  return v
}

function Swatch({ name, usage }) {
  const value = useToken(name)
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
      <div className="h-[64px] border-b border-line" style={{ background: `var(--lrm-${name})` }} />
      <div className="p-[10px]">
        <p className="m-0 text-[12px] font-semibold text-ink">{name}</p>
        <p className="m-0 font-mono text-[11px] text-muted">--lrm-{name}</p>
        <p className="m-0 font-mono text-[11px] text-subtle">{value}</p>
        <p className="m-0 mt-[4px] text-[11px] text-muted">{usage}</p>
      </div>
    </div>
  )
}

function Section({ id, title, children, note }) {
  return (
    <section id={`sg-${id}`} className="scroll-mt-[24px] border-t border-divider pt-[40px]">
      <h2 className="m-0 text-[22px] font-semibold text-ink">{title}</h2>
      {note && <p className="m-0 mt-[6px] max-w-[720px] text-[14px] text-muted">{note}</p>}
      <div className="mt-[20px]">{children}</div>
    </section>
  )
}

export default function StyleGuide() {
  const [active, setActive] = useState('overview')
  const [checked, setChecked] = useState(true)
  const [on, setOn] = useState(true)
  const [chip, setChip] = useState('all')
  const fontSans = useToken('font-sans')

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      const v = entries.find((e) => e.isIntersecting)
      if (v) setActive(v.target.id.replace('sg-', ''))
    }, { rootMargin: '-10% 0px -75% 0px' })
    SECTIONS.forEach(([id]) => { const el = document.getElementById(`sg-${id}`); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  return (
    <div className="min-h-[var(--screen-h)] bg-canvas text-ink">
      <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-line bg-surface px-[24px]">
        <div className="flex items-center gap-[12px]">
          <img src={IMG.brand} alt="" width="32" height="32" className="size-[32px] object-contain" />
          <p className="m-0 text-[15px] font-semibold">LittleRedMusic <span className="font-normal text-muted">· style guide</span></p>
        </div>
        <div className="flex items-center gap-[10px] text-[12px] text-muted">
          <span>Source: <code className="font-mono text-ink">src/theme/theme.css</code></span>
          <Link to="/" className="rounded-full border border-line px-[14px] py-[6px] text-ink hover:bg-wash">All pages</Link>
          <Link to={ROUTES.discover} className="rounded-full bg-accent px-[14px] py-[6px] font-semibold text-on-accent hover:bg-accent-hover">Open the site →</Link>
        </div>
      </header>

      <div className="flex">
        <nav aria-label="Style guide sections" className="sticky top-[64px] hidden h-[calc(var(--screen-h)-64px)] w-[220px] shrink-0 flex-col gap-[2px] overflow-y-auto border-r border-line p-[20px] md:flex">
          {SECTIONS.map(([id, label], i) => (
            <a key={id} href={`#sg-${id}`} aria-current={active === id ? 'location' : undefined}
              className={`flex items-center gap-[10px] rounded-[8px] px-[12px] py-[8px] text-[13px] ${active === id ? 'bg-brand-tint font-semibold text-brand' : 'text-muted hover:bg-soft hover:text-ink'}`}>
              <span className="w-[16px] text-[10px]">{String(i).padStart(2, '0')}</span>{label}
            </a>
          ))}
        </nav>

        <main className="min-w-0 flex-1 px-[clamp(20px,4vw,56px)] pb-[80px] pt-[32px]">
          <section id="sg-overview" className="scroll-mt-[24px] pb-[32px]">
            <p className="m-0 text-[11px] font-bold tracking-[0.12em] text-brand">DESIGN SYSTEM · FOLLOWS THE DISCOVER PAGE</p>
            <h1 className="m-0 mt-[8px] text-[40px] font-semibold leading-tight">Style guide</h1>
            <p className="m-0 mt-[12px] max-w-[680px] text-[15px] leading-[1.7] text-muted">
              One theme for the whole site. Fonts and colours live in <code className="font-mono text-ink">src/theme/theme.css</code>;
              the React pages use them as Tailwind classes (<code className="font-mono text-ink">text-ink</code>, <code className="font-mono text-ink">bg-accent</code>, <code className="font-mono text-ink">border-line</code> …)
              and the Vue Events pages through their <code className="font-mono text-ink">--lrm-*</code> variables. Every value on this page is read live from that file.
            </p>
            <div className="mt-[20px] grid max-w-[900px] grid-cols-1 gap-[16px] md:grid-cols-2">
              <div className="rounded-[12px] border border-line bg-surface p-[20px]">
                <p className="m-0 text-[13px] font-semibold">Change the look</p>
                <p className="m-0 mt-[6px] text-[12px] leading-[1.6] text-muted">Edit a value in <code className="font-mono">theme.css</code> — e.g. <code className="font-mono">--lrm-accent</code> — and every page updates, React and Vue alike.</p>
              </div>
              <div className="rounded-[12px] border border-line bg-surface p-[20px]">
                <p className="m-0 text-[13px] font-semibold">Team draft</p>
                <p className="m-0 mt-[6px] text-[12px] leading-[1.6] text-muted">The team's proposed guide (raspberry, Space Grotesk) is on the <code className="font-mono">feat/style-guide</code> branch; adopting it means changing <code className="font-mono">theme.css</code>.</p>
              </div>
            </div>
          </section>

          <Section id="colours" title="Colours" note="Ink and greys carry most of the interface; the LittleRedMusic red marks the main action and anything new. Genre colours are only for genres.">
            {COLOUR_GROUPS.map(([group, list]) => (
              <div key={group} className="mb-[24px]">
                <p className="m-0 mb-[10px] text-[11px] font-bold tracking-[0.66px] text-muted">{group.toUpperCase()}</p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-[12px]">
                  {list.map(([name, usage]) => <Swatch key={name} name={name} usage={usage} />)}
                </div>
              </div>
            ))}
            <p className="m-0 mb-[10px] text-[11px] font-bold tracking-[0.66px] text-muted">GENRES</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-[12px]">
              {['indie', 'pop', 'mandopop', 'electronic', 'hiphop', 'ethnic'].map((k, i) => <Swatch key={k} name={`genre-${k}`} usage={GENRES[i].name} />)}
            </div>
          </Section>

          <Section id="typography" title="Typography" note={`One family everywhere: Inter (nav links use SF Pro on Apple devices). Current stack: ${fontSans}`}>
            <div className="divide-y divide-divider rounded-[12px] border border-line bg-surface">
              {TYPE.map(([name, cls, spec, sample]) => (
                <div key={name} className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-[16px] px-[20px] py-[16px]">
                  <div><p className="m-0 text-[12px] font-semibold">{name}</p><p className="m-0 font-mono text-[11px] text-subtle">{spec}</p></div>
                  <p className={`m-0 ${cls}`}>{sample}</p>
                </div>
              ))}
              <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-[16px] px-[20px] py-[16px]">
                <div><p className="m-0 text-[12px] font-semibold">Nav</p><p className="m-0 font-mono text-[11px] text-subtle">font-nav · 14 · 600</p></div>
                <p className="m-0 flex gap-[24px] font-nav text-[14px] font-semibold"><span className="text-ink">Discover</span><span className="text-muted">Events</span><span className="text-muted">Artists</span><span className="text-muted">Forum</span></p>
              </div>
            </div>
          </Section>

          <Section id="shape" title="Shape & elevation" note="Rounded controls, softly rounded cards, pills for buttons and chips. Shadows only for things that float above the page.">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[16px]">
              {[['Control', 'rounded-control', '--lrm-radius-control', ''], ['Card', 'rounded-card', '--lrm-radius-card', 'shadow-[var(--lrm-shadow-card)]'], ['Floating panel', 'rounded-panel', '--lrm-radius-panel', 'shadow-panel'], ['Menu / popover', 'rounded-card', '--lrm-shadow-pop', 'shadow-pop']].map(([n, r, t, sh]) => (
                <div key={n} className="rounded-[12px] border border-line bg-surface p-[20px]">
                  <div className={`h-[64px] border border-line bg-surface ${r} ${sh}`} />
                  <p className="m-0 mt-[12px] text-[13px] font-semibold">{n}</p>
                  <p className="m-0 font-mono text-[11px] text-subtle">{t}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="buttons" title="Buttons" note="One red primary action per area; dark pills for everyday actions; outlined for the alternative.">
            <div className="flex flex-wrap items-center gap-[12px] rounded-[12px] border border-line bg-surface p-[24px]">
              <button type="button" className="h-[48px] rounded-[24px] bg-accent px-[28px] text-[15px] font-semibold text-on-accent hover:bg-accent-hover">Create an account</button>
              <button type="button" className="h-[46px] rounded-full bg-ink px-[24px] text-[14px] font-semibold text-white hover:bg-black">Open artist page</button>
              <button type="button" className="h-[46px] rounded-full border-[1.5px] border-ink bg-surface px-[20px] text-[14px] font-semibold text-ink hover:bg-wash">Not interested</button>
              <button type="button" className="h-[40px] rounded-[20px] border border-line px-[22px] text-[13px] text-ink hover:bg-wash">Edit profile</button>
              <button type="button" className="h-[36px] w-[84px] rounded-[18px] bg-ink text-[13px] font-semibold text-white">Sign up</button>
              <button type="button" className="rounded-full bg-ink px-[14px] py-[8px] text-[12px] text-white">Hide</button>
              <button type="button" disabled className="h-[48px] rounded-[24px] bg-divider px-[28px] text-[15px] font-semibold text-subtle">Create account</button>
            </div>
          </Section>

          <Section id="forms" title="Forms" note="Labels above fields, soft grey search pills, red checkboxes and switches when on.">
            <div className="grid max-w-[900px] grid-cols-1 gap-[16px] md:grid-cols-2">
              <div className="flex flex-col gap-[12px] rounded-[12px] border border-line bg-surface p-[24px]">
                <label className="text-[14px] font-medium">Email:
                  <input defaultValue={USER.email} className="mt-[4px] h-[48px] w-full rounded-[8px] border border-line bg-surface px-[15px] text-[14px] outline-none focus:border-ink" />
                </label>
                <label className="flex h-[44px] items-center gap-[10px] rounded-full bg-surface px-[16px] shadow-[0px_2px_10px_rgba(0,0,0,0.3)] ring-1 ring-inset ring-line">
                  <img src="/assets/icons/search-15.svg" alt="" width="15" height="15" />
                  <input placeholder="Search artists…" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted" />
                </label>
                <div className="flex h-[38px] items-center rounded-[10px] bg-soft px-[12px] text-[13px] ring-1 ring-inset ring-line">Genres · 6 of 6</div>
              </div>
              <div className="flex flex-col gap-[14px] rounded-[12px] border border-line bg-surface p-[24px]">
                <label className="flex cursor-pointer items-center gap-[10px] text-[13px]">
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => setChecked(!checked)} />
                  <span className={`flex size-[16px] items-center justify-center rounded-[4px] border text-[11px] font-semibold text-white ${checked ? 'border-brand bg-brand' : 'border-faint bg-surface'}`}>{checked && '✓'}</span>
                  Include nearby events
                </label>
                <button type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)} className="flex items-center gap-[10px] text-left text-[13px]">
                  <span className={`relative h-[22px] w-[38px] rounded-[11px] transition-colors ${on ? 'bg-brand' : 'bg-faint'}`}><span className={`absolute top-[2px] size-[18px] rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-[2px]'}`} /></span>
                  Your Preferences {on ? 'on' : 'off'}
                </button>
                <p className="m-0 text-[12px] text-brand">Passwords don’t match.</p>
                <p className="m-0 text-[12px] text-muted">Fill in every field and accept the terms to continue.</p>
              </div>
            </div>
          </Section>

          <Section id="chips" title="Chips, tags & genres" note="Selected chips go dark; genre dots carry the genre colour and nothing else does.">
            <div className="flex flex-col gap-[16px] rounded-[12px] border border-line bg-surface p-[24px]">
              <div className="flex flex-wrap gap-[8px]">
                <button type="button" onClick={() => setChip('all')} className={`h-[33px] rounded-full px-[14px] text-[12px] font-semibold ${chip === 'all' ? 'bg-ink text-white' : 'bg-surface text-ink ring-1 ring-inset ring-line'}`}>All genres</button>
                {GENRES.map((g) => (
                  <button key={g.key} type="button" onClick={() => setChip(g.key)} className={`flex h-[33px] items-center gap-[7px] rounded-full px-[14px] text-[12px] font-medium ${chip === g.key ? 'bg-ink text-white' : 'bg-surface text-ink ring-1 ring-inset ring-line'}`}>
                    <span className="size-[9px] rounded-full" style={{ background: g.dot }} />{g.name}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {['#synthwave', '$32', '76 going'].map((t) => <span key={t} className="flex h-[21px] items-center rounded-[10px] border border-line px-[8px] text-[12px] text-muted">{t}</span>)}
                <span className="flex h-[24px] items-center rounded-[6px] bg-ink px-[12px] text-[12px] font-bold text-white">SYNTHWAVE / EDM</span>
                <span className="flex h-[30px] items-center gap-[6px] rounded-[15px] border border-brand bg-surface px-[11px] text-[12px] font-semibold"><span className="size-[8px] rounded-full bg-brand" />Your taste profile</span>
              </div>
            </div>
          </Section>

          <Section id="cards" title="Cards & panels" note="White cards with a 1px line border; floating panels on the map add a shadow.">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[16px]">
              <div className="rounded-[16px] bg-surface p-[16px] ring-1 ring-inset ring-line shadow-panel">
                <p className="m-0 text-[13px] font-semibold">Legend</p>
                <div className="my-[8px] h-px bg-divider" />
                <p className="m-0 text-[11px] font-bold tracking-[0.66px] text-muted">DOT COLOUR = GENRE</p>
                <div className="mt-[8px] grid grid-cols-2 gap-[6px]">{GENRES.map((g) => <span key={g.key} className="flex items-center gap-[6px] text-[10px]"><span className="size-[9px] rounded-full" style={{ background: g.dot }} />{g.name}</span>)}</div>
              </div>
              <div className="rounded-[12px] border border-line bg-surface p-[16px]">
                <div className="flex items-center gap-[12px]">
                  <img src={IMG.fallingAvatar} alt="" className="size-[48px] rounded-full object-cover" />
                  <div><p className="m-0 text-[14px] font-semibold">FallingIslands</p><p className="m-0 text-[12px] text-muted">3k followers</p></div>
                  <span className="ml-auto text-[18px] text-brand">♥</span>
                </div>
                <span className="mt-[16px] inline-flex h-[24px] items-center rounded-[12px] border border-line px-[12px] text-[11px] text-muted">#synthwave</span>
              </div>
              <div className="rounded-[12px] border border-line bg-surface p-[16px]">
                <p className="m-0 text-[15px] font-semibold">Recent activity</p>
                <p className="m-0 mt-[10px] text-[12px] text-ink-soft"><b className="text-ink">Rosa Park</b> is going to FallingIslands @ BattleBox</p>
                <p className="m-0 mt-[2px] text-[11px] text-subtle">1d</p>
              </div>
            </div>
          </Section>

          <Section id="nav" title="Navigation" note="The same 72px bar on every page, Events included (React NavBar.jsx and Vue AppNavbar.vue share src/lib/nav.js).">
            <div className="overflow-hidden rounded-[12px] border border-line">
              <div className="grid h-[72px] grid-cols-[1fr_auto_1fr] items-center border-b border-divider bg-surface px-[24px]">
                <img src={IMG.brand} alt="" width="40" height="40" />
                <span className="flex gap-[24px] font-nav text-[14px] font-semibold"><span className="text-ink">Discover</span><span className="text-muted">Events</span><span className="text-muted">Artists</span><span className="text-muted">Forum</span></span>
                <span className="flex items-center gap-[12px] justify-self-end">
                  <span className="flex size-[36px] items-center justify-center rounded-[18px] bg-divider font-nav text-[13px] font-bold">{USER.initials}</span>
                  <span className="text-[13px] font-medium">{USER.name}</span>
                </span>
              </div>
              <div className="flex gap-[24px] bg-surface px-[24px]">
                {['Portfolio', 'Upcoming Event', 'Past Events'].map((t, i) => <span key={t} className={`py-[10px] text-[16px] ${i === 0 ? 'border-b-2 border-ink font-bold' : 'font-medium text-muted'}`}>{t}</span>)}
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  )
}
