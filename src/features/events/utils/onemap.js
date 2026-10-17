// OneMap (Singapore Land Authority) — the base map under the Events map.
//
// Map tiles are public. The access token from .env (ONEMAP_API=…) is only used for the
// reverse-geocode call below; tokens last 3 days, so everything still works when it expires —
// the "near …" text just disappears. Renew it at https://www.onemap.gov.sg/apidocs/.

export const TILE_URL = 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png'

// OneMap asks every map that uses its tiles to show this credit
export const ATTRIBUTION =
  '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;" alt=""/>&nbsp;' +
  '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a>&nbsp;&copy;&nbsp;contributors&nbsp;&#124;&nbsp;' +
  '<a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>'

// the tiles only cover Singapore
export const SG_BOUNDS = [
  [1.144, 103.535],
  [1.494, 104.502],
]
export const MIN_ZOOM = 11
export const MAX_ZOOM = 19

const TOKEN = import.meta.env.ONEMAP_API

// OneMap names are in capitals: "SMU YONG PUNG HOW SCHOOL OF LAW" -> "SMU Yong Pung How School of Law"
const ACRONYMS = new Set(['SMU', 'NUS', 'NTU', 'SUTD', 'SIT', 'SIM', 'MRT', 'LRT', 'HDB', 'CBD', 'NAFA', 'YMCA', 'SG'])
const SMALL = new Set(['OF', 'THE', 'AND', 'AT'])
const title = (s) =>
  s
    .split(' ')
    .map((w) => (ACRONYMS.has(w) ? w : SMALL.has(w) ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(' ')

/** The nearest building or road to a point, e.g. "Waterloo Street", or null. */
export async function nearestPlace({ lat, lng }) {
  if (!TOKEN) return null
  try {
    const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${lat},${lng}&buffer=80&addressType=All&otherFeatures=N`
    const res = await fetch(url, { headers: { Authorization: TOKEN } })
    if (!res.ok) return null
    const first = (await res.json()).GeocodeInfo?.[0]
    if (!first) return null
    const building = first.BUILDINGNAME && first.BUILDINGNAME !== 'NIL' ? first.BUILDINGNAME : null
    return title(building || first.ROAD)
  } catch {
    return null
  }
}
