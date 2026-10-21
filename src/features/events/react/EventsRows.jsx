import Link from '@/components/AppLink'
import { dowUpper, monthShort } from '../utils/date'
import { formatDistance } from '../utils/geo'
import { EventsShell } from './EventsBrowse'
import { useEvents } from './EventsContext'
import { coverUrl, Friends, SaveButton } from './EventParts'
import './events-rows.css'

function EventRow({ event }) {
  return <article className="event-row" role="listitem" data-event-id={event.id} style={{ '--event-genre': event.genre.hex }}>
    <Link className="event-row__picture" to={`/events/${event.id}`} aria-label={`View ${event.title}`}>
      <img src={coverUrl(event)} alt="" loading="lazy" />
    </Link>
    <div className="event-row__summary">
      <h2><Link to={`/events/${event.id}`}>{event.title}</Link></h2>
      <p>{event.venue.label} · {formatDistance(event.distanceKm)}</p>
      <div className="event-row__tags">
        <span className="event-row__genre">● {event.genre.label}</span>
        {event.tags[0] && <span>#{event.tags[0]}</span>}
        {!!event.friends.length && <span className="event-row__friends"><Friends friends={event.friends} size={22} />{event.friends.length} friend{event.friends.length === 1 ? '' : 's'} going</span>}
      </div>
    </div>
    <time className="event-row__schedule" dateTime={event.startsAt.toISOString()}>
      <strong>{dowUpper(event.startsAt)} {event.startsAt.getDate()} {monthShort(event.startsAt)}</strong>
      <span>{event.timeLabel}</span>
    </time>
    <div className="event-row__attendance">
      <strong>{event.free ? 'Free' : `$${event.price}`}</strong>
      <span>{event.going} going</span>
    </div>
    <SaveButton event={event} className="event-row__save" />
  </article>
}

export default function EventsRows() {
  const { results } = useEvents()
  return <EventsShell view="rows">
    <section className="event-rows" aria-label="Event results rows" tabIndex={0}>
      <div className="event-rows__header" aria-hidden="true"><span>Event</span><span>Date & time</span><span>Price & attendance</span><span /></div>
      <div role="list" aria-label="Events">{results.map((event) => <EventRow key={event.id} event={event} />)}</div>
    </section>
  </EventsShell>
}
