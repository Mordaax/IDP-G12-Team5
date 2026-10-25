// Every Discover view uses stable artist IDs and explicit audience edges from the active catalogue.
import { ARTIST_CATALOGUE } from '@/data'
import { buildCatalogueGraph, circularGraph } from './catalogueGraph'

export const WEB = circularGraph(buildCatalogueGraph(ARTIST_CATALOGUE))
export const FOR_YOU = WEB
const electronicIds = new Set(WEB.dots.filter(dot => dot.genre === 'electronic').map(dot => dot.artistId))
export const ELECTRONIC = {
  dots: WEB.dots.filter(dot => electronicIds.has(dot.artistId)),
  edges: WEB.edges.filter(edge => electronicIds.has(edge.sourceArtistId) && electronicIds.has(edge.targetArtistId)),
  labels: WEB.labels.filter(label => label[5] === 'Electronic / EDM'),
}
// Preserve existing route modules while replacing their legacy Figma identities.
export const SYNTHWAVE = ELECTRONIC
