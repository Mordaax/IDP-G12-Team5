// Your profile — Figma "5 Old Unused Screens Archive" → "Profile (Dashboard)" (160:2120), filled in
// for Kit Tan. Tabs: Favourites, Threads, Events, Following. Edits, favourites and follows last
// for this browser session (the site has no backend).
import { useState } from 'react'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { EVENTS_DB, ROUTES, USER } from '@/data'
import { sessionGet } from '@/lib/session'
import { useSessionState } from '@/lib/useSession'
import { useToast } from '@/lib/toast'

const FAVOURITES = [
  { id: 'fallingislands', name: 'FallingIslands', fans: '3k', tag: '#synthwave', hue: 215, to: ROUTES.artist },
  { id: 'evanturetime', name: 'Evanturetime', fans: '2.4k', tag: '#edm', hue: 195 },
  { id: 'lullaboy', name: 'Lullaboy', fans: '5.8k', tag: '#alt-pop', hue: 270 },
  { id: 'sherman-zhuo', name: 'Sherman Zhuo', fans: '3.4k', tag: '#mandopop', hue: 330 },
  { id: 'mindosphere', name: 'Mindosphere', fans: '1.2k', tag: '#house', hue: 180 },
  { id: 'kin-leonn', name: 'Kin Leonn', fans: '2.1k', tag: '#hip-hop', hue: 300 },
]
const THREADS = [
  { title: 'Playing the full synth set at BattleBox on Sunday', where: 'Events & Shows', meta: 'You commented', to: ROUTES.thread },
  { title: 'Best local R&B artists?', where: 'Artists & bands', meta: '14 replies · 2d ago', to: ROUTES.thread },
  { title: 'Who else is going to Gamelan on the Lawn?', where: 'Events & Shows', meta: '6 replies · 4d ago', to: ROUTES.thread },
  { title: 'Cheapest way to get a decent synth for live sets', where: 'Gear & production', meta: '22 replies · 1w ago', to: ROUTES.thread },
]
const PEOPLE = [
  { id: 'rosa-park', name: 'Rosa Park', note: 'Going to 3 of your events', hue: 340 },
  { id: 'joel-tan', name: 'Joel Tan', note: 'Follows 12 artists you like', hue: 205 },
  { id: 'mei-xuan', name: 'Mei Xuan', note: 'Mandopop · Indie', hue: 160 },
  { id: 'daniel-lim', name: 'Daniel Lim', note: 'Hip-Hop · Electronic', hue: 30 },
  { id: 'priya-nair', name: 'Priya Nair', note: 'Traditional · Pop', hue: 280 },
  { id: 'hakim-yusof', name: 'Hakim Yusof', note: 'Indie Rock', hue: 100 },
]
const ACTIVITY = [
  { who: 'FallingIslands', text: 'replied to your comment on “Playing the full synth set…”', ago: '2h', to: ROUTES.thread, hue: 215 },
  { who: 'Rosa Park', text: 'is going to FallingIslands @ BattleBox', ago: '1d', to: ROUTES.event, hue: 340 },
  { who: 'Lullaboy', text: 'announced a new show at BattleBox Fort Canning', ago: '3d', to: '/events/lullaboy-live-battlebox', hue: 270 },
  { who: 'Joel Tan', text: 'started following you', ago: '5d', to: ROUTES.messages + '?c=joel-tan', hue: 205 },
]
const DEFAULT_TAGS = ['#synthwave', '#edm', '#alt-pop', '#mandopop', '#indie rock', '#lo-fi']

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
function nextEvents() {
  const venues = Object.fromEntries(EVENTS_DB.venues.map((v) => [v.id, v]))
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('lrm.savedEvents') || '[]') } catch { return [] }
  })()
  const today = new Date()
  const km = (v) => {
    const rad = (d) => (d * Math.PI) / 180
    const dLat = rad(v.lat - USER.location.lat)
    const dLng = rad(v.lng - USER.location.lng)
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(USER.location.lat)) * Math.cos(rad(v.lat)) * Math.sin(dLng / 2) ** 2
    return `${(2 * 6371 * Math.asin(Math.sqrt(h))).toFixed(1)}km`
  }
  // events you saved first, then FallingIslands' gigs
  const pick = EVENTS_DB.events.filter((e) => e.dayOffset >= 0 && (saved.includes(e.id) || e.headliner === 'fallingislands'))
    .sort((a, b) => (saved.includes(b.id) - saved.includes(a.id)) || a.dayOffset - b.dayOffset)
  return pick.map((e) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + e.dayOffset)
    const artist = EVENTS_DB.artists.find((a) => a.id === e.headliner)
    return { id: e.id, dow: DOW[d.getDay()], date: d.getDate(), title: e.name || `${artist.name} at ${venues[e.venueId].listName}`, km: km(venues[e.venueId]), saved: saved.includes(e.id) }
  })
}

const Initials = ({ name, hue, size }) => (
  <span className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.34, background: `linear-gradient(135deg, hsl(${hue} 65% 45%), hsl(${(hue + 40) % 360} 70% 28%))` }}>
    {name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
  </span>
)

export default function Profile() {
  const toast = useToast()
  const [tab, setTab] = useState('favourites')
  const [profile, setProfile] = useSessionState('profile', { name: USER.name, bio: 'Synthwave nights, Mandopop mornings.', location: USER.location.label, tags: DEFAULT_TAGS })
  const [favourites, setFavourites] = useSessionState('profile.favourites', FAVOURITES.map((f) => f.id))
  const [following, setFollowing] = useSessionState('profile.following', PEOPLE.map((p) => p.id))
  const [editing, setEditing] = useState(false)
  const [allTags, setAllTags] = useState(false)
  const events = nextEvents()
  const myComments = sessionGet('thread.battlebox.mine', []).length

  const STATS = [
    [favourites.length + 28, 'Artists followed'],
    [12, 'Events attended'],
    [87 + myComments, 'Forum posts'],
    [5, 'Genre clusters'],
  ]
  const TABS = [
    ['favourites', `Favourites (${favourites.length})`],
    ['threads', `Threads (${87 + myComments})`],
    ['events', `Events (${events.length})`],
    ['following', `Following (${following.length})`],
  ]
  const shownTags = allTags ? profile.tags : profile.tags.slice(0, 3)

  return (
    <Page active={null}>
      <div className="h-px w-full bg-line" />
      <main className="w-full px-[clamp(20px,5.5vw,80px)] pb-[48px]">
        {/* header */}
        <section className="flex items-center gap-[24px] pt-[37px]">
          <span className="flex size-[96px] shrink-0 items-center justify-center rounded-full bg-divider font-nav text-[32px] font-bold text-ink">{USER.initials}</span>
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-[26px] leading-normal font-semibold text-ink">{profile.name}</h1>
            <p className="m-0 mt-[4px] text-[14px] leading-normal text-muted">@{USER.id.replace('-', '')} · {profile.location} · Joined March 2026</p>
            {profile.bio && <p className="m-0 mt-[4px] text-[13px] text-ink-soft">{profile.bio}</p>}
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {shownTags.map((t) => <span key={t} className="flex h-[24px] items-center rounded-[12px] border border-line px-[11px] text-[11px] text-muted">{t}</span>)}
              {profile.tags.length > 3 && (
                <button type="button" onClick={() => setAllTags(!allTags)} className="flex h-[24px] items-center rounded-[12px] border border-line px-[11px] text-[11px] text-muted hover:border-faint">
                  {allTags ? 'Show less' : `+${profile.tags.length - 3} more`}
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-[12px] self-start pt-[32px]">
            <button type="button" onClick={() => setEditing(true)} className="h-[40px] rounded-[20px] border border-line px-[24px] text-[13px] text-ink hover:bg-wash">Edit profile</button>
            <Link to={ROUTES.notifications} className="flex h-[40px] items-center rounded-[20px] border border-line px-[25px] text-[13px] text-ink hover:bg-wash">Settings</Link>
          </div>
        </section>

        <div className="mt-[34px] h-px bg-divider" />

        {/* stats */}
        <section className="mt-[28px] flex gap-[8px]">
          {STATS.map(([n, label]) => (
            <div key={label} className="h-[88px] min-w-[180px] flex-1 rounded-[10px] border border-line bg-white px-[17px] pt-[15px]">
              <p className="m-0 text-[24px] leading-normal font-semibold text-ink">{n}</p>
              <p className="m-0 mt-[9px] text-[12px] leading-normal text-muted">{label}</p>
            </div>
          ))}
        </section>

        <div className="mt-[34px] flex items-start gap-[80px]">
          <section className="min-w-0 flex-1">
            <nav role="tablist" className="flex gap-[36px] border-b border-divider">
              {TABS.map(([key, label]) => (
                <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                  className={`-mb-px pb-[10px] text-[14px] leading-normal ${tab === key ? 'border-b-2 border-ink font-semibold text-ink' : 'text-muted hover:text-ink'}`}>
                  {label}
                </button>
              ))}
            </nav>

            {tab === 'favourites' && (
              <div className="mt-[28px] grid grid-cols-[repeat(auto-fill,minmax(262px,1fr))] gap-[22px]">
                {FAVOURITES.map((a) => {
                  const on = favourites.includes(a.id)
                  const Card = a.to ? Link : 'div'
                  return (
                    <div key={a.id} className={`relative h-[132px] rounded-[10px] border border-line bg-white p-[15px] transition-opacity ${on ? '' : 'opacity-50'}`}>
                      <Card to={a.to ?? `${ROUTES.eventsList}?artist=${a.id}`} className="flex items-center gap-[12px] pr-[28px]">
                        <Initials name={a.name} hue={a.hue} size={48} />
                        <span>
                          <span className="block text-[14px] font-semibold text-ink hover:underline">{a.name}</span>
                          <span className="block text-[12px] text-muted">{a.fans} followers</span>
                        </span>
                      </Card>
                      <button type="button" aria-pressed={on} aria-label={on ? `Remove ${a.name} from favourites` : `Add ${a.name} to favourites`}
                        onClick={() => { setFavourites((f) => (on ? f.filter((x) => x !== a.id) : [...f, a.id])); toast(on ? `Removed ${a.name} from favourites` : `Added ${a.name} to favourites`) }}
                        className={`absolute right-[15px] top-[15px] text-[18px] leading-none ${on ? 'text-brand' : 'text-faint hover:text-brand'}`}>{on ? '♥' : '♡'}</button>
                      <span className="absolute bottom-[25px] left-[15px] flex h-[24px] items-center rounded-[12px] border border-line px-[13px] text-[11px] text-muted">{a.tag}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'threads' && (
              <ul className="m-0 mt-[16px] list-none divide-y divide-divider p-0">
                {THREADS.map((t) => (
                  <li key={t.title}>
                    <Link to={t.to} className="group flex items-center justify-between py-[16px]">
                      <span>
                        <span className="block text-[15px] font-semibold text-ink group-hover:underline">{t.title}</span>
                        <span className="block text-[12px] text-muted">{t.where} · {t.meta}</span>
                      </span>
                      <span className="text-faint">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {tab === 'events' && (
              <ul className="m-0 mt-[16px] list-none divide-y divide-divider p-0">
                {events.map((e) => (
                  <li key={e.id}>
                    <Link to={`/events/${e.id}`} className="group flex items-center gap-[16px] py-[14px]">
                      <span className="flex h-[48px] w-[44px] flex-col items-center justify-center rounded-[6px] border border-line text-[10px] font-semibold text-muted">{e.dow}<span className="text-[16px] text-ink">{e.date}</span></span>
                      <span className="flex-1">
                        <span className="block text-[15px] font-semibold text-ink group-hover:underline">{e.title}</span>
                        <span className="block text-[12px] text-muted">{e.km} away{e.saved ? ' · Saved' : ''}</span>
                      </span>
                      <span className="text-faint">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {tab === 'following' && (
              <ul className="m-0 mt-[16px] list-none divide-y divide-divider p-0">
                {PEOPLE.map((p) => {
                  const on = following.includes(p.id)
                  return (
                    <li key={p.id} className="flex items-center gap-[14px] py-[12px]">
                      <Initials name={p.name} hue={p.hue} size={40} />
                      <span className="flex-1">
                        <span className="block text-[14px] font-semibold text-ink">{p.name}</span>
                        <span className="block text-[12px] text-muted">{p.note}</span>
                      </span>
                      <Link to={`${ROUTES.messages}?c=${p.id}`} className="rounded-[18px] border border-line px-[16px] py-[7px] text-[12px] text-ink hover:bg-wash">Message</Link>
                      <button type="button" onClick={() => setFollowing((f) => (on ? f.filter((x) => x !== p.id) : [...f, p.id]))}
                        className={`w-[96px] rounded-[18px] py-[7px] text-[12px] font-semibold ${on ? 'border border-ink text-ink' : 'bg-ink text-white'}`}>
                        {on ? 'Following' : 'Follow'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* side panels */}
          <aside className="flex w-[370px] shrink-0 flex-col gap-[16px]">
            <section className="rounded-[12px] border border-line bg-white px-[19px] pb-[8px] pt-[17px]">
              <h2 className="m-0 text-[15px] leading-normal font-semibold text-ink">Recent activity</h2>
              <ul className="m-0 mt-[8px] list-none divide-y divide-divider p-0">
                {ACTIVITY.map((a) => (
                  <li key={a.text}>
                    <Link to={a.to} className="flex items-start gap-[12px] py-[12px] hover:bg-wash">
                      <Initials name={a.who} hue={a.hue} size={32} />
                      <span className="flex-1 text-[12px] leading-[1.45] text-ink-soft"><b className="font-semibold text-ink">{a.who}</b> {a.text}</span>
                      <span className="text-[11px] text-subtle">{a.ago}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-[12px] border border-line bg-white px-[19px] pb-[12px] pt-[15px]">
              <h2 className="m-0 text-[15px] leading-normal font-semibold text-ink">Your next events</h2>
              <ul className="m-0 mt-[8px] flex list-none flex-col gap-[6px] p-0">
                {events.slice(0, 2).map((e) => (
                  <li key={e.id}>
                    <Link to={`/events/${e.id}`} className="group flex items-center gap-[12px]">
                      <span className="flex h-[26px] w-[36px] items-center justify-center rounded-[6px] border border-line text-[10px] font-semibold text-muted">{e.dow}</span>
                      <span className="flex-1 truncate text-[13px] text-ink group-hover:underline">{e.title}</span>
                      <span className="text-[11px] text-subtle">{e.km}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>

      {editing && <EditProfile profile={profile} onClose={() => setEditing(false)} onSave={(p) => { setProfile(p); setEditing(false); toast('Profile updated') }} />}
    </Page>
  )
}

function EditProfile({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ ...profile, tagText: profile.tags.join(', ') })
  const field = 'mt-[4px] h-[44px] w-full rounded-[8px] border border-line px-[14px] text-[14px] text-black outline-none focus:border-ink'
  return (
    <div role="dialog" aria-modal="true" aria-label="Edit profile" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave({ name: form.name.trim() || USER.name, bio: form.bio, location: form.location, tags: form.tagText.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (t.startsWith('#') ? t : `#${t}`)) }) }}
        className="w-[440px] animate-pop rounded-[20px] bg-white p-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <h2 className="m-0 text-[20px] font-semibold text-ink">Edit profile</h2>
        {[['name', 'Display name'], ['location', 'Location'], ['bio', 'Bio'], ['tagText', 'Tags (comma-separated)']].map(([k, label]) => (
          <label key={k} className="mt-[14px] block text-[13px] font-medium text-ink">{label}
            <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={field} />
          </label>
        ))}
        <div className="mt-[22px] flex justify-end gap-[10px]">
          <button type="button" onClick={onClose} className="h-[40px] rounded-[20px] border border-line px-[20px] text-[13px]">Cancel</button>
          <button type="submit" className="h-[40px] rounded-[20px] bg-ink px-[22px] text-[13px] font-semibold text-white">Save</button>
        </div>
      </form>
    </div>
  )
}
