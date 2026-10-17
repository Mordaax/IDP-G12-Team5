// The four Discover graphs from Figma, ready for <WebOfDots>.
import { ARTIST_DOTS, GENRE_BY_KEY, GRAPHS, LINKS_ORIGIN, ROUTES } from '@/data'
import { parseDots } from './WebOfDots'

const genreLabel = (key, x, y) => [x, y, 12, 600, GENRE_BY_KEY[key].label, GENRE_BY_KEY[key].name]

/** 📸 1 — the whole web, signed out. */
export const WEB = {
  dots: [
    ...ARTIST_DOTS.map((d) => ({ ...d, fill: GENRE_BY_KEY[d.genre].dot })),
    { x: 514.75, y: 371.66, d: 16, genre: 'pop', fill: '#8b5cf6' }, // highlighted Pop Music dot
  ],
  links: { src: '/assets/icons/graph-links.svg', x: LINKS_ORIGIN.x, y: LINKS_ORIGIN.y, w: 792, h: 750 },
  labels: [
    genreLabel('indie', 362, 297), genreLabel('pop', 410, 636), genreLabel('mandopop', 645, 246),
    genreLabel('hiphop', 778, 525), genreLabel('electronic', 509, 96), genreLabel('ethnic', 282, 552),
  ],
  linkHrefs: { Electronic: ROUTES.discoverElectronic },
  photos: [
    { x: 453, y: 23, size: 37, src: '/assets/img/avatar-electronic.png', genre: 'electronic', name: 'FallingIslands', artistId: 'fallingislands' },
    { x: 523, y: 534, size: 26, src: '/assets/img/avatar-pop.png', genre: 'pop', name: 'Lullaboy', artistId: 'lullaboy' },
  ],
}

/** 📸 2 — zoomed into Electronic, signed out. */
export const ELECTRONIC = {
  dots: parseDots(GRAPHS.electronic.DOTS),
  links: GRAPHS.electronic.LINKS,
  labels: GRAPHS.electronic.LABELS,
  linkHrefs: { Synthwave: ROUTES.signup },
  photos: GRAPHS.electronic.PHOTOS.map(([x, y, size, src]) => ({ x, y, size, src, genre: 'electronic', name: 'FallingIslands', artistId: 'fallingislands' })),
}

/** 📸 7 — your web, signed in. */
export const FOR_YOU = {
  dots: parseDots(GRAPHS.forYou.DOTS),
  links: GRAPHS.forYou.LINKS,
  labels: [
    [247, 254, 12, 500, '#4e6df5', 'Indie Rock'], [645, 246, 12, 500, '#ec6a9c', 'Contemporary Mandopop'],
    [783, 523, 12, 500, '#f5a524', 'Hip-Hop'], [506, 108, 12, 500, '#0fb3a1', 'Electronic'],
    [149, 486, 12, 500, '#3fa96a', 'Traditional Ethnic Music'], [406, 630, 12, 500, '#8b5cf6', 'Pop Music'],
    [506, 418, 12, 500, '#4a4a4a', 'Synthwave'],
  ],
  linkHrefs: { Synthwave: ROUTES.recommended },
}

/** 📸 8 / 📸 9 — zoomed into Synthwave, signed in. FallingIslands is the ringed dot. */
export const SYNTHWAVE = {
  dots: parseDots(GRAPHS.zoom.DOTS),
  links: GRAPHS.zoom.LINKS,
  labels: GRAPHS.zoom.LABELS,
  linkHrefs: {},
}
export const FALLINGISLANDS_SPOT = { x: 618, y: 456, name: 'FallingIslands', artistId: 'fallingislands' }
