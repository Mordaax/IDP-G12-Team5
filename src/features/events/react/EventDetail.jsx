import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { ROUTES } from '@/data'
import { useSession } from '@/lib/useSession'
import { sessionGet, sessionSet } from '@/lib/session'
import { useShare } from '@/lib/toast'
import { dayLabel, dayLabelYear } from '../utils/date'
import { formatDistance, mapsDirectionsUrl, mapsSearchUrl } from '../utils/geo'
import { Avatar, coverUrl, Friends, SaveButton } from './EventParts'
import { useEvents } from './EventsContext'
import { eventTopicFor, topicUrl } from '@/features/forum/forumModel'
import { AttachButtons, AttachmentList, AttachmentTray, useAttachments } from '@/components/Attachments'

function Discussion({ eventId }) {
  const { user } = useEvents()
  const { requireLogin } = useSession()
  const forumTopic = eventTopicFor(eventId)
  const key = (name) => `thread.${forumTopic.id}.${name}`
  const [mine, setMine] = useState(() => sessionGet(key('mine'), []))
  const [votes, setVotes] = useState(() => sessionGet(key('votes'), {}))
  const [draft, setDraft] = useState(() => sessionGet(key('draft'), ''))
  const [composerOpen, setComposerOpen] = useState(false)
  const attachments = useAttachments()
  const comments = [
    ...forumTopic.comments.flatMap((comment) => [comment, ...(comment.replies || [])]),
    ...mine.map((comment) => ({ ...comment, who: user.name, minutesAgo: 0, votes: 0 })),
  ]

  const post = (submitEvent) => {
    submitEvent.preventDefault()
    const text = draft.trim()
    const files = attachments.items
    if (!text && !files.length) return
    requireLogin(() => {
      const comment = { id: `local-${Date.now()}`, body: text, attachments: files }
      setMine((old) => {
        const next = [comment, ...old]
        sessionSet(key('mine'), next)
        return next
      })
      setDraft('')
      setComposerOpen(false)
      attachments.clear()
      sessionSet(key('draft'), '')
    })
  }
  const vote = (comment) => requireLogin(() => {
    setVotes((old) => {
      const next = { ...old, [comment.id]: old[comment.id] === 1 ? 0 : 1 }
      sessionSet(key('votes'), next)
      return next
    })
  })
  const ago = (minutes) => minutes < 1 ? 'just now' : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.round(minutes / 60)}h ago` : `${Math.round(minutes / 1440)}d ago`
  const reply = (comment) => {
    const next = `@${comment.who} `
    setDraft(next)
    sessionSet(key('draft'), next)
    setComposerOpen(true)
  }

  return <section className="event-detail__section event-discussion">
    <div className="event-discussion__heading"><h2>Discussions</h2><span>{comments.length} comment{comments.length === 1 ? '' : 's'}</span></div>
    {comments.length ? <ul>{comments.map((comment) => <li key={comment.id}><Avatar name={comment.who} hue={260} size={32} /><div><p className="event-discussion__byline"><strong>{comment.who}</strong><span>· {ago(comment.minutesAgo ?? 0)}</span></p>{comment.body && <p className="event-discussion__text">{comment.body}</p>}{comment.attachments?.length > 0 && <div className="event-discussion__attachments"><AttachmentList items={comment.attachments} /></div>}<div className="event-discussion__controls"><button type="button" aria-label={`${votes[comment.id] === 1 ? 'Remove like from' : 'Like'} ${comment.who}'s comment`} aria-pressed={votes[comment.id] === 1} onClick={() => vote(comment)}>♥ {comment.votes + (votes[comment.id] || 0)}</button><span>·</span><button type="button" onClick={() => reply(comment)}>Reply</button></div></div></li>)}</ul> : <p className="event-discussion__empty">No comments yet. Start this event's discussion.</p>}
    <div className="event-discussion__footer"><button type="button" onClick={() => setComposerOpen((open) => !open)}>{composerOpen ? 'Cancel comment' : 'Add a comment'}</button><Link to={topicUrl(forumTopic)}>Open the full thread in Forum →</Link></div>
    {composerOpen && <form onSubmit={post}><Avatar name={user.name} hue={340} size={30} /><input autoFocus type="text" value={draft} placeholder="Join the conversation…" aria-label="Write a comment" onChange={(event) => { setDraft(event.target.value); sessionSet(key('draft'), event.target.value) }} /><AttachButtons onAdd={attachments.add} guard={requireLogin} /><button type="submit" disabled={!draft.trim() && !attachments.items.length}>Comment</button></form>}
    {composerOpen && attachments.items.length > 0 && <div className="event-discussion__tray"><AttachmentTray items={attachments.items} onRemove={attachments.remove} /></div>}
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
    ['Date & time', `${dayLabelYear(event.startsAt)}\n${event.timeLabel}`],
    ['Doors', `Doors open ${event.doorsLabel}\nFirst set ${event.timeLabel}`],
    ['Set times', event.setTimes.map((set) => `${set.artist.name} · ${set.time}`).join('\n')],
    ['Entry', event.entry],
    ['Venue', `${event.venue.address} · ${formatDistance(event.distanceKm)}`, { label: 'View on map', url: mapsSearchUrl(event.venue) }],
    ['Getting there', event.venue.transit, { label: 'Plan route', url: mapsDirectionsUrl(event.venue) }],
  ]
  const friendNames = event.friends.map((friend) => friend.name)
  const friendSentence = friendNames.length ? `${friendNames.length === 1 ? friendNames[0] : `${friendNames.slice(0, -1).join(', ')} and ${friendNames.at(-1)}`} ${friendNames.length === 1 ? 'is' : 'are'} going` : 'None of your friends are going yet'
  const heroImage = event.id === 'fallingislands-battlebox' ? '/assets/img/figma/eventHero.jpg' : coverUrl(event)
  const photoHero = heroImage.endsWith('.jpg')

  return <Page active="events" className="react-events"><main className="event-detail">
    <section className="event-detail__hero" style={{ '--event-genre': event.genre.hex, '--hero-position': photoHero ? 'center 62%' : 'center 48%' }}>
      <img className={event.id === 'fallingislands-battlebox' ? 'event-detail__hero-photo' : ''} src={heroImage} alt="" />
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
        {discussions ? <Discussion key={id} eventId={id} /> : <section className="event-detail__section"><h2>Event details</h2><div className="event-detail__tiles" style={{ '--event-genre': event.genre.hex }}>{tiles.map(([label, value, link]) => <div key={label}><small>{label}</small><strong>{value}</strong>{link && <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>}</div>)}</div></section>}
      </div><aside><section className="event-detail__section"><h2>Who's going</h2><div className="event-detail__going"><div><strong>{event.going}</strong><small>going</small></div><div><strong>{event.friends.length}</strong><small>friends from Spotify</small></div></div><p className="event-detail__friend-line">{!!event.friends.length && <Friends friends={event.friends} size={30} />}{friendSentence}</p><button type="button" className="event-detail__more" aria-expanded={showAttendees} onClick={() => setShowAttendees((visible) => !visible)}>{showAttendees ? "Hide who's going" : "See who's going"} {showAttendees ? '⌃' : '→'}</button>{showAttendees && <ul className="event-detail__attendees">{event.friends.map((friend) => <li key={friend.id}><Avatar name={friend.name} hue={friend.hue} size={30} />{friend.name}<small>Friend</small></li>)}{event.going > event.friends.length && <li>and {event.going - event.friends.length} others</li>}</ul>}</section><section className="event-detail__section event-detail__venue"><h2>More at {event.venue.fullName}</h2>{moreAtVenue.length ? <ul className="event-detail__venue-list">{moreAtVenue.map((item) => <li key={item.id}><Link to={`/events/${item.id}`}><small>{dayLabel(item.startsAt)}</small><strong>{item.title}</strong></Link></li>)}</ul> : <p>Nothing else scheduled here yet.</p>}<Link className="event-detail__venue-link" to={`/events/list?venue=${event.venueId}`}>See all events at {event.venue.name}</Link></section></aside></div>
    </div>
  </main></Page>
}
