// Everything the screens read comes from this single JSON file for now.
// Swap the import for API calls when the backend exists.
import db from './db.json'

// The one signed-in persona for the whole prototype: Kit Tan.
export const USER = db.user
export const ROUTES = db.routes
export const SCREENS = db.screens
export const IMG = db.images
export const GENRES = db.genres
export const GENRE_BY_KEY = Object.fromEntries(db.genres.map((g) => [g.key, g]))
export const ARTIST_DOTS = db.discover.artistDots
export const LINKS_ORIGIN = db.discover.linksOrigin
export const GRAPHS = db.discover.graphs
