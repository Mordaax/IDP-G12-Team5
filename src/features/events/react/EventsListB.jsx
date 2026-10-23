import Link from '@/components/AppLink'
import { dayLabelYear, dowUpper, monthShort } from '../utils/date'
import { formatDistance } from '../utils/geo'
import { coverUrl, Friends, SaveButton } from './EventParts'
import { useEvents } from './EventsContext'
import { EventsShell } from './EventsBrowse'
import './events-list-b.css'

/** Comparison layout only: data, filtering, sorting and saves stay shared with A. */
export function EventRow({ event }) {
  return <article className="event-row" data-event-row={event.id}>
    <Link className="event-row__link" to={`/events/${event.id}`}>
      <time className="event-row__date" dateTime={event.startsAt.toISOString()} aria-label={`${dayLabelYear(event.startsAt)} at ${event.timeLabel}`}>
        <small>{dowUpper(event.startsAt)}</small><strong>{event.startsAt.getDate()}</strong><span>{monthShort(event.startsAt)}</span>
      </time>
      <img className="event-row__art" src={coverUrl(event)} alt="" loading="lazy" />
      <div className="event-row__info">
        <h2>{event.title}</h2>
        <div className="event-row__metadata"><span className="event-row__genre"><i aria-hidden="true" style={{ background: event.genre.hex }} />{event.genre.label}</span>{event.tags[0] && <span>#{event.tags[0]}</span>}</div>
        {!!event.friends.length && <div className="event-row__friends"><Friends friends={event.friends} size={22} /><span>{event.friends.length} friend{event.friends.length === 1 ? '' : 's'} going</span></div>}
      </div>
      <div className="event-row__venue"><strong>{event.venue.label}</strong><span>{event.timeLabel} · {formatDistance(event.distanceKm)}</span></div>
      <div className="event-row__entry"><strong>{event.free ? 'Free' : `$${event.price}`}</strong><span>{event.going} going</span></div>
    </Link>
    <SaveButton event={event} className="event-row__save" />
  </article>
}

export function EventRows({ events }) {
  return <ul className="events-list-b__results" aria-label="Events in row view">{events.map(event => <li key={event.id}><EventRow event={event} /></li>)}</ul>
}

export default function EventsListB() {
  const { results } = useEvents()
  return <EventsShell view="list" listTo="/events/list/b">
    <section className="events-list-b" aria-label="Row-based event list">
      <div className="events-list-b__caption"><h1>Upcoming events</h1></div>
      <div className="events-list-b__columns" aria-hidden="true"><span>Date</span><span /><span>Event</span><span>Venue &amp; time</span><span>Entry</span><span /></div>
      <EventRows events={results} />
    </section>
  </EventsShell>
}
