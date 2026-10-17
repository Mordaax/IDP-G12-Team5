// Messages — Figma "5 Old Unused Screens Archive" → "Profile (Messages)" (160:2324), filled in for
// Kit Tan. Pick a conversation, search, and send messages; people reply after a moment.
// Messages you send last for this browser session (the site has no backend).
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { ROUTES } from '@/data'
import { useSessionState } from '@/lib/useSession'

// [from 'them' | 'me', text]
const CONVERSATIONS = [
  { id: 'fallingislands', name: 'FallingIslands', hue: 215, active: true, ago: '2h', unread: true, to: ROUTES.artist,
    messages: [['them', 'Hey Kit! Saw you RSVP’d for BattleBox on Saturday 🙌'], ['me', 'Yes!! Can’t wait to hear the new EP live.'], ['them', 'We’re bringing the full analogue rig down into the bunker. Come say hi after the set — we’ll be by the merch table.'], ['me', 'Will do! Any chance you’ll play Low Tide?'], ['them', 'It’s the closer 😉'], ['me', 'Perfect. See you there, bringing a couple of friends from the forum too.']],
    replies: ['See you on Saturday!', 'Thanks for the support, means a lot 🙏', 'Bring earplugs, it gets loud down there 😄'] },
  { id: 'rosa-park', name: 'Rosa Park', hue: 340, ago: '5h', unread: true,
    messages: [['them', 'Are you going to BattleBox on Saturday?'], ['me', 'Yep, got my ticket this morning'], ['them', 'Want to split a Grab from the east side after? The last set ends late.']],
    replies: ['Great, I’ll message you on the day', 'Let’s meet at Fort Canning MRT at 7:30?', '👍'] },
  { id: 'joel-tan', name: 'Joel Tan', hue: 205, ago: '1d',
    messages: [['them', 'Sent you the playlist 🎧 — lots of Singapore synthwave on it'], ['me', 'Amazing, adding it now']],
    replies: ['Let me know what you think of track 4', 'There’s more where that came from'] },
  { id: 'mei-xuan', name: 'Mei Xuan', hue: 160, ago: '2d',
    messages: [['me', 'Is there a cloakroom at BattleBox?'], ['them', 'Yes, on the left when you go in. Queue is long after 9 though, go early!']],
    replies: ['No problem!', 'See you in the queue haha'] },
  { id: 'lullaboy', name: 'Lullaboy', hue: 270, ago: '3d',
    messages: [['them', 'New single drops Friday! Thanks for always showing up to the shows ✨']],
    replies: ['Hope you like it!', 'Catch us live at BattleBox soon'] },
  { id: 'battlebox', name: 'BattleBox Fort Canning', hue: 30, ago: '5d', to: ROUTES.event,
    messages: [['them', 'Your ticket for FallingIslands @ BattleBox Fort Canning is confirmed. Doors open 7:30 PM; bring photo ID (18+).']],
    replies: ['Thanks for your message, our team will get back to you shortly.'] },
  { id: 'littleredmusic', name: 'LittleRedMusic', hue: 0, ago: '1w',
    messages: [['them', 'Welcome to LittleRedMusic, Kit! Your web of artists is ready — every dot is an artist playing in Singapore.']],
    replies: ['Happy listening! 🎶'] },
]

const Initials = ({ name, hue, size }) => (
  <span className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.34, background: `linear-gradient(135deg, hsl(${hue} 65% 45%), hsl(${(hue + 40) % 360} 70% 28%))` }}>
    {name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
  </span>
)

export default function Messages() {
  const [params, setParams] = useSearchParams()
  const [sent, setSent] = useSessionState('messages.sent', {}) // id → [[from, text], …] added this session
  const [read, setRead] = useSessionState('messages.read', [])
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(null)
  const scroller = useRef(null)
  const timers = useRef([])

  const currentId = CONVERSATIONS.some((c) => c.id === params.get('c')) ? params.get('c') : CONVERSATIONS[0].id
  const current = CONVERSATIONS.find((c) => c.id === currentId)
  const thread = [...current.messages, ...(sent[currentId] || [])]
  const term = q.trim().toLowerCase()
  const list = CONVERSATIONS.filter((c) => !term || c.name.toLowerCase().includes(term) || [...c.messages, ...(sent[c.id] || [])].some(([, t]) => t.toLowerCase().includes(term)))

  const open = (id) => setParams({ c: id }, { replace: true })
  useEffect(() => {
    if (!read.includes(currentId)) setRead((r) => [...r, currentId])
    setDraft('')
  }, [currentId]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }) }, [thread.length, typing, currentId])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const send = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const id = currentId
    setSent((s) => ({ ...s, [id]: [...(s[id] || []), ['me', text]] }))
    setDraft('')
    // they write back after a moment
    const conv = CONVERSATIONS.find((c) => c.id === id)
    const n = (sent[id] || []).filter(([f]) => f === 'me').length
    timers.current.forEach(clearTimeout)
    timers.current = [
      setTimeout(() => setTyping(id), 600),
      setTimeout(() => {
        setTyping(null)
        setSent((s) => ({ ...s, [id]: [...(s[id] || []), ['them', conv.replies[n % conv.replies.length]]] }))
      }, 1900),
    ]
  }

  const lastLine = (c) => {
    const all = [...c.messages, ...(sent[c.id] || [])]
    const [from, text] = all[all.length - 1]
    return `${from === 'me' ? 'You: ' : ''}${text}`
  }

  return (
    <Page active={null}>
      <div className="h-px w-full bg-line" />
      <main className="flex w-full flex-1 px-[clamp(20px,5.5vw,80px)] pb-[48px] pt-[32px]">
        <div className="flex h-[max(560px,calc(var(--screen-h)-153px))] w-full overflow-hidden rounded-[12px] border border-line bg-white">
          {/* conversations */}
          <aside className="flex w-[380px] shrink-0 flex-col border-r border-divider">
            <div className="p-[15px] pb-[12px]">
              <label className="flex h-[44px] items-center gap-[8px] rounded-[100px] bg-[rgba(120,120,128,0.16)] px-[11px] focus-within:ring-2 focus-within:ring-accent">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="7.5" cy="7.5" r="6" stroke="#727272" strokeWidth="1.8" /><path d="M12 12L16.5 16.5" stroke="#727272" strokeWidth="1.8" strokeLinecap="round" /></svg>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search messages" className="min-w-0 flex-1 bg-transparent font-nav text-[17px] text-ink outline-none placeholder:text-subtle" />
              </label>
            </div>
            <ul className="m-0 flex-1 list-none overflow-y-auto p-0">
              {list.map((c) => {
                const unread = c.unread && !read.includes(c.id)
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => open(c.id)} aria-current={c.id === currentId ? 'true' : undefined}
                      className={`flex h-[76px] w-full items-center gap-[12px] border-b border-divider px-[15px] text-left ${c.id === currentId ? 'bg-soft' : 'hover:bg-wash'}`}>
                      <Initials name={c.name} hue={c.hue} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13px] text-ink ${unread ? 'font-semibold' : ''}`}>{c.name}</span>
                        <span className={`block truncate text-[12px] ${unread ? 'text-ink' : 'text-subtle'}`}>{lastLine(c)}</span>
                      </span>
                      <span className="flex flex-col items-end gap-[6px] self-start pt-[18px]">
                        <span className="text-[11px] text-subtle">{sent[c.id]?.length ? 'now' : c.ago}</span>
                        {unread && <span className="size-[8px] rounded-full bg-brand" aria-label="Unread" />}
                      </span>
                    </button>
                  </li>
                )
              })}
              {!list.length && <li className="p-[20px] text-center text-[13px] text-subtle">No conversations match “{q.trim()}”.</li>}
            </ul>
          </aside>

          {/* conversation */}
          <section className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-[76px] shrink-0 items-center gap-[12px] border-b border-divider px-[24px]">
              <Initials name={current.name} hue={current.hue} size={36} />
              <div className="flex-1">
                <p className="m-0 text-[14px] font-semibold text-ink">{current.name}</p>
                <p className="m-0 text-[11px] text-subtle">{typing === currentId ? 'typing…' : current.active ? 'Active now' : `Active ${current.ago} ago`}</p>
              </div>
              {current.to && <Link to={current.to} className="rounded-[18px] border border-line px-[14px] py-[6px] text-[12px] text-ink hover:bg-wash">{current.id === 'battlebox' ? 'View event' : 'View profile'}</Link>}
            </header>

            <div ref={scroller} className="flex flex-1 flex-col gap-[16px] overflow-y-auto px-[24px] py-[12px]">
              <p className="m-0 text-center text-[10px] text-subtle">Today</p>
              {thread.map(([from, text], i) => (
                <div key={i} className={`max-w-[60%] animate-pop rounded-[16px] px-[16px] py-[11px] text-[13px] leading-[1.45] ${from === 'me' ? 'self-end rounded-br-[4px] bg-ink text-white' : 'self-start rounded-bl-[4px] bg-soft text-ink'}`}>
                  {text}
                </div>
              ))}
              {typing === currentId && (
                <div className="flex gap-[4px] self-start rounded-[16px] rounded-bl-[4px] bg-soft px-[16px] py-[14px]" aria-label={`${current.name} is typing`}>
                  {[0, 1, 2].map((d) => <span key={d} className="size-[6px] animate-bounce rounded-full bg-subtle" style={{ animationDelay: `${d * 0.15}s` }} />)}
                </div>
              )}
            </div>

            <form onSubmit={send} className="flex shrink-0 items-center gap-[16px] px-[24px] pb-[24px] pt-[8px]">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" aria-label={`Message ${current.name}`}
                className="h-[48px] flex-1 rounded-[24px] border border-line px-[19px] text-[13px] text-ink outline-none placeholder:text-subtle focus:border-ink" />
              <button type="submit" disabled={!draft.trim()} aria-label="Send" className="flex size-[48px] items-center justify-center rounded-full bg-ink text-[16px] font-semibold text-white transition-opacity hover:bg-black disabled:opacity-40">↑</button>
            </form>
          </section>
        </div>
      </main>
    </Page>
  )
}
