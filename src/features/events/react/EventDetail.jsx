import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { ROUTES } from '@/data'
import { useSession } from '@/lib/useSession'
import { sessionGet, sessionSet } from '@/lib/session'
import { useShare } from '@/lib/toast'
import { fetchDiscussion } from '../services/eventsService'
import { dayLabel, dayLabelYear } from '../utils/date'
import { formatDistance, mapsDirectionsUrl, mapsSearchUrl } from '../utils/geo'
import { Avatar, coverUrl, Friends, SaveButton } from './EventParts'
import { useEvents } from './EventsContext'
import { FORUM_TOPICS, topicUrl } from '@/features/forum/forumModel'

function Discussion({ eventId }) {
  const { user } = useEvents()
  const { requireLogin } = useSession()
  const key = (name) => `event.${eventId}.${name}`
  const [comments, setComments] = useState([])
  const [draft, setDraft] = useState(() => sessionGet(key('draft'), ''))
  const [voted, setVoted] = useState(() => new Set(sessionGet(key('voted'), [])))
  const [loading, setLoading] = useState(true)
  const [composerOpen, setComposerOpen] = useState(false)
  const forumTopic = FORUM_TOPICS.find((topic) => topic.eventId === eventId)
  useEffect(() => {
    let live = true
    setLoading(true)
    setDraft(sessionGet(key('draft'), ''))
    setVoted(new Set(sessionGet(key('voted'), [])))
    fetchDiscussion().then((seed) => {
      if (!live) return
      const votes = sessionGet(key('votes'), {})
      setComments([...seed, ...sessionGet(key('mine'), [])].map((comment) => ({ ...comment, votes: comment.votes + (votes[comment.id] || 0) })))
      setLoading(false)
    })
    return () => { live = false }
  }, [eventId])

  const post = (submitEvent) => {
    submitEvent.preventDefault()
    const text = draft.trim()
    if (!text) return
    sessionSet(key('draft'), draft)
    requireLogin(() => {
      const comment = { id: `local-${Date.now()}`, author: user.name, hue: 330, minutesAgo: 0, text, votes: 0, mine: true }
      setComments((old) => {
        const next = [...old, comment]
        sessionSet(key('mine'), next.filter((item) => item.mine).map((item) => ({ ...item, votes: 0 })))
        return next
      })
      setDraft('')
      setComposerOpen(false)
      sessionSet(key('draft'), '')
    })
  }
  const vote = (comment) => requireLogin(() => {
    const next = new Set(voted)
    const change = next.has(comment.id) ? -1 : 1
    if (change < 0) next.delete(comment.id)
    else next.add(comment.id)
    setVoted(next)
    setComments((old) => old.map((item) => item.id === comment.id ? { ...item, votes: item.votes + change } : item))
    sessionSet(key('voted'), [...next])
    sessionSet(key('votes'), Object.fromEntries([...next].map((id) => [id, 1])))
  })
  const ago = (minutes) => minutes < 1 ? 'just now' : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.round(minutes / 60)}h ago` : `${Math.round(minutes / 1440)}d ago`
  const reply = (comment) => {
    const next = `@${comment.author} `
    setDraft(next)
    sessionSet(key('draft'), next)
    setComposerOpen(true)
  }

  return <section className="event-detail__section event-discussion">
    <div className="event-discussion__heading"><h2>Discussions</h2><span>{loading ? 'Loading…' : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}</span></div>
    {loading ? <p role="status">Loading discussion…</p> : <ul>{comments.map((comment) => <li key={comment.id}><Avatar name={comment.author} hue={comment.hue} size={26} /><div><p className="event-discussion__byline"><strong>{comment.author}</strong><span>· {ago(comment.minutesAgo)}</span></p><p className="event-discussion__text">{comment.text}</p><div className="event-discussion__controls"><button type="button" aria-label={`${voted.has(comment.id) ? 'Remove like from' : 'Like'} ${comment.author}'s comment`} aria-pressed={voted.has(comment.id)} onClick={() => vote(comment)}>♥ {comment.votes}</button><span>·</span><button type="button" onClick={() => reply(comment)}>Reply</button></div></div></li>)}</ul>}
    <div className="event-discussion__footer"><button type="button" onClick={() => setComposerOpen((open) => !open)}>{composerOpen ? 'Cancel comment' : 'Add a comment'}</button><Link to={forumTopic ? topicUrl(forumTopic) : '/forum/events'}>Open the full thread in Forum →</Link></div>
    {composerOpen && <form onSubmit={post}><Avatar name={user.name} hue={340} size={30} /><input autoFocus type="text" value={draft} placeholder="Join the conversation…" aria-label="Write a comment" onChange={(event) => { setDraft(event.target.value); sessionSet(key('draft'), event.target.value) }} /><button type="submit" disabled={!draft.trim()}>Comment</button></form>}
  </section>
}

export default function EventDetail() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { events, loading } = useEvents()
  const share = useShare()
  const event = events.find((item) => item.id === id)
  const discussions = pathname.endsWith('/discussions')
  const [showAttendees, setShowAttendees] = useState(false)
  useEffect(() => setShowAttendees(false), [id])
  const moreAtVenue = useMemo(() => event ? events.filter((item) => item.venueId === event.venueId && item.id !== id && item.dayOffset >= 0).sort((a, b) => a.startsAt - b.startsAt).slice(0, 3) : [], [events, event, id])
  const back = () => navigate(ROUTES.eventsMap)
  if (loading) return <Page active="events" className="react-events"><main className="event-detail__state" role="status">Loading event…</main></Page>
  if (!event) return <Page active="events" className="react-events"><main className="event-detail__state"><h1>We couldn't find that event</h1><p>It may have ended or the link is out of date.</p><button type="button" onClick={back}>Back to Events</button></main></Page>

  const tiles = [
    ['Date & time', `${dayLabelYear(event.startsAt)} · ${event.timeLabel}`],
    ['Set times', event.setTimes.map((set) => `${set.artist.name} ${set.time}`).join(' · ')],
    ['Doors', `${event.doorsLabel} · First set ${event.timeLabel}`],
    ['Entry', event.entry],
    ['Venue', `${event.venue.address} · ${formatDistance(event.distanceKm)}`, { label: 'View on map', url: mapsSearchUrl(event.venue) }],
    ['Getting there', event.venue.transit, { label: 'Plan route', url: mapsDirectionsUrl(event.venue) }],
  ]
  const friendNames = event.friends.map((friend) => friend.name)
  const friendSentence = friendNames.length ? `${friendNames.length === 1 ? friendNames[0] : `${friendNames.slice(0, -1).join(', ')} and ${friendNames.at(-1)}`} ${friendNames.length === 1 ? 'is' : 'are'} going` : 'None of your friends are going yet'

  return <Page active="events" className="react-events"><main className="event-detail">
    <section className="event-detail__hero" style={{ '--event-genre': event.genre.hex }}>
      <img className={event.id === 'fallingislands-battlebox' ? 'event-detail__hero-photo' : ''} src={event.id === 'fallingislands-battlebox' ? '/assets/img/figma/eventHero.jpg' : coverUrl(event)} alt="" />
      <div className="event-detail__hero-shade" />
      <div className="event-detail__hero-content">
        <button type="button" className="event-detail__back" onClick={back}>← Back to Events</button>
        <div className="event-detail__hero-bottom"><div><div className="event-detail__chips"><span>{dayLabel(event.startsAt).toUpperCase()} · {event.timeLabel}</span><span>{event.genre.label.toUpperCase()}</span></div><h1>{event.heroTitle}</h1></div><div className="event-detail__actions"><a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">Get tickets ↗</a><SaveButton event={event} className="event-detail__save" showLabel /><button type="button" onClick={() => share(event.heroTitle)}>↥ <span>Share</span></button></div></div>
      </div>
    </section>

    <div className="event-detail__content">
      <section className="event-detail__intro"><h2>About this event</h2><p className="event-detail__about">{event.about}</p><h2>Line-up</h2><ul className="event-detail__lineup">{event.lineup.map((entry) => <li key={entry.artist.id}><Link to={entry.artist.id === 'fallingislands' ? ROUTES.artist : `/events/list?artist=${entry.artist.id}`}>
        {entry.artist.id === 'fallingislands' ? <img className="event-detail__artist-photo" src="/assets/img/fallingislands-avatar.jpg" alt="" /> : <Avatar name={entry.artist.name} hue={entry.artist.hue} size={40} />}
        <span><strong>{entry.artist.name}</strong><small>{entry.role}</small></span></Link></li>)}</ul></section>
      <div className="event-detail__tabs" role="tablist" aria-label="Event information"><Link role="tab" aria-selected={!discussions} className={!discussions ? 'is-active' : ''} to={`/events/${id}`}>Details</Link><Link role="tab" aria-selected={discussions} className={discussions ? 'is-active' : ''} to={`/events/${id}/discussions`}>Discussions</Link></div>
      <div className="event-detail__layout"><div>
        {discussions ? <Discussion eventId={id} /> : <section className="event-detail__section"><h2>Event details</h2><div className="event-detail__tiles">{tiles.map(([label, value, link]) => <div key={label}><small>{label}</small><strong>{value}</strong>{link && <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>}</div>)}</div></section>}
      </div><aside><section className="event-detail__section"><h2>Who's going</h2><div className="event-detail__going"><div><strong>{event.going}</strong><small>going</small></div><div><strong>{event.friends.length}</strong><small>friends from Spotify</small></div></div><p className="event-detail__friend-line">{!!event.friends.length && <Friends friends={event.friends} size={24} />}{friendSentence}</p><button type="button" className="event-detail__more" aria-expanded={showAttendees} onClick={() => setShowAttendees((visible) => !visible)}>{showAttendees ? "Hide who's going" : "See who's going"} {showAttendees ? '⌃' : '→'}</button>{showAttendees && <ul className="event-detail__attendees">{event.friends.map((friend) => <li key={friend.id}><Avatar name={friend.name} hue={friend.hue} size={30} />{friend.name}<small>Friend</small></li>)}{event.going > event.friends.length && <li>and {event.going - event.friends.length} others</li>}</ul>}</section><section className="event-detail__section event-detail__venue"><h2>More at {event.venue.fullName}</h2>{moreAtVenue.length ? <ul className="event-detail__venue-list">{moreAtVenue.map((item) => <li key={item.id}><Link to={`/events/${item.id}`}><small>{dayLabel(item.startsAt)}</small><strong>{item.title}</strong></Link></li>)}</ul> : <p>Nothing else scheduled here yet.</p>}<Link className="event-detail__venue-link" to={`/events/list?venue=${event.venueId}`}>See all events at {event.venue.name}</Link></section></aside></div>
    </div>
  </main></Page>
}
