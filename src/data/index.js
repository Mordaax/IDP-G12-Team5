// Shared prototype data: active artist catalogue plus preserved legacy event fixtures.
// Swap the import for API calls when the backend exists.
import db from './db.json'
import catalogue from './artists.json'

// The one signed-in persona for the whole prototype: Kit Tan.
export const USER = db.user
export const ROUTES = db.routes
export const IMG = db.images
// The approved fictional catalogue drives Discover. db.json retains legacy event fixtures.
export const ARTIST_CATALOGUE = catalogue
export const ARTISTS = catalogue.artists
export const ARTIST_BY_ID = Object.fromEntries(ARTISTS.map(artist => [artist.id, artist]))
export const SHARED_AUDIENCES = catalogue.sharedAudiences
export const SUBGENRES = catalogue.subgenres
export const SUBGENRE_BY_ID = Object.fromEntries(SUBGENRES.map(genre => [genre.id, genre]))
export const GENRES = catalogue.genreFamilies.map(genre => ({ key: genre.id, name: genre.label, dot: genre.hex, label: genre.hex }))
const canonicalGenres = Object.fromEntries(GENRES.map(genre => [genre.key, genre]))
// Compatibility aliases for archived event/profile fixtures, not extra active families.
export const GENRE_BY_KEY = {
  ...canonicalGenres,
  indie: canonicalGenres.rock,
  'indie-rock': canonicalGenres.rock,
  'hip-hop': canonicalGenres.hiphop,
  ethnic: canonicalGenres.traditional,
  mandopop: { key: 'pop', name: 'Mandopop', dot: SUBGENRE_BY_ID['pop--mandopop'].colour.css, label: SUBGENRE_BY_ID['pop--mandopop'].colour.css },
}
export const ARTIST_DOTS = db.discover.artistDots
export const LINKS_ORIGIN = db.discover.linksOrigin
export const GRAPHS = db.discover.graphs
// Legacy events keep their original identities and references; they are not active catalogue artists.
export const LEGACY_EVENTS_DB = db.events
export const EVENTS_DB = LEGACY_EVENTS_DB
