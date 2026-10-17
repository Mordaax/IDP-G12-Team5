// Notifications — Figma 1439:170. Tabs filter the feed, rows open what they're about,
// "Mark all as read" clears the dots, and the settings switches toggle.
import { useState } from 'react'
import { useGo } from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { ROUTES } from '@/data'
import { useToast } from '@/lib/toast'

const TABS = ['All', 'Unread', 'Mentions', 'Follows', 'Events', 'Replies', 'System']

const ROWS = [
  { id: 1, who: 'Rosa Park', text: ' liked your comment on “Playing the full synth set at BattleBox”', time: '2h ago', type: 'Replies', to: ROUTES.threadReplied },
  { id: 2, who: 'Joel Tan', text: ' started following you', time: '4h ago', type: 'Follows' },
  { id: 3, who: 'Mei Xuan', text: ' mentioned you in a post: "@kit check out this new track!"', time: '1d ago', type: 'Mentions', to: ROUTES.thread },
  { id: 4, who: '', text: 'New event added near you: "Sherman Zhuo: Midnight Letters" at Esplanade Annexe Studio', time: '1d ago', type: 'Events', to: '/events/sherman-zhuo-esplanade' },
  { id: 5, who: 'FallingIslands', text: ' replied to your comment: "Thanks for the support!"', time: '2d ago', type: 'Replies', to: ROUTES.threadReplied },
  { id: 6, who: 'Ravi S.', text: ' liked your post on "Best local R&B artists?"', time: '3d ago', type: 'Replies', to: ROUTES.thread },
  { id: 7, who: '', text: "Weekly digest is ready! Check out this week's top artists and events.", time: '5d ago', type: 'System', to: ROUTES.forYou },
]
const UNREAD = new Set([1, 2, 3])
const SETTINGS = ['New gigs near me', 'Artists I follow', 'Forum replies', 'Mentions', 'Follows', 'Weekly digest']

export default function Notifications() {
  const navigate = useGo()
  const toast = useToast()
  const [tab, setTab] = useState('All')
  const [unread, setUnread] = useState(UNREAD)
  const [settings, setSettings] = useState(() => Object.fromEntries(SETTINGS.map((s) => [s, true])))

  const rows = ROWS.filter((r) => (tab === 'All' ? true : tab === 'Unread' ? unread.has(r.id) : r.type === tab))

  const open = (r) => {
    setUnread((u) => { const n = new Set(u); n.delete(r.id); return n })
    if (r.to) navigate(r.to)
    else toast(`${r.who} is now following you`)
  }

  return (
    <Page active={null}>
      <main className="w-full px-[clamp(20px,3vw,40px)] pb-[40px]">
        <div className="flex items-center justify-between pt-[20px]">
          <h1 className="m-0 text-[28px] leading-normal font-semibold text-ink">Notifications</h1>
          <button type="button" disabled={!unread.size} onClick={() => { setUnread(new Set()); toast('All caught up') }} className="text-[13px] font-medium text-muted hover:text-ink disabled:text-faint">Mark all as read</button>
        </div>

        <div role="tablist" className="mt-[16px] flex gap-[8px]">
          {TABS.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`flex h-[31px] items-center justify-center rounded-[100px] px-[13px] text-[12px] font-semibold ${tab === t ? 'bg-ink text-white' : 'border border-line bg-white text-muted hover:border-faint'}`}>
              {t}{t === 'Unread' && unread.size > 0 && <span className="ml-[6px] rounded-full bg-brand px-[6px] text-[10px] text-white">{unread.size}</span>}
            </button>
          ))}
        </div>

        <div className="mt-[20px] flex items-start gap-[24px]">
          <ul className="m-0 min-h-[400px] flex-1 list-none overflow-hidden rounded-[12px] border border-line bg-white p-0">
            {rows.length ? rows.map((r) => (
              <li key={r.id} className="border-b border-line last:border-b-0">
                <button type="button" onClick={() => open(r)} className="flex h-[68px] w-full items-center gap-[12px] px-[16px] text-left hover:bg-wash">
                  <span className="size-[36px] shrink-0 rounded-full border border-line bg-divider" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] leading-normal text-ink">{r.who && <b>{r.who}</b>}{r.text}</span>
                    <span className="block text-[11px] leading-normal text-subtle">{r.time}</span>
                  </span>
                  {unread.has(r.id) && <span className="size-[6px] shrink-0 rounded-full bg-ink-soft" aria-label="Unread" />}
                </button>
              </li>
            )) : (
              <li className="flex h-[300px] items-center justify-center text-[13px] text-subtle">Nothing here yet.</li>
            )}
          </ul>

          <section className="w-[380px] shrink-0 rounded-[12px] border border-line bg-white p-[23px]">
            <h2 className="m-0 text-[16px] leading-normal font-bold text-ink">Notification settings</h2>
            <p className="m-0 text-[12px] leading-normal text-muted">Choose how you want to be notified</p>
            <div className="my-[16px] h-px bg-line" />
            <ul className="m-0 flex list-none flex-col gap-[16px] p-0">
              {SETTINGS.map((s) => (
                <li key={s} className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink">{s}</span>
                  <button type="button" role="switch" aria-checked={settings[s]} aria-label={s} onClick={() => setSettings((v) => ({ ...v, [s]: !v[s] }))}
                    className={`relative h-[20px] w-[36px] rounded-[100px] transition-colors ${settings[s] ? 'bg-ink-soft' : 'bg-line'}`}>
                    <span className={`absolute top-[2px] size-[16px] rounded-full bg-white transition-all ${settings[s] ? 'left-[18px]' : 'left-[2px]'}`} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </Page>
  )
}
