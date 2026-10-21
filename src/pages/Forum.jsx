import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { USER } from '@/data'
import { sessionGet, sessionSet } from '@/lib/session'
import { useSession, useSessionState } from '@/lib/useSession'
import { useToast } from '@/lib/toast'
import ForumSidebar from '@/features/forum/ForumSidebar'
import { AttachButtons, AttachmentTray, attachmentSummary, useAttachments } from '@/components/Attachments'
import { countComments, FORUM_CATEGORIES, FORUM_TOPICS, topicUrl, visibleTopics } from '@/features/forum/forumModel'

const categoryName = (id) => FORUM_CATEGORIES.find(item => item.id === id)?.label || 'All discussions'
const initialSaved = () => sessionGet('thread.battlebox.saved', false) ? ['battlebox'] : []
const commentCount = (topic) => countComments(topic.comments || [], sessionGet(`thread.${topic.id}.mine`, []))
const voteCount = (topic) => topic.votes + (sessionGet(`thread.${topic.id}.votes`, {}).post || 0)

export default function Forum({ category = 'all' }) {
  const { requireLogin } = useSession()
  const toast = useToast()
  const [customTopics] = useSessionState('forum.topics', [])
  const [saved, setSaved] = useSessionState('forum.saved', initialSaved)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const topics = visibleTopics([...FORUM_TOPICS, ...customTopics], category, query, saved)
  if (sort === 'popular') topics.sort((a, b) => voteCount(b) - voteCount(a))
  const toggleSaved = (id) => requireLogin(() => {
    const removing = saved.includes(id)
    setSaved(current => removing ? current.filter(item => item !== id) : [...current, id])
    toast(removing ? 'Removed from saved forums' : 'Saved to your forums')
  })

  return <Page active="forum">
    <div className="border-b border-line bg-surface px-[clamp(20px,4vw,60px)] py-[12px] text-[13px] text-muted"><Link to="/forum" className="hover:text-ink">Forum</Link>{category !== 'all' && <> / <span className="text-ink">{categoryName(category)}</span></>}</div>
    <div className="flex w-full gap-[24px] px-[clamp(20px,4vw,60px)] pb-[48px] pt-[24px] max-[780px]:flex-col">
      <ForumSidebar active={category}/>
      <main className="min-w-0 flex-1">
        <div className="flex flex-wrap items-end justify-between gap-[16px]"><div><h1 className="font-display m-0 text-[28px] font-semibold text-ink">{categoryName(category)}</h1><p className="m-0 mt-[5px] text-[13px] text-muted">Talk music. Meet the scene.</p></div><Link to="/forum/new" className="rounded-control bg-accent px-[18px] py-[10px] text-[13px] font-semibold text-on-accent hover:bg-accent-hover">Start discussion</Link></div>
        <div className="mt-[24px] flex flex-wrap gap-[12px] rounded-card border border-line bg-surface p-[12px]"><input type="search" aria-label="Search forum discussions" placeholder="Search discussions" value={query} onChange={event => setQuery(event.target.value)} className="min-w-[180px] flex-1 rounded-control border border-line px-[12px] py-[8px] text-[13px] outline-none focus:border-accent"/><label className="flex items-center gap-[8px] text-[13px] text-muted">Sort by <select aria-label="Sort discussions" value={sort} onChange={event => setSort(event.target.value)} className="rounded-control border border-line bg-surface px-[10px] py-[8px] text-ink"><option value="newest">Newest</option><option value="popular">Most popular</option></select></label></div>
        {topics.length ? <ul className="m-0 mt-[16px] flex list-none flex-col gap-[12px] p-0">{topics.map(topic => <li key={topic.id} className="rounded-card border border-line bg-surface p-[20px]"><div className="flex items-start justify-between gap-[12px]"><div className="min-w-0"><p className="m-0 text-[11px] font-semibold uppercase tracking-[.06em] text-accent">{categoryName(topic.category)} · {topic.ago || 'just now'}</p><h2 className="font-display m-0 mt-[6px] text-[18px] font-semibold text-ink"><Link to={topicUrl(topic)} className="hover:underline">{topic.title}</Link></h2><p className="m-0 mt-[6px] line-clamp-2 text-[13px] text-muted">{topic.body || attachmentSummary(topic.attachments)}</p></div><button type="button" aria-label={saved.includes(topic.id) ? `Remove ${topic.title} from saved forums` : `Save ${topic.title}`} aria-pressed={saved.includes(topic.id)} onClick={() => toggleSaved(topic.id)} className="shrink-0 rounded-full border border-line px-[10px] py-[6px] text-[13px] text-ink hover:bg-soft">{saved.includes(topic.id) ? 'Saved' : 'Save'}</button></div><div className="mt-[14px] flex gap-[16px] text-[12px] text-muted"><span>by {topic.author}</span><span>↑ {voteCount(topic)}</span><span>{commentCount(topic)} comments</span></div></li>)}</ul> : <div className="mt-[16px] rounded-card border border-line bg-surface p-[32px] text-center"><h2 className="font-display m-0 text-[18px] font-semibold">No discussions found</h2><p className="mt-[6px] text-[13px] text-muted">Try another category or search, or start a discussion.</p><Link to="/forum" className="mt-[12px] inline-block text-[13px] font-semibold text-accent hover:underline">All discussions</Link></div>}
      </main>
    </div>
  </Page>
}

export function NewForumTopic() {
  const navigate = useNavigate()
  const { requireLogin } = useSession()
  const [draft, setDraft] = useSessionState('forum.newDraft', { title: '', category: 'events', body: '' })
  const attachments = useAttachments()
  const submit = event => {
    event.preventDefault()
    if (!draft.title.trim() || (!draft.body.trim() && !attachments.items.length)) return
    requireLogin(() => {
      const topic = { id: `kit-${Date.now()}`, category: draft.category, title: draft.title.trim(), body: draft.body.trim(), attachments: attachments.items, author: USER.name, createdAt: Date.now(), ago: 'just now', votes: 0, comments: [] }
      sessionSet('forum.topics', [topic, ...sessionGet('forum.topics', [])])
      setDraft({ title: '', category: 'events', body: '' })
      attachments.clear()
      navigate(topicUrl(topic))
    })
  }
  return <Page active="forum"><main className="mx-auto w-full max-w-[760px] px-[20px] py-[32px]"><Link to="/forum" className="text-[13px] text-muted hover:text-ink">← All discussions</Link><h1 className="font-display mt-[20px] text-[28px] font-semibold">Start a discussion</h1><form onSubmit={submit} className="mt-[20px] grid gap-[18px] rounded-card border border-line bg-surface p-[24px]"><label className="grid gap-[6px] text-[13px] font-medium">Title<input required maxLength={120} value={draft.title} onChange={event => setDraft(value => ({ ...value, title: event.target.value }))} className="rounded-control border border-line px-[12px] py-[10px]" placeholder="What would you like to discuss?"/></label><label className="grid gap-[6px] text-[13px] font-medium">Category<select value={draft.category} onChange={event => setDraft(value => ({ ...value, category: event.target.value }))} className="rounded-control border border-line bg-surface px-[12px] py-[10px]">{FORUM_CATEGORIES.filter(item => !['all', 'saved'].includes(item.id)).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="grid gap-[6px] text-[13px] font-medium">Message<textarea required={!attachments.items.length} maxLength={2000} rows={7} value={draft.body} onChange={event => setDraft(value => ({ ...value, body: event.target.value }))} className="rounded-control border border-line px-[12px] py-[10px]" placeholder="Share a thought or ask the community"/></label><div className="grid gap-[10px]"><div className="flex items-center gap-[10px] text-[13px] font-medium">Attachments <span className="font-normal text-subtle">Photos, videos, files or a voice message (optional)</span><span className="ml-auto"><AttachButtons onAdd={attachments.add} guard={requireLogin} /></span></div><AttachmentTray items={attachments.items} onRemove={attachments.remove} /></div><div className="flex justify-end gap-[12px]"><Link to="/forum" className="rounded-control border border-line px-[18px] py-[9px] text-[13px]">Cancel</Link><button type="submit" className="rounded-control bg-accent px-[18px] py-[9px] text-[13px] font-semibold text-on-accent">Post discussion</button></div></form></main></Page>
}
