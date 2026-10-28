// Kit's profile reflects explicit artist and event saves, never inferred attendance.
import { useEffect, useState } from 'react'
import Link from '@/components/AppLink'
import { featuredArtistAvatar } from '@/lib/featuredArtist'
import { Page } from '@/components/Layout'
import { ARTISTS, ROUTES, USER } from '@/data'
import { useSessionState } from '@/lib/useSession'
import { useToast } from '@/lib/toast'
import { useArtistProfile } from '@/lib/useArtistProfile'
import { useArtistSaveStudy } from '@/lib/useArtistSaveStudy'
import { useEvents } from '@/features/events/react/EventsContext'
import { eventUrl } from '@/features/events/react/eventModel'
import { dayLabelYear } from '@/features/events/utils/date'

const FAVOURITES = [
  { id: 'dj-beatroot', name: 'DJ Beatroot', tag: '#synthwave', hue: 215, to: ROUTES.artist },
  ...ARTISTS.filter(a => a.id !== 'dj-beatroot').map(a => ({ id: a.id, name: a.name, tag: `#${a.primaryGenreId}`, hue: 215, to: `/artists/${a.id}` })),
]

const ACTIVITY = [
  { who: USER.name, text: 'followed DJ Beatroot', to: ROUTES.artist, hue: 215 },
]
const DEFAULT_TAGS = ['#synthwave', '#edm', '#alt-pop', '#mandopop', '#indie rock', '#lo-fi']

const Initials = ({ name, hue, size }) => featuredArtistAvatar(name) ? (
  <img src={featuredArtistAvatar(name)} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
) : (
  <span className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.34, background: `var(--lrm-avatar, linear-gradient(135deg, hsl(${hue} 65% 45%), hsl(${(hue + 40) % 360} 70% 28%)))` }}>
    {name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
  </span>
)

export default function Profile() {
  const toast = useToast()
  const { events, saved: savedEventIds, loading: eventsLoading, error: eventsError } = useEvents()
  const savedEvents = events.filter(event => savedEventIds.has(event.id)).sort((a, b) => a.startsAt - b.startsAt)
  const [tab, setTab] = useState('favourites')
  const [profile, setProfile] = useSessionState('profile', { name: USER.name, bio: 'Hi there! New to LittleRedMusic', location: USER.location.label, tags: DEFAULT_TAGS })
  const { saved, setSaved, hasActivity, markSeen } = useArtistProfile()
  const { savedIds, study, preview } = useArtistSaveStudy()
  const favourites = [...new Set([...savedIds, ...(saved && !preview ? ['dj-beatroot'] : [])])]
  const [editing, setEditing] = useState(false)
  const [allTags, setAllTags] = useState(false)

  useEffect(() => { markSeen() }, [markSeen])

  const STATS = [
    [favourites.length, 'Artists saved'],
    [savedEvents.length, 'Events saved'],
    [0, 'Forum posts'],
    [profile.tags.length, 'Profile tags'],
  ]
  const TABS = [
    ['favourites', `Favourites (${favourites.length})`],
    ['threads', 'Threads (0)'],
    ['events', `Events (${savedEvents.length})`],
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
            <h1 className="font-display m-0 text-[26px] leading-normal font-semibold text-ink">{profile.name}</h1>
            <p className="m-0 mt-[4px] text-[14px] leading-normal text-muted">@{USER.id.replace('-', '')} · {profile.location} · Joined March 2026</p>
            {profile.bio && <p className="m-0 mt-[4px] text-[13px] text-ink-soft">{profile.bio}</p>}
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {shownTags.map((t) => <span key={t} className="flex h-[24px] items-center rounded-full border border-line px-[11px] text-[11px] text-muted">{t}</span>)}
              {profile.tags.length > 3 && (
                <button type="button" onClick={() => setAllTags(!allTags)} className="flex h-[24px] items-center rounded-full border border-line px-[11px] text-[11px] text-muted hover:border-faint">
                  {allTags ? 'Show less' : `+${profile.tags.length - 3} more`}
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-[12px] self-start pt-[32px]">
            <button type="button" onClick={() => setEditing(true)} className="h-[40px] rounded-control border border-line px-[24px] text-[13px] text-ink hover:bg-wash">Edit profile</button>
            <Link to={ROUTES.notifications} className="flex h-[40px] items-center rounded-control border border-line px-[25px] text-[13px] text-ink hover:bg-wash">Settings</Link>
          </div>
        </section>

        <div className="mt-[34px] h-px bg-divider" />

        {/* stats */}
        <section className="mt-[28px] flex gap-[8px]">
          {STATS.map(([n, label]) => (
            <div key={label} className="h-[88px] min-w-[180px] flex-1 rounded-card border border-line bg-surface px-[17px] pt-[15px]">
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
                {FAVOURITES.filter((a) => favourites.includes(a.id)).map((a) => {
                  const on = favourites.includes(a.id)
                  const Card = a.to ? Link : 'div'
                  return (
                      <div key={a.id} data-saved-artist={a.id} className={`relative h-[132px] rounded-card border border-line bg-surface p-[15px] transition-opacity ${on ? '' : 'opacity-50'}`}>
                      <Card to={a.to ?? `${ROUTES.eventsList}?artist=${a.id}`} className="flex items-center gap-[12px] pr-[28px]">
                        <Initials name={a.name} hue={a.hue} size={48} />
                        <span>
                          <span className="block text-[14px] font-semibold text-ink hover:underline">{a.name}</span>
                          <span className="block text-[12px] text-muted">Electronic / EDM</span>
                        </span>
                      </Card>
                      <button type="button" aria-pressed={on} aria-label={on ? `Remove ${a.name} from favourites` : `Add ${a.name} to favourites`}
                        onClick={() => { study.setSaved(a.id, !on, { track: false }); if (a.id === 'dj-beatroot') setSaved(!on); toast(on ? `Removed ${a.name} from favourites` : `Added ${a.name} to favourites`) }}
                        className={`absolute right-[15px] top-[15px] text-[18px] leading-none ${on ? 'text-brand' : 'text-faint hover:text-brand'}`}>{on ? '♥' : '♡'}</button>
                      <span className="absolute bottom-[25px] left-[15px] flex h-[24px] items-center rounded-full border border-line px-[13px] text-[11px] text-muted">{a.tag}</span>
                    </div>
                  )
                })}
                {!favourites.length && <p className="col-span-full m-0 text-[14px] text-muted">No saved artists yet.</p>}
              </div>
            )}

            {tab === 'threads' && (
              <p className="mt-[24px] text-[14px] text-muted">No threads yet.</p>
            )}

            {tab === 'events' && (
              <div className="mt-[24px]">
                {eventsLoading ? <p role="status" className="text-[14px] text-muted">Loading saved events…</p>
                  : eventsError ? <p role="alert" className="text-[14px] text-muted">Could not load saved events. Please try again later.</p>
                  : savedEvents.length ? <ul aria-label="Saved events" className="m-0 grid list-none gap-[12px] p-0">
                    {savedEvents.map(event => <li key={event.id} data-saved-event={event.id}>
                      <Link to={eventUrl(event.id)} className="block rounded-card border border-line bg-surface p-[16px] hover:bg-wash">
                        <span className="block text-[14px] font-semibold text-ink">{event.title}</span>
                        <span className="mt-[6px] block text-[12px] text-muted"><time dateTime={event.startsAt.toISOString()}>{dayLabelYear(event.startsAt)}</time> · {event.timeLabel}</span>
                        <span className="mt-[4px] block text-[12px] text-muted">{event.venue.label}</span>
                      </Link>
                    </li>)}
                  </ul> : <p className="text-[14px] text-muted">No saved events yet.</p>}
              </div>
            )}


          </section>

          {/* side panels */}
          <aside className="flex w-[370px] shrink-0 flex-col gap-[16px]">
            <section aria-labelledby="recent-activity-heading" className="rounded-card border border-line bg-surface px-[19px] pb-[8px] pt-[17px]">
              <h2 id="recent-activity-heading" className="font-display m-0 text-[15px] leading-normal font-semibold text-ink">Recent activity</h2>
              <ul className="m-0 mt-[8px] list-none divide-y divide-divider p-0">
                {(hasActivity ? ACTIVITY : []).map((a) => (
                  <li key={a.text}>
                    <Link to={a.to} className="flex items-start gap-[12px] py-[12px] hover:bg-wash">
                      <Initials name={a.who} hue={a.hue} size={32} />
                      <span className="flex-1 text-[12px] leading-[1.45] text-ink-soft"><b className="font-semibold text-ink">{a.who}</b> {a.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="next-events-heading" className="rounded-card border border-line bg-surface px-[19px] pb-[12px] pt-[15px]">
              <h2 id="next-events-heading" className="font-display m-0 text-[15px] leading-normal font-semibold text-ink">Your next events</h2>
              <p className="m-0 mt-[12px] text-[13px] text-muted">No upcoming events yet.</p>

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
  const field = 'mt-[4px] h-[44px] w-full rounded-control border border-line px-[14px] text-[14px] text-ink outline-none focus:border-ink'
  return (
    <div role="dialog" aria-modal="true" aria-label="Edit profile" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave({ name: form.name.trim() || USER.name, bio: form.bio, location: form.location, tags: form.tagText.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (t.startsWith('#') ? t : `#${t}`)) }) }}
        className="w-[440px] animate-pop rounded-panel bg-surface p-[28px] shadow-panel">
        <h2 className="font-display m-0 text-[20px] font-semibold text-ink">Edit profile</h2>
        {[['name', 'Display name'], ['location', 'Location'], ['bio', 'Bio'], ['tagText', 'Tags (comma-separated)']].map(([k, label]) => (
          <label key={k} className="mt-[14px] block text-[13px] font-medium text-ink">{label}
            <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={field} />
          </label>
        ))}
        <div className="mt-[22px] flex justify-end gap-[10px]">
          <button type="button" onClick={onClose} className="h-[40px] rounded-control border border-line px-[20px] text-[13px]">Cancel</button>
          <button type="submit" className="h-[40px] rounded-control bg-accent px-[22px] text-[13px] font-semibold text-on-accent">Save</button>
        </div>
      </form>
    </div>
  )
}
