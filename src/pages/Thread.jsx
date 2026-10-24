// Forum thread "Playing the full synth set at BattleBox on 11 December".
//   /forum/battlebox          → 📸 15 (Figma 1431:1636)
//   /forum/battlebox/reply    → 📸 16 (Figma 1431:1727) Kit's reply typed in the composer
//   /forum/battlebox/replied  → 📸 17 (Figma 1431:1818) Kit's reply posted, with Edit / Delete
// Anyone can read the thread. Commenting, voting, saving and replying ask guests to log in;
// what you post (and your votes) is kept for this browser session.
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { ROUTES, USER } from '@/data'
import { featuredArtistAvatar } from '@/lib/featuredArtist'
import { useShare, useToast } from '@/lib/toast'
import { useSession, useSessionState } from '@/lib/useSession'
import { sessionGet, sessionSet } from '@/lib/session'
import ForumSidebar from '@/features/forum/ForumSidebar'
import { countComments, FORUM_CATEGORIES, FORUM_TOPICS, sortComments, topicUrl } from '@/features/forum/forumModel'
import { coverUrl } from '@/features/events/react/EventParts'
import { eventUrl } from '@/features/events/react/eventModel'
import { AttachButtons, AttachmentList, AttachmentTray, useAttachments } from '@/components/Attachments'
import ConfirmDialog from '@/components/ConfirmDialog'

const KIT_REPLY = 'Just discovered this artist. Not sure what to expect but I will give it a try!'

export function ForumTopicRoute() {
  const { topicId } = useParams()
  return <Thread key={topicId} topicId={topicId} />
}

export default function Thread({ state, topicId = 'battlebox' }) {
  const toast = useToast()
  const share = useShare()
  const { requireLogin } = useSession()
  const navigate = useNavigate()
  const [customTopics, setCustomTopics] = useSessionState('forum.topics', [])
  const topic = [...FORUM_TOPICS, ...customTopics].find(item => item.id === topicId)
  const ownPost = customTopics.some(item => item.id === topicId) // posts Kit started can be edited or deleted
  const [draft, setDraft] = useSessionState(`thread.${topicId}.draft`, '')
  const [mine, setMine] = useSessionState(`thread.${topicId}.mine`, [])
  const [votes, setVotes] = useSessionState(`thread.${topicId}.votes`, {})
  const [savedIds, setSavedIds] = useSessionState('forum.saved', () => sessionGet('thread.battlebox.saved', false) ? ['battlebox'] : [])
  const [sort, setSort] = useState('best')
  const [editingId, setEditingId] = useState(null)
  const attachments = useAttachments()
  const composer = useRef(null)
  const [postEdit, setPostEdit] = useState(null) // { title, body, kept: [attachments] } while editing the post
  const postFiles = useAttachments()
  const [confirm, setConfirm] = useState(null) // { title, body, label, action }

  // the Figma states: /reply opens with Kit's reply typed in, /replied with it posted
  useEffect(() => {
    if (topicId === 'battlebox' && state === 'typing' && !draft) setDraft(KIT_REPLY)
    if (topicId === 'battlebox' && state === 'replied' && !mine.length && !sessionGet('thread.battlebox.demoReplied', false)) {
      setMine([{ id: 'kit-1', body: KIT_REPLY }])
      sessionSet('thread.battlebox.demoReplied', true)
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const postVote = votes.post || 0
  const count = countComments(topic?.comments || [], mine)
  const comments = sortComments([...(topic?.comments || []), ...mine.map(item => ({ ...item, who: USER.name, ago: 'just now', minutesAgo: 0, votes: 0, mine: true }))], sort, votes)
  const saved = savedIds.includes(topicId)
  const category = FORUM_CATEGORIES.find(item => item.id === topic?.category)
  const related = FORUM_TOPICS.filter(item => item.id !== topicId && item.category === topic?.category).slice(0, 4)
  const vote = (id, dir) => requireLogin(() => setVotes((v) => ({ ...v, [id]: v[id] === dir ? 0 : dir })))
  const reply = (who) => requireLogin(() => { setEditingId(null); setDraft(`@${who} `); composer.current?.focus(); composer.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) })
  const edit = (comment) => { setEditingId(comment.id); setDraft(comment.body); composer.current?.focus(); composer.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
  const toggleSaved = () => requireLogin(() => { setSavedIds(items => saved ? items.filter(id => id !== topicId) : [...items, topicId]); toast(saved ? 'Removed from saved forums' : 'Saved to your forums') })
  const submit = (e) => {
    e.preventDefault()
    const files = attachments.items
    if (!draft.trim() && !files.length) return
    // a guest's draft is kept (session) while they log in, then they post it
    requireLogin(() => {
      setMine((items) => editingId
        ? items.map(item => item.id === editingId ? { ...item, body: draft.trim(), attachments: [...(item.attachments || []), ...files] } : item)
        : [{ id: `kit-${Date.now()}`, body: draft.trim(), attachments: files }, ...items])
      setDraft('')
      setEditingId(null)
      attachments.clear()
    })
  }

  const startPostEdit = () => { postFiles.clear(); setPostEdit({ title: topic.title, body: topic.body || '', kept: topic.attachments || [] }) }
  const savePost = (event) => {
    event.preventDefault()
    const title = postEdit.title.trim()
    const files = [...postEdit.kept, ...postFiles.items]
    if (!title) { toast('Add a title'); return }
    if (!postEdit.body.trim() && !files.length) { toast('Write a message or add an attachment'); return }
    setCustomTopics(list => list.map(item => item.id === topicId ? { ...item, title, body: postEdit.body.trim(), attachments: files, edited: true } : item))
    setPostEdit(null)
    postFiles.clear()
    toast('Your discussion was updated')
  }
  const deletePost = () => setConfirm({
    title: 'Delete this discussion?', body: 'Your post and its comments will be removed. This can’t be undone.', label: 'Delete',
    action: () => {
      setCustomTopics(list => list.filter(item => item.id !== topicId))
      setSavedIds(items => items.filter(id => id !== topicId))
      sessionSet(`thread.${topicId}.mine`, [])
      toast('Your discussion was deleted')
      navigate('/forum')
    },
  })
  const deleteComment = (comment) => setConfirm({
    title: 'Delete this comment?', body: 'This can’t be undone.', label: 'Delete',
    action: () => { setMine(all => all.filter(item => item.id !== comment.id)); if (editingId === comment.id) { setEditingId(null); setDraft('') }; toast('Your comment was deleted') },
  })

  const pill = 'flex h-[32px] items-center gap-[8px] rounded-[20px] border border-subtle bg-divider px-[10px] text-[16px] leading-none text-ink'
  const outline = 'flex h-[34px] items-center gap-[8px] rounded-[999px] border border-line px-[11px] text-[16px] leading-none text-ink hover:bg-soft'

  if (!topic) return <Page active="forum"><main className="mx-auto w-full max-w-[720px] p-[32px]"><h1 className="font-display text-[24px] font-semibold">Discussion not found</h1><Link to="/forum" className="mt-[12px] inline-block text-accent">Back to all discussions</Link></main></Page>

  return (
    <Page active="forum">
      {/* breadcrumb */}
      <div className="h-[45px] border-b border-line bg-surface">
        <nav aria-label="Breadcrumb" className="flex h-full items-center gap-[8px] px-[24px] text-[14px] leading-[20px] text-muted">
          <Link to="/forum" className="flex items-center gap-[6px] hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M8.5 3.5L5.5 7L8.5 10.5" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round" /></svg>Forum
          </Link>
          <span className="text-line">/</span>
          <Link to={category?.path || '/forum'} className="hover:text-ink">{category?.label}</Link>
          <span className="text-line">/</span>
          <span className="font-medium text-ink" aria-current="page">{topic.title}</span>
        </nav>
      </div>

      <div className="flex w-full gap-[24px] px-[clamp(20px,4vw,60px)] pb-[48px] pt-[24px] max-[780px]:flex-col">
        {/* left sidebar */}
        <ForumSidebar active={topic.category}/>

        <div className="flex min-w-0 flex-1 flex-col gap-[16px]">
          {/* original post */}
          <article className="rounded-card border border-line bg-surface p-[23px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-[8px]">
                {featuredArtistAvatar(topic.author) ? <img src={featuredArtistAvatar(topic.author)} alt="" className="size-[40px] rounded-full object-cover" /> : <span className="size-[40px] rounded-full bg-soft" />}
                <div>
                  <div className="flex items-center gap-[8px]">
                    {topic.authorArtist ? <Link to={ROUTES.artist} className="text-[14px] leading-[20px] font-semibold text-ink hover:underline">{topic.author}</Link> : <span className="text-[14px] leading-[20px] font-semibold text-ink">{topic.author}</span>}
                    {topic.authorArtist && <span className="rounded-[20px] bg-accent px-[16px] py-[4px] text-[11px] leading-[16px] font-semibold text-white">ARTIST</span>}
                  </div>
                  <p className="m-0 text-[12px] leading-[17px] text-muted">{topic.ago} · {category?.label}{topic.edited ? ' · Edited' : ''}</p>
                </div>
              </div>
              {topic.eventId && <Link to={eventUrl(topic.eventId)} className="mt-[8px] rounded-control border border-ink bg-surface px-[9px] py-[3px] text-[11px] leading-[16px] font-semibold text-ink hover:bg-soft">RETURN TO EVENT PAGE</Link>}
              {ownPost && !postEdit && <div className="flex gap-[8px]">
                <button type="button" onClick={startPostEdit} className="rounded-control border border-line px-[12px] py-[5px] text-[12px] font-semibold text-ink hover:bg-soft">Edit</button>
                <button type="button" onClick={deletePost} className="rounded-control border border-line px-[12px] py-[5px] text-[12px] font-semibold text-danger hover:bg-danger/10">Delete</button>
              </div>}
            </div>
            {postEdit ? <form onSubmit={savePost} className="mt-[16px] grid gap-[12px]" aria-label="Edit your discussion">
              <input value={postEdit.title} maxLength={120} onChange={(e) => setPostEdit(p => ({ ...p, title: e.target.value }))} aria-label="Title" className="rounded-control border border-line px-[12px] py-[10px] text-[20px] font-bold text-ink outline-none focus:border-accent" />
              <textarea value={postEdit.body} maxLength={2000} rows={5} onChange={(e) => setPostEdit(p => ({ ...p, body: e.target.value }))} aria-label="Message" placeholder="Share a thought or ask the community" className="rounded-control border border-line px-[12px] py-[10px] text-[15px] text-ink outline-none focus:border-accent" />
              <AttachmentTray items={[...postEdit.kept, ...postFiles.items]} onRemove={(id) => postEdit.kept.some(item => item.id === id) ? setPostEdit(p => ({ ...p, kept: p.kept.filter(item => item.id !== id) })) : postFiles.remove(id)} />
              <div className="flex items-center gap-[10px]">
                <AttachButtons onAdd={postFiles.add} guard={requireLogin} />
                <button type="button" onClick={() => { setPostEdit(null); postFiles.clear() }} className="ml-auto rounded-control border border-line px-[16px] py-[8px] text-[13px] font-semibold text-ink hover:bg-soft">Cancel</button>
                <button type="submit" className="rounded-control bg-accent px-[16px] py-[8px] text-[13px] font-semibold text-on-accent hover:bg-accent-hover">Save changes</button>
              </div>
            </form> : <>
              <h1 className="font-display m-0 mt-[16px] text-[26px] leading-[38px] font-bold text-ink">{topic.title}</h1>
              {topic.body && <p className="m-0 mt-[2px] whitespace-pre-line text-[16px] leading-[23px] text-muted">{topic.body}</p>}
              {topic.attachments?.length > 0 && <div className="mt-[12px]"><AttachmentList items={topic.attachments} /></div>}
            </>}
            <div className="mt-[20px] flex items-center gap-[8px]">
              <span className={pill}>
                <button type="button" aria-label="Upvote" aria-pressed={postVote === 1} onClick={() => vote('post', 1)} className={postVote === 1 ? 'text-brand' : 'hover:text-brand'}>↑</button>
                {topic.votes + postVote}
                <button type="button" aria-label="Downvote" aria-pressed={postVote === -1} onClick={() => vote('post', -1)} className={postVote === -1 ? 'text-accent' : 'hover:text-accent'}>↓</button>
              </span>
              <a href="#discussion" className={pill}>{count} comments</a>
              <button type="button" onClick={() => share(topic.title)} className={outline}>↗ Share</button>
              <button type="button" aria-pressed={saved} onClick={toggleSaved} className={outline}>
                <svg width="10" height="13" viewBox="0 0 10 13" fill={saved ? 'var(--lrm-raw-232323)' : 'none'} aria-hidden="true"><path d="M1.6 1.6H8.4V11.4L5 8.6L1.6 11.4Z" stroke="var(--lrm-raw-232323)" strokeWidth="1.25" strokeLinejoin="round" /></svg>
                {saved ? 'Saved' : 'Save'}
              </button>
              {topic.eventId && <Link to={topicId === 'battlebox' ? ROUTES.thanks : eventUrl(topic.eventId)} className="ml-auto flex h-[36px] items-center rounded-control bg-accent px-[19px] text-[13px] leading-[16px] font-semibold text-on-accent hover:bg-accent-hover">{topicId === 'battlebox' ? 'Get tickets' : 'VIEW EVENT'}</Link>}
            </div>
          </article>

          {/* discussion */}
          <section id="discussion" className="rounded-card border border-line bg-surface p-[23px] pt-[18px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display m-0 text-[18px] leading-[26px] font-semibold text-ink">Discussion · {count} comments</h2>
              <label className="flex items-center gap-[6px] text-[13px] text-ink">Sort: <select aria-label="Sort comments" value={sort} onChange={event => setSort(event.target.value)} className="rounded-control border border-line bg-surface px-[7px] py-[5px]"><option value="best">Best</option><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label>
            </div>

            <form onSubmit={submit} className="mt-[11px] rounded-card border border-line bg-surface focus-within:border-accent">
              {attachments.items.length > 0 && <div className="px-[15px] pt-[14px]"><AttachmentTray items={attachments.items} onRemove={attachments.remove} /></div>}
              <div className="flex h-[56px] items-center gap-[10px] pl-[15px] pr-[16px]">
                <input ref={composer} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Join the conversation…" aria-label="Write a comment" autoFocus={state === 'typing'}
                  className="min-w-0 flex-1 bg-transparent text-[14px] leading-[20px] text-ink outline-none placeholder:text-muted" />
                <AttachButtons onAdd={attachments.add} guard={requireLogin} />
                {editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(''); attachments.clear() }} className="text-[12px] text-muted hover:underline">Cancel edit</button>}
                <button type="submit" disabled={!draft.trim() && !attachments.items.length} className="h-[32px] rounded-control border border-accent bg-accent px-[12px] text-[16px] leading-none text-on-accent disabled:border-divider disabled:bg-divider disabled:text-subtle">{editingId ? 'Save edit' : 'Comment'}</button>
              </div>
            </form>

            <ul className="m-0 mt-[8px] flex list-none flex-col gap-[16px] p-0">
              {comments.map((c) => (
                <li key={c.id} className={c.mine ? 'animate-pop rounded-control border border-accent-tint bg-accent-tint px-[8px] py-[4px]' : ''}>
                  <Comment who={c.who} ago={c.ago} body={c.body} attachments={c.attachments} votes={c.votes + (votes[c.id] || 0)} myVote={votes[c.id]} onVote={(d) => vote(c.id, d)} onReply={() => reply(c.who)}>
                    {c.mine && <><button type="button" onClick={() => edit(c)} className="hover:underline">Edit</button><button type="button" onClick={() => deleteComment(c)} className="hover:underline">Delete</button></>}
                  </Comment>
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
          {topic.eventId && <Link to={eventUrl(topic.eventId)} className="group overflow-hidden rounded-card border border-line bg-surface">
            <img src={topic.eventId === 'fallingislands-battlebox' ? '/assets/img/figma/eventHero.jpg' : coverUrl({ id: topic.eventId })} alt="" className="h-[120px] w-full object-cover" />
            <div className="p-[16px]">
              <p className="m-0 text-[11px] font-semibold tracking-[0.06em] text-subtle">THE EVENT</p>
              <p className="m-0 mt-[4px] text-[15px] font-semibold text-ink group-hover:underline">{topic.title}</p>
              <p className="m-0 mt-[2px] text-[12px] text-muted">See the event map, details and tickets</p>
              <span className="mt-[12px] flex h-[36px] items-center justify-center rounded-control bg-accent text-[13px] font-semibold text-on-accent">See event details</span>
            </div>
          </Link>}
          <section className="rounded-card border border-line bg-surface p-[16px]">
            <p className="m-0 text-[11px] font-semibold tracking-[0.06em] text-subtle">MORE IN {category?.label.toUpperCase()}</p>
            <ul className="m-0 mt-[8px] list-none divide-y divide-divider p-0">
              {related.map((item) => (
                <li key={item.id} className="py-[10px]">
                  <Link to={topicUrl(item)} className="text-[13px] font-medium leading-[1.35] text-ink hover:underline">{item.title}</Link>
                  <p className="m-0 mt-[2px] text-[11px] text-subtle">{countComments(item.comments, sessionGet(`thread.${item.id}.mine`, []))} replies</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
      {confirm && <ConfirmDialog title={confirm.title} body={confirm.body} confirmLabel={confirm.label} onCancel={() => setConfirm(null)} onConfirm={() => { const run = confirm.action; setConfirm(null); run() }} />}
    </Page>
  )
}

function Comment({ who, badge, ago, body, attachments, votes, myVote, onVote, onReply, children }) {
  return (
    <div>
      <p className="m-0 text-[12px] leading-[17px] font-semibold whitespace-pre text-ink">{who}{badge ? `  ·  ${badge}` : ''}  ·  {ago}</p>
      {body && <p className="m-0 mt-[4px] text-[14px] leading-[20px] text-ink">{body}</p>}
      {attachments?.length > 0 && <div className="mt-[8px]"><AttachmentList items={attachments} /></div>}
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
