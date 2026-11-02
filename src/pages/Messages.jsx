// Messages — Figma "5 Old Unused Screens Archive" → "Profile (Messages)" (160:2324), filled in for
// Kit Tan. Pick a conversation, search, and send messages; people reply after a moment.
// Like Messenger you can react, reply to, forward, edit and unsend messages, and see when they've been seen.
// Messages and demo progress reset when the application reloads.
import { Fragment, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Link from '@/components/AppLink'
import { featuredArtistAvatar } from '@/lib/featuredArtist'
import { Page } from '@/components/Layout'
import { ROUTES } from '@/data'
import { useSessionState } from '@/lib/useSession'
import { AttachButtons, AttachmentList, AttachmentTray, attachmentSummary, useAttachments } from '@/components/Attachments'
import ConfirmDialog from '@/components/ConfirmDialog'
import EmojiPanel, { Popover, QUICK_REACTIONS } from '@/components/EmojiPicker'
import { useToast } from '@/lib/toast'
import { communityDemo } from '@/lib/communityDemo'
import { useCommunityDemo } from '@/lib/useCommunityDemo'

// [from 'them' | 'me', text]
const CONVERSATIONS = [
  { id: 'joel-tan', name: 'Joel Tan', hue: 205, active: true, ago: '0m',
    messages: [],
    replies: [] },
  { id: 'littleredmusic', name: 'LittleRedMusic', hue: 0, ago: '0m',
    messages: [['them', 'Welcome to LittleRedMusic, Kit! Join an event discussion to meet other listeners and continue the conversation here.']],
    replies: ['Happy listening! Explore the Events and Forum pages to meet the local community.'] },
]

const Initials = ({ name, hue, size }) => featuredArtistAvatar(name) ? (
  <img src={featuredArtistAvatar(name)} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
) : (
  <span className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.34, background: `var(--lrm-avatar, linear-gradient(135deg, hsl(${hue} 65% 45%), hsl(${(hue + 40) % 360} 70% 28%)))` }}>
    {name.replace(/[^\p{L}\s]/gu, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
  </span>
)

const snippet = (m) => m.deleted ? 'Unsent message' : (m.text || attachmentSummary(m.files) || '').slice(0, 80)
// times: the seeded messages are placed before each conversation's "ago" (2h, 1d …), a few minutes apart
const UNIT = { m: 60e3, h: 3600e3, d: 864e5, w: 6048e5 }
const OPENED = Date.now()
const agoMs = (ago) => { const match = /^(\d+)([mhdw])$/.exec(ago || ''); return match ? Number(match[1]) * UNIT[match[2]] : 0 }
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString()
const timeOf = (at) => new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
const dayOf = (at) => sameDay(at, Date.now()) ? 'Today' : sameDay(at, Date.now() - UNIT.d) ? 'Yesterday' : new Date(at).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
const stamp = (at) => `${dayOf(at)} ${timeOf(at)}` // "Today 11:42 PM", "Yesterday 9:05 PM", "Mon 19 Oct 8:30 PM"
const shortStamp = (at) => sameDay(at, Date.now()) ? timeOf(at) : stamp(at)
const GAP = 15 * UNIT.m // a new time heading after 15 minutes of quiet

const ActionIcon = {
  react: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" /></svg>,
  reply: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 6 6v5" /></svg>,
  forward: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0-6 6v5" /></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>,
  unsend: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>,
}

export default function Messages() {
  const demo = useCommunityDemo()
  const conversations = CONVERSATIONS.filter(c => c.id !== 'joel-tan' || demo.commentId)
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  // id → messages added this session: [from, text, files?] from older builds, or { id, from, text, files, replyTo, forwarded, at }
  const [sent, setSent] = useSessionState('messages.sent', {})
  // message id → { text, edited, deleted, myReaction, theirReaction } — changes to any message, old or new
  const [meta, setMeta] = useSessionState('messages.meta', {})
  const [seenAt, setSeenAt] = useSessionState('messages.seenAt', {}) // your message id → when they read it
  const [details, setDetails] = useState(null) // message whose sent/seen times are shown
  const [read, setRead] = useSessionState('messages.read', [])
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(null)
  const [replyTo, setReplyTo] = useState(null) // message being replied to
  const [editing, setEditing] = useState(null) // message being edited
  const [picker, setPicker] = useState(null) // id of the message whose reaction picker is open
  const [pickerFull, setPickerFull] = useState(false) // showing every emoji, not just the quick six
  const [composerEmoji, setComposerEmoji] = useState(false)
  const [pickerAnchor, setPickerAnchor] = useState(null) // the React button the picker opens from
  const emojiButton = useRef(null)
  const [forwarding, setForwarding] = useState(null) // message being forwarded
  const [forwardedTo, setForwardedTo] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [flash, setFlash] = useState(null)
  const attachments = useAttachments()
  const scroller = useRef(null)
  const input = useRef(null)
  const timers = useRef([])

  const messagesOf = (conv) => [
    ...conv.messages.map(([from, text, files], i) => ({ id: `${conv.id}-${i}`, from, text, files, base: true,
      at: OPENED - agoMs(conv.ago) - (conv.messages.length - 1 - i) * 4 * UNIT.m })),
    ...(conv.id === 'joel-tan' ? demo.messages : []),
    ...(sent[conv.id] || []).map((m, i) => Array.isArray(m) ? { id: `${conv.id}-s${i}`, from: m[0], text: m[1], files: m[2], at: OPENED } : m),
  ].map((m) => ({ ...m, ...(meta[m.id] || {}) }))
  // when they read one of your messages: when it was marked seen, else when they next wrote back
  const seenTime = (m, list) => {
    if (m.from !== 'me') return null
    if (seenAt[m.id]) return seenAt[m.id]
    const answer = list.slice(list.indexOf(m) + 1).find((next) => next.from === 'them')
    return answer ? answer.at : m.base ? m.at + 2 * UNIT.m : null
  }

  const currentId = conversations.some((c) => c.id === params.get('c')) ? params.get('c') : conversations[0].id
  const current = conversations.find((c) => c.id === currentId)
  const thread = messagesOf(current)
  const term = q.trim().toLowerCase()
  const list = conversations.filter((c) => !term || c.name.toLowerCase().includes(term) || messagesOf(c).some((m) => !m.deleted && (m.text || '').toLowerCase().includes(term)))
  const lastMine = [...thread].reverse().find((m) => m.from === 'me' && !m.deleted)
  const lastMineSeen = lastMine && seenTime(lastMine, thread)

  const open = (id) => setParams({ c: id }, { replace: true })
  const resetComposer = () => { setDraft(''); setReplyTo(null); setEditing(null); attachments.clear() }
  useEffect(() => {
    if (!read.includes(currentId)) setRead((r) => [...r, currentId])
    resetComposer()
    setPicker(null)
  }, [currentId]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }) }, [thread.length, typing, currentId, demo.messagePending])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  useEffect(() => setPickerFull(false), [picker])
  useEffect(() => {
    if (currentId === 'joel-tan') communityDemo.openMessages()
  }, [currentId, demo.messageUnread])
  useEffect(() => {
    if (currentId !== 'joel-tan') return undefined
    communityDemo.startConversation()
    return () => communityDemo.pauseConversation()
  }, [currentId])
  useEffect(() => {
    if (currentId === 'joel-tan' && (demo.conversationPlaying || demo.conversationComplete)) setDraft(demo.messageDraft)
  }, [currentId, demo.messageDraft, demo.conversationPlaying, demo.conversationComplete])
  const stopAutoplay = () => { if (currentId === 'joel-tan') communityDemo.stopConversation() }
  useEffect(() => {
    if (!composerEmoji) return undefined
    const close = (event) => !event.target.closest?.('[data-composer-emoji]') && setComposerEmoji(false)
    const onKey = (event) => event.key === 'Escape' && setComposerEmoji(false)
    document.addEventListener('mousedown', close)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('keydown', onKey) }
  }, [composerEmoji])
  const insertEmoji = (emoji) => {
    stopAutoplay()
    const field = input.current
    const start = field?.selectionStart ?? draft.length
    const end = field?.selectionEnd ?? draft.length
    setDraft(draft.slice(0, start) + emoji + draft.slice(end))
    requestAnimationFrame(() => { field?.focus(); field?.setSelectionRange(start + emoji.length, start + emoji.length) })
  }
  useEffect(() => {
    if (!picker) return undefined
    const close = (event) => !event.target.closest?.('[data-reaction-picker]') && setPicker(null)
    const onKey = (event) => event.key === 'Escape' && setPicker(null)
    document.addEventListener('mousedown', close)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('keydown', onKey) }
  }, [picker])

  const patch = (id, change) => setMeta((all) => ({ ...all, [id]: { ...(all[id] || {}), ...change } }))
  const append = (convId, message) => setSent((s) => ({ ...s, [convId]: [...(s[convId] || []), message] }))
  const newId = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  const send = (e) => {
    e.preventDefault()
    stopAutoplay()
    const text = draft.trim()
    if (editing) {
      if (!text && !editing.files?.length) return
      if (text !== (editing.text || '')) patch(editing.id, { text, edited: true })
      resetComposer()
      return
    }
    const files = attachments.items
    if (!text && !files.length) return
    const id = currentId
    if (id === 'joel-tan') {
      if (files.length) { toast('Use a text message to ask Joel for recommendations.'); return }
      if (communityDemo.sendMessage(text)) resetComposer()
      return
    }
    const message = { id: newId(), from: 'me', text, files: files.length ? files : undefined, at: Date.now(),
      replyTo: replyTo ? { id: replyTo.id, from: replyTo.from, text: snippet(replyTo) } : undefined }
    append(id, message)
    resetComposer()
    // they read it, type, and write back after a moment
    const conv = CONVERSATIONS.find((c) => c.id === id)
    const n = (sent[id] || []).filter((m) => (Array.isArray(m) ? m[0] : m.from) === 'me').length
    timers.current.forEach(clearTimeout)
    timers.current = [
      setTimeout(() => { setSeenAt((all) => ({ ...all, [message.id]: Date.now() })); setTyping(id) }, 700),
      setTimeout(() => {
        setTyping(null)
        if (files.length) patch(message.id, { theirReaction: '❤️' })
        append(id, { id: newId(), from: 'them', text: conv.replies[n % conv.replies.length], at: Date.now() })
      }, 2000),
    ]
  }

  const startReply = (m) => { stopAutoplay(); setEditing(null); setReplyTo(m); input.current?.focus() }
  const startEdit = (m) => { stopAutoplay(); setReplyTo(null); attachments.clear(); setEditing(m); setDraft(m.text || ''); input.current?.focus() }
  const unsend = (m) => setConfirm({
    title: 'Unsend message?', body: `This message will be removed for you and ${current.name}.`, label: 'Unsend',
    action: () => { patch(m.id, { deleted: true, myReaction: undefined, theirReaction: undefined }); if (editing?.id === m.id || replyTo?.id === m.id) resetComposer(); toast('Message unsent') },
  })
  const react = (m, emoji) => { patch(m.id, { myReaction: m.myReaction === emoji ? undefined : emoji }); setPicker(null) }
  const forwardTo = (conv) => {
    append(conv.id, { id: newId(), from: 'me', text: forwarding.text, files: forwarding.files, forwarded: true, at: Date.now() })
    setForwardedTo((all) => [...all, conv.id])
    toast(`Forwarded to ${conv.name}`)
  }
  const jumpTo = (id) => {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlash(id)
    setTimeout(() => setFlash(null), 1200)
  }

  const lastLine = (c) => {
    const all = messagesOf(c)
    const m = all[all.length - 1]
    if (!m) return 'Start a conversation'
    if (m.deleted) return m.from === 'me' ? 'You unsent a message' : `${c.name} unsent a message`
    return `${m.from === 'me' ? 'You: ' : ''}${m.text || attachmentSummary(m.files)}`
  }
  const who = (from) => from === 'me' ? 'yourself' : current.name
  const actionButton = 'flex size-[28px] items-center justify-center rounded-full text-subtle hover:bg-soft hover:text-ink'

  return (
    <Page active={null}>
      <div className="h-px w-full bg-line" />
      <main className="flex w-full flex-1 px-[clamp(20px,5.5vw,80px)] pb-[48px] pt-[32px]">
        <div className="flex h-[max(560px,calc(var(--screen-h)-153px))] w-full overflow-hidden rounded-card border border-line bg-surface">
          {/* conversations */}
          <aside className="flex w-[380px] shrink-0 flex-col border-r border-divider">
            <div className="p-[15px] pb-[12px]">
              <label className="flex h-[44px] items-center gap-[8px] rounded-control bg-soft px-[11px] focus-within:ring-2 focus-within:ring-accent">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="7.5" cy="7.5" r="6" stroke="var(--lrm-raw-727272)" strokeWidth="1.8" /><path d="M12 12L16.5 16.5" stroke="var(--lrm-raw-727272)" strokeWidth="1.8" strokeLinecap="round" /></svg>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search messages" className="min-w-0 flex-1 bg-transparent font-nav text-[17px] text-ink outline-none placeholder:text-subtle" />
              </label>
            </div>
            <ul className="m-0 flex-1 list-none overflow-y-auto p-0">
              {list.map((c) => {
                const unread = c.id === 'joel-tan' ? demo.messageUnread : c.unread && !read.includes(c.id)
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
                        <span className="text-[11px] text-subtle">{sent[c.id]?.length ? timeOf(messagesOf(c).at(-1).at) : c.ago}</span>
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
                <p className="m-0 text-[11px] text-subtle">{(typing === currentId || (currentId === 'joel-tan' && demo.messagePending)) ? 'typing…' : current.active ? 'Active now' : `Active ${current.ago} ago`}</p>
              </div>
              {current.to && <Link to={current.to} className="rounded-control border border-line px-[14px] py-[6px] text-[12px] text-ink hover:bg-wash">{current.id === 'battlebox' ? 'View event' : 'View profile'}</Link>}
            </header>

            <div ref={scroller} className="flex flex-1 flex-col gap-[14px] overflow-y-auto px-[24px] py-[12px]">
              {thread.map((m, i) => {
                const mine = m.from === 'me'
                const reactions = [m.theirReaction, m.myReaction].filter(Boolean)
                const previous = thread[i - 1]
                const heading = !previous || m.at - previous.at >= GAP || !sameDay(m.at, previous.at)
                const readAt = seenTime(m, thread)
                const timeLine = mine ? `Sent ${stamp(m.at)} · ${readAt ? `Seen ${stamp(readAt)}` : 'Not seen yet'}` : `Sent ${stamp(m.at)}`
                return (
                  <Fragment key={m.id}>
                  {heading && <p className="m-0 mt-[4px] text-center text-[10px] font-medium text-subtle">{stamp(m.at)}</p>}
                  <div id={`msg-${m.id}`} className={`group flex max-w-[70%] flex-col ${mine ? 'items-end self-end' : 'items-start self-start'}`}>
                    {m.forwarded && !m.deleted && <span className="mb-[3px] text-[11px] text-subtle">↪ {mine ? 'You forwarded a message' : 'Forwarded'}</span>}
                    {m.replyTo && !m.deleted && <>
                      <span className="mb-[3px] text-[11px] text-subtle">↩ {mine ? 'You' : current.name} replied to {m.replyTo.from === m.from ? (mine ? 'yourself' : 'themselves') : m.replyTo.from === 'me' ? 'you' : current.name}</span>
                      <button type="button" onClick={() => jumpTo(m.replyTo.id)} className="mb-[-10px] max-w-full truncate rounded-panel bg-wash px-[14px] pb-[16px] pt-[8px] text-left text-[12px] text-muted hover:bg-soft">{m.replyTo.text}</button>
                    </>}
                    <div className={`flex items-center gap-[4px] ${mine ? 'flex-row-reverse' : ''}`}>
                      {m.deleted
                        ? <div className="rounded-panel border border-line px-[14px] py-[9px] text-[13px] italic text-subtle">{mine ? 'You unsent a message' : `${current.name} unsent a message`}</div>
                        : <div title={timeLine} onClick={(e) => !e.target.closest('a, button, audio, video') && setDetails((d) => (d === m.id ? null : m.id))} className={`relative flex animate-pop cursor-default flex-col gap-[8px] rounded-panel text-[13px] leading-[1.45] transition-shadow ${flash === m.id ? 'ring-2 ring-accent ring-offset-2' : ''} ${m.files?.length ? 'p-[6px]' : 'px-[16px] py-[11px]'} ${mine ? 'rounded-br-[4px] bg-ink text-white' : 'rounded-bl-[4px] bg-soft text-ink'}`}>
                          <AttachmentList items={m.files} tone={mine ? 'dark' : 'light'} />
                          {m.text && <span className={`whitespace-pre-line ${m.files?.length ? 'px-[10px] pb-[5px]' : ''}`}>{m.text}</span>}
                          {reactions.length > 0 && <span className={`absolute -bottom-[12px] ${mine ? 'left-[6px]' : 'right-[6px]'} flex items-center gap-[1px] rounded-full border border-line bg-surface px-[5px] py-[1px] text-[12px] text-ink shadow-sm`} aria-label={`Reactions: ${reactions.join(' ')}`}>
                            {reactions.map((r, i) => <span key={i}>{r}</span>)}{reactions.length > 1 && <span className="ml-[2px] text-[10px] text-subtle">2</span>}
                          </span>}
                        </div>}
                      {!m.deleted && <div className={`relative flex items-center transition-opacity focus-within:opacity-100 group-hover:opacity-100 ${picker === m.id ? 'opacity-100' : 'opacity-0'}`} role="toolbar" aria-label="Message actions">
                        <button type="button" className={actionButton} aria-label="React" title="React" aria-expanded={picker === m.id} onClick={(e) => { setPickerAnchor(e.currentTarget); setPicker(picker === m.id ? null : m.id) }}>{ActionIcon.react}</button>
                        <button type="button" className={actionButton} aria-label={`Reply to ${who(m.from)}`} title="Reply" onClick={() => startReply(m)}>{ActionIcon.reply}</button>
                        <button type="button" className={actionButton} aria-label="Forward" title="Forward" onClick={() => { setForwardedTo([]); setForwarding(m) }}>{ActionIcon.forward}</button>
                        {mine && <button type="button" className={actionButton} aria-label="Edit message" title="Edit" onClick={() => startEdit(m)}>{ActionIcon.edit}</button>}
                        {mine && <button type="button" className={actionButton} aria-label="Unsend message" title="Unsend" onClick={() => unsend(m)}>{ActionIcon.unsend}</button>}
                        <span className="whitespace-nowrap px-[6px] text-[10px] text-subtle">{timeOf(m.at)}</span>
                        {picker === m.id && <Popover anchor={pickerAnchor} align={mine ? 'end' : 'start'} data-reaction-picker>{pickerFull
                          ? <EmojiPanel label="Choose a reaction" selected={m.myReaction} onPick={(emoji) => react(m, emoji)} />
                          : <div className="flex items-center gap-[2px] rounded-full border border-line bg-surface p-[4px] shadow-pop" role="menu" aria-label="Choose a reaction">
                            {QUICK_REACTIONS.map((emoji) => <button key={emoji} type="button" role="menuitemradio" aria-checked={m.myReaction === emoji} onClick={() => react(m, emoji)}
                              className={`flex size-[32px] items-center justify-center rounded-full text-[18px] transition-transform hover:scale-125 ${m.myReaction === emoji ? 'bg-soft' : ''}`}>{emoji}</button>)}
                            {m.myReaction && !QUICK_REACTIONS.includes(m.myReaction) && <button type="button" role="menuitemradio" aria-checked onClick={() => react(m, m.myReaction)} className="flex size-[32px] items-center justify-center rounded-full bg-soft text-[18px]">{m.myReaction}</button>}
                            <button type="button" onClick={() => setPickerFull(true)} aria-label="More reactions" title="More reactions" className="flex size-[32px] items-center justify-center rounded-full bg-soft text-[18px] text-muted hover:bg-wash hover:text-ink">+</button>
                          </div>}</Popover>}
                      </div>}
                    </div>
                    {(reactions.length > 0 && !m.deleted) && <span className="h-[10px]" />}
                    {m.edited && !m.deleted && <span className="mt-[2px] text-[10px] text-subtle">Edited</span>}
                    {details === m.id && !m.deleted && <span className="mt-[3px] animate-pop text-[10px] text-subtle">{timeLine}</span>}
                    {lastMine?.id === m.id && details !== m.id && <span className="mt-[3px] flex items-center gap-[4px] text-[10px] text-subtle" aria-live="polite">
                      {lastMineSeen ? <><Initials name={current.name} hue={current.hue} size={14} /> Seen {shortStamp(lastMineSeen)}</> : `Sent ${shortStamp(m.at)}`}
                    </span>}
                  </div>
                  </Fragment>
                )
              })}
              {(typing === currentId || (currentId === 'joel-tan' && demo.messagePending)) && (
                <div className="flex gap-[4px] self-start rounded-panel rounded-bl-[4px] bg-soft px-[16px] py-[14px]" aria-label={`${current.name} is typing`}>
                  {[0, 1, 2].map((d) => <span key={d} className="size-[6px] animate-bounce rounded-full bg-subtle" style={{ animationDelay: `${d * 0.15}s` }} />)}
                </div>
              )}
            </div>

            <form onSubmit={send} onKeyDown={(e) => e.key === 'Escape' && (replyTo || editing) && resetComposer()} className="flex shrink-0 flex-col gap-[10px] px-[24px] pb-[24px] pt-[8px]">


              {(replyTo || editing) && <div className="flex items-center gap-[10px] border-t border-divider pt-[10px] text-[12px]">
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-semibold text-ink">{editing ? 'Editing message' : `Replying to ${who(replyTo.from)}`}</p>
                  <p className="m-0 truncate text-subtle">{snippet(editing || replyTo)}</p>
                </div>
                <button type="button" onClick={resetComposer} aria-label={editing ? 'Cancel editing' : 'Cancel reply'} className="flex size-[28px] items-center justify-center rounded-full text-[18px] text-muted hover:bg-soft hover:text-ink">×</button>
              </div>}
              <AttachmentTray items={attachments.items} onRemove={attachments.remove} />
              <div className="flex items-center gap-[12px]">
                <div className="flex h-[48px] min-w-0 flex-1 items-center gap-[6px] rounded-control border border-line pl-[19px] pr-[8px] focus-within:border-ink">
                  <input ref={input} value={draft} onChange={(e) => { stopAutoplay(); setDraft(e.target.value) }} placeholder={editing ? 'Edit your message…' : 'Write a message…'} aria-label={`Message ${current.name}`}
                    className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-subtle" />
                  <span data-composer-emoji className="relative flex">
                    <button ref={emojiButton} type="button" onClick={() => setComposerEmoji((open) => !open)} aria-label="Add emoji" aria-expanded={composerEmoji} title="Emoji" className="flex size-[32px] items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink">{ActionIcon.react}</button>
                    {composerEmoji && <Popover anchor={emojiButton.current} align="end" gap={12} data-composer-emoji><EmojiPanel label="Add an emoji" onPick={insertEmoji} /></Popover>}
                  </span>
                  {!editing && <AttachButtons onAdd={items => { stopAutoplay(); attachments.add(items) }} />}
                </div>
                <button type="submit" disabled={(currentId === 'joel-tan' && demo.messagePending) || (editing ? (!draft.trim() && !editing.files?.length) : (!draft.trim() && !attachments.items.length))} aria-label={editing ? 'Save edit' : 'Send'} className="flex size-[48px] shrink-0 items-center justify-center rounded-full bg-accent text-[16px] font-semibold text-on-accent transition-opacity hover:bg-accent-hover disabled:opacity-40">{editing ? '✓' : '↑'}</button>
              </div>
            </form>
          </section>
        </div>
      </main>

      {forwarding && <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-[20px]" onMouseDown={(e) => e.target === e.currentTarget && setForwarding(null)} onKeyDown={(e) => e.key === 'Escape' && setForwarding(null)}>
        <div role="dialog" aria-modal="true" aria-label="Forward message" className="flex max-h-[80vh] w-full max-w-[400px] animate-pop flex-col rounded-panel bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-divider px-[18px] py-[14px]">
            <h2 className="font-display m-0 text-[16px] font-semibold text-ink">Forward</h2>
            <button type="button" autoFocus onClick={() => setForwarding(null)} aria-label="Close" className="flex size-[30px] items-center justify-center rounded-full text-[20px] text-muted hover:bg-soft">×</button>
          </div>
          <p className="m-0 mx-[18px] mt-[12px] truncate rounded-card bg-soft px-[12px] py-[8px] text-[12px] text-muted">{snippet(forwarding)}</p>
          <ul className="m-0 mt-[8px] list-none overflow-y-auto p-0 pb-[10px]">
            {conversations.map((c) => <li key={c.id} className="flex items-center gap-[12px] px-[18px] py-[8px]">
              <Initials name={c.name} hue={c.hue} size={36} />
              <span className="flex-1 text-[13px] text-ink">{c.name}</span>
              <button type="button" disabled={forwardedTo.includes(c.id)} onClick={() => forwardTo(c)} className="rounded-control bg-accent px-[14px] py-[6px] text-[12px] font-semibold text-on-accent hover:bg-accent-hover disabled:bg-soft disabled:text-subtle">{forwardedTo.includes(c.id) ? 'Sent ✓' : 'Send'}</button>
            </li>)}
          </ul>
        </div>
      </div>}
      {confirm && <ConfirmDialog title={confirm.title} body={confirm.body} confirmLabel={confirm.label} onCancel={() => setConfirm(null)} onConfirm={() => { const run = confirm.action; setConfirm(null); run() }} />}
    </Page>
  )
}
