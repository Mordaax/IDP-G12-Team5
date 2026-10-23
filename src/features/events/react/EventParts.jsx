import Link from '@/components/AppLink'
import { featuredArtistAvatar } from '@/lib/featuredArtist'
import { useSession } from '@/lib/useSession'
import { useToast } from '@/lib/toast'
import { cardStamp, dowUpper, monthShort } from '../utils/date'
import { formatDistance } from '../utils/geo'
import { useEvents } from './EventsContext'

const coversWithoutIllustrations = new Set(['late-transmission-battlebox', 'lullaboy-live-battlebox', 'intrgnt-battlebox'])
export const coverUrl = (event) => coversWithoutIllustrations.has(event.id) ? '/assets/img/figma/eventHero.jpg' : `/images/events/${event.id}.svg`

export function Avatar({ name, hue = 260, size = 32 }) {
  if (featuredArtistAvatar(name)) return <img src={featuredArtistAvatar(name)} alt={name} width={size} height={size} className="event-avatar object-cover" style={{ width: size, height: size }} />
  return <span className="event-avatar" style={{ width: size, height: size, background: `hsl(${hue} 55% 80%)` }} aria-label={name}>{name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
}

export function Friends({ friends, size = 26 }) {
  return <span className="event-friends" aria-label={`${friends.length} friends going`}>{friends.slice(0, 3).map((friend) => <Avatar key={friend.id} name={friend.name} hue={friend.hue} size={size} />)}</span>
}

export function SaveButton({ event, className = '', showLabel = false }) {
  const { saved, toggleSaved } = useEvents()
  const { requireLogin } = useSession()
  const toast = useToast()
  const isSaved = saved.has(event.id)
  return <button type="button" className={className} aria-label={isSaved ? 'Remove from saved events' : 'Save event'} aria-pressed={isSaved} onClick={() => requireLogin(() => toast(toggleSaved(event.id) ? 'Saved to your events' : 'Removed from saved events'))}><span aria-hidden="true">{isSaved ? '♥' : '♡'}</span>{showLabel && <span>{isSaved ? 'Saved' : 'Save event'}</span>}</button>
}

export function ListCard({ event }) {
  return <article className="event-list-card" style={{ '--event-genre': event.genre.hex }}>
    <div className="event-list-card__cover">
      <img src={coverUrl(event)} alt="" loading="lazy" />
      <span className="event-list-card__date"><b>{dowUpper(event.startsAt)}</b><strong>{event.startsAt.getDate()}</strong><small>{monthShort(event.startsAt).toUpperCase()}</small></span>
      <span className="event-list-card__genre">● {event.genre.label}</span>
      <SaveButton event={event} className="event-list-card__save" />
    </div>
    <div className="event-list-card__body">
      <h2><Link to={`/events/${event.id}`}>{event.title}</Link></h2>
      <p>{event.venue.label} · {formatDistance(event.distanceKm)}</p>
      <p>{event.timeLabel}</p>
      {!!event.friends.length && <div className="event-list-card__friends"><Friends friends={event.friends} /><span>{event.friends.length} friend{event.friends.length === 1 ? '' : 's'} going</span></div>}
      <div className="event-list-card__chips">
        {event.tags[0] && <span>#{event.tags[0]}</span>}
        <span>{event.free ? 'Free' : `$${event.price}`}</span>
        <span>{event.going} going</span>
      </div>
    </div>
  </article>
}

export function MapCard({ event, active, onHover }) {
  return <article className={`event-map-card ${active ? 'is-active' : ''}`} onMouseEnter={() => onHover(event.id)} onMouseLeave={() => onHover(null)}>
    <Link to={`/events/${event.id}`} aria-label={`${event.title}, ${cardStamp(event.startsAt)}. View event`} onFocus={() => onHover(event.id)} onBlur={() => onHover(null)}>
      <div className="event-map-card__head"><span>{cardStamp(event.startsAt)}</span><span>{event.free ? 'Free' : `$${event.price}`}</span></div>
      <div className="event-map-card__body">
        <img src={coverUrl(event)} alt="" loading="lazy" />
        <div><h3>{event.headliner.name}</h3><p>{event.venue.label} · {formatDistance(event.distanceKm)}</p><p>{event.going} going{event.friends.length ? ` · ${event.friends.length} friends` : ''}</p></div>
      </div>
    </Link>
  </article>
}
