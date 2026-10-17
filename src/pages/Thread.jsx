// Forum thread "Playing the full synth set at BattleBox on Sunday".
//   /forum/battlebox          → 📸 15 (Figma 1431:1636)
//   /forum/battlebox/reply    → 📸 16 (Figma 1431:1727) Kit's reply typed in the composer
//   /forum/battlebox/replied  → 📸 17 (Figma 1431:1818) Kit's reply posted, with Edit / Delete
// Anyone can read the thread. Commenting, voting, saving and replying ask guests to log in;
// what you post (and your votes) is kept for this browser session.
import { useEffect, useState } from 'react'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { ROUTES, USER } from '@/data'
import { useShare, useToast } from '@/lib/toast'
import { useSession, useSessionState } from '@/lib/useSession'

const KIT_REPLY = 'Just discovered this artist. Not sure what to expect but I will give it a try!'

const SEED = [
  { id: 'synthkid', who: 'synthkid', ago: '1h ago', body: 'An analogue set in the bunker? This is going to sound unreal.', votes: 12,
    replies: [{ id: 'op', who: 'FallingIslands', badge: 'OP · ARTIST', ago: '45m ago', body: 'That’s the plan! Come say hi after the set.', votes: 8 }] },
  { id: 'nightbus', who: 'nightbus', ago: '32m ago', body: 'Been waiting to hear the full synth set live. See you on Sunday!', votes: 5 },
  { id: 'waveform', who: 'waveform', ago: '10m ago', body: 'What synths are you bringing? Would love a closer look at the rig after the set.', votes: 3 },
]

const SIDEBAR = ['All discussions', 'Events & Shows', 'Artists & bands', 'Gear & production', 'Saved forums']

export default function Thread({ state }) {
  const toast = useToast()
  const share = useShare()
  const { requireLogin } = useSession()
  const [draft, setDraft] = useSessionState('thread.battlebox.draft', '')
  const [mine, setMine] = useSessionState('thread.battlebox.mine', []) // your comments, newest first
  const [votes, setVotes] = useSessionState('thread.battlebox.votes', {}) // id → +1 / -1
  const [saved, setSaved] = useSessionState('thread.battlebox.saved', false)
  const [category, setCategory] = useState('Events & Shows')

  // the Figma states: /reply opens with Kit's reply typed in, /replied with it posted
  useEffect(() => {
    if (state === 'typing' && !draft) setDraft(KIT_REPLY)
    if (state === 'replied' && !mine.length) setMine([{ id: 'kit-1', body: KIT_REPLY }])
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const postVote = votes.post || 0
  const count = SEED.length + 1 + mine.length
  const vote = (id, dir) => requireLogin(() => setVotes((v) => ({ ...v, [id]: v[id] === dir ? 0 : dir })))
  const reply = (who) => requireLogin(() => setDraft(`@${who} `))
  const submit = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    // a guest's draft is kept (session) while they log in, then they post it
    requireLogin(() => {
      setMine((m) => [{ id: `kit-${Date.now()}`, body: draft.trim() }, ...m])
      setDraft('')
    })
  }

  const pill = 'flex h-[32px] items-center gap-[8px] rounded-[20px] border border-subtle bg-divider px-[10px] text-[16px] leading-none text-ink'
  const outline = 'flex h-[34px] items-center gap-[8px] rounded-[999px] border border-[#232323] px-[11px] text-[16px] leading-none text-ink hover:bg-soft'

  return (
    <Page active="forum">
      {/* breadcrumb */}
      <div className="h-[45px] border-b border-line bg-white">
        <nav aria-label="Breadcrumb" className="flex h-full items-center gap-[8px] px-[24px] text-[14px] leading-[20px] text-muted">
          <Link to={ROUTES.thread} className="flex items-center gap-[6px] hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M8.5 3.5L5.5 7L8.5 10.5" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round" /></svg>Forum
          </Link>
          <span className="text-line">/</span>
          <Link to={ROUTES.thread} className="hover:text-ink">Events &amp; Shows</Link>
          <span className="text-line">/</span>
          <span className="font-medium text-ink" aria-current="page">BattleBox 2026</span>
        </nav>
      </div>

      <div className="flex w-full gap-[24px] px-[clamp(20px,4vw,60px)] pb-[48px] pt-[24px]">
        {/* left sidebar */}
        <aside className="w-[184px] shrink-0">
          <p className="m-0 text-[11px] leading-[16px] font-semibold text-muted">COMMUNITY</p>
          <ul className="m-0 mt-[16px] flex list-none flex-col gap-[16px] p-0">
            {SIDEBAR.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => setCategory(s)}
                  className={`h-[32px] rounded-[20px] px-[7px] text-[16px] leading-none ${category === s ? 'border border-accent bg-accent-tint text-accent' : 'text-ink hover:bg-soft'}`}>{s}</button>
              </li>
            ))}
          </ul>
          <div className="mt-[16px] rounded-[12px] bg-soft p-[16px]">
            <p className="m-0 text-[11px] leading-[16px] font-semibold text-muted">BATTLEBOX 2026</p>
            <p className="m-0 mt-[8px] text-[18px] leading-[26px] font-semibold text-ink">From the stage<br />to the thread.</p>
            <p className="m-0 mt-[8px] text-[12px] leading-[17px] text-muted">Talk music. Meet the scene.</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-[16px]">
          {/* original post */}
          <article className="rounded-[12px] border border-line bg-white p-[23px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-[8px]">
                <span className="size-[40px] rounded-full bg-soft" />
                <div>
                  <div className="flex items-center gap-[8px]">
                    <Link to={ROUTES.artist} className="text-[14px] leading-[20px] font-semibold text-black hover:underline">FallingIslands</Link>
                    <span className="rounded-[20px] bg-[#cb30e0] px-[16px] py-[4px] text-[11px] leading-[16px] font-semibold text-white">ARTIST</span>
                  </div>
                  <p className="m-0 text-[12px] leading-[17px] text-muted">2h ago · Events &amp; Shows</p>
                </div>
              </div>
              <Link to={ROUTES.event} className="mt-[8px] rounded-[20px] border border-ink bg-white px-[9px] py-[3px] text-[11px] leading-[16px] font-semibold text-ink hover:bg-ink hover:text-white">RETURN TO EVENT PAGE</Link>
            </div>
            <h1 className="m-0 mt-[16px] text-[26px] leading-[38px] font-bold text-ink">Playing the full synth set at BattleBox on Sunday</h1>
            <p className="m-0 mt-[2px] text-[16px] leading-[23px] text-muted">We’re bringing the analogue rig down into the bunker. Come say hi after the set.</p>
            <div className="mt-[20px] flex items-center gap-[8px]">
              <span className={pill}>
                <button type="button" aria-label="Upvote" aria-pressed={postVote === 1} onClick={() => vote('post', 1)} className={postVote === 1 ? 'text-brand' : 'hover:text-brand'}>↑</button>
                {24 + postVote}
                <button type="button" aria-label="Downvote" aria-pressed={postVote === -1} onClick={() => vote('post', -1)} className={postVote === -1 ? 'text-accent' : 'hover:text-accent'}>↓</button>
              </span>
              <a href="#discussion" className={pill}>{count} comments</a>
              <button type="button" onClick={() => share('Playing the full synth set at BattleBox on Sunday')} className={outline}>↗ Share</button>
              <button type="button" aria-pressed={saved} onClick={() => requireLogin(() => { setSaved(!saved); toast(saved ? 'Removed from saved forums' : 'Saved to your forums') })} className={outline}>
                <svg width="10" height="13" viewBox="0 0 10 13" fill={saved ? '#232323' : 'none'} aria-hidden="true"><path d="M1.6 1.6H8.4V11.4L5 8.6L1.6 11.4Z" stroke="#232323" strokeWidth="1.25" strokeLinejoin="round" /></svg>
                {saved ? 'Saved' : 'Save'}
              </button>
              <Link to={ROUTES.thanks} className="ml-auto flex h-[36px] items-center rounded-[999px] bg-ink px-[19px] text-[13px] leading-[16px] font-semibold text-white hover:bg-black">BUY TICKETS</Link>
            </div>
          </article>

          {/* discussion */}
          <section id="discussion" className="rounded-[12px] border border-line bg-white p-[23px] pt-[18px]">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[18px] leading-[26px] font-semibold text-ink">Discussion · {count} comments</h2>
              <span className="text-[16px] leading-none text-ink">Sort: Best ⌄</span>
            </div>

            <form onSubmit={submit} className="mt-[11px] flex h-[56px] items-center gap-[10px] rounded-[12px] border border-line bg-white pl-[15px] pr-[16px] focus-within:border-accent">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Join the conversation…" aria-label="Write a comment" autoFocus={state === 'typing'}
                className="min-w-0 flex-1 bg-transparent text-[14px] leading-[20px] text-ink outline-none placeholder:text-muted" />
              <button type="submit" disabled={!draft.trim()} className="h-[32px] rounded-[20px] border border-accent bg-accent px-[12px] text-[16px] leading-none text-soft disabled:border-divider disabled:bg-divider disabled:text-subtle">Comment</button>
            </form>

            <ul className="m-0 mt-[8px] flex list-none flex-col gap-[16px] p-0">
              {mine.map((m) => (
                <li key={m.id} className="animate-pop rounded-[8px] border border-accent-tint bg-accent-tint px-[8px] py-[4px]">
                  <Comment who={USER.name} ago="just now" body={m.body} votes={votes[m.id] || 0} myVote={votes[m.id]} onVote={(d) => vote(m.id, d)} onReply={() => reply(USER.firstName)}>
                    <button type="button" onClick={() => { setDraft(m.body); setMine((all) => all.filter((x) => x.id !== m.id)) }} className="hover:underline">Edit</button>
                    <button type="button" onClick={() => { setMine((all) => all.filter((x) => x.id !== m.id)); toast('Your comment was deleted') }} className="hover:underline">Delete</button>
                  </Comment>
                </li>
              ))}
              {SEED.map((c) => (
                <li key={c.id}>
                  <Comment who={c.who} ago={c.ago} body={c.body} votes={c.votes + (votes[c.id] || 0)} myVote={votes[c.id]} onVote={(d) => vote(c.id, d)} onReply={() => reply(c.who)} />
                  {c.replies?.map((r) => (
                    <div key={r.id} className="ml-[0px] mt-[8px] border-l border-line pl-[23px]">
                      <Comment who={r.who} badge={r.badge} ago={r.ago} body={r.body} votes={r.votes + (votes[r.id] || 0)} myVote={votes[r.id]} onVote={(d) => vote(r.id, d)} onReply={() => reply(r.who)} />
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* right column: the event this thread is about, and more to read */}
        <aside className="hidden w-[300px] shrink-0 flex-col gap-[16px] min-[1200px]:flex">
          <Link to={ROUTES.event} className="group overflow-hidden rounded-[12px] border border-line bg-white">
            <img src="/assets/img/figma/eventHero.jpg" alt="" className="h-[120px] w-full object-cover" />
            <div className="p-[16px]">
              <p className="m-0 text-[11px] font-semibold tracking-[0.06em] text-subtle">THE EVENT</p>
              <p className="m-0 mt-[4px] text-[15px] font-semibold text-ink group-hover:underline">FallingIslands @ BattleBox Fort Canning</p>
              <p className="m-0 mt-[2px] text-[12px] text-muted">2 Cox Terrace · Doors 7:30 PM</p>
              <span className="mt-[12px] flex h-[36px] items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white">See event details</span>
            </div>
          </Link>
          <section className="rounded-[12px] border border-line bg-white p-[16px]">
            <p className="m-0 text-[11px] font-semibold tracking-[0.06em] text-subtle">MORE IN EVENTS &amp; SHOWS</p>
            <ul className="m-0 mt-[8px] list-none divide-y divide-divider p-0">
              {[['Who else is going to Gamelan on the Lawn?', '6 replies'], ['Best local R&B artists?', '14 replies'], ['Lullaboy live at BattleBox — setlist guesses', '9 replies'], ['Late Transmission: worth the trip?', '3 replies']].map(([t, n]) => (
                <li key={t} className="py-[10px]">
                  <p className="m-0 text-[13px] font-medium leading-[1.35] text-ink">{t}</p>
                  <p className="m-0 mt-[2px] text-[11px] text-subtle">{n}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Page>
  )
}

function Comment({ who, badge, ago, body, votes, myVote, onVote, onReply, children }) {
  return (
    <div>
      <p className="m-0 text-[12px] leading-[17px] font-semibold whitespace-pre text-ink">{who}{badge ? `  ·  ${badge}` : ''}  ·  {ago}</p>
      <p className="m-0 mt-[4px] text-[14px] leading-[20px] text-ink">{body}</p>
      <div className="mt-[12px] flex items-center gap-[14px] pl-[8px] text-[12px] leading-[16px] text-ink">
        <span className="flex items-center gap-[8px]">
          <button type="button" aria-label="Upvote" aria-pressed={myVote === 1} onClick={() => onVote(1)} className={myVote === 1 ? 'text-brand' : 'hover:text-brand'}>↑</button>
          {votes}
          <button type="button" aria-label="Downvote" aria-pressed={myVote === -1} onClick={() => onVote(-1)} className={myVote === -1 ? 'text-accent' : 'hover:text-accent'}>↓</button>
        </span>
        <button type="button" onClick={onReply} className="hover:underline">Reply</button>
        {children}
      </div>
    </div>
  )
}
