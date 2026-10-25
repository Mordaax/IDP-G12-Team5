import db from '../data/db.json' with { type: 'json' }

// Keep this fixture's IDs stable so existing saves, messages and event links survive.
export const FEATURED_ARTIST = db.events.artists.find(artist => artist.id === 'fallingislands')
export const featuredArtistAvatar = name => name === FEATURED_ARTIST.name ? FEATURED_ARTIST.avatar : null
