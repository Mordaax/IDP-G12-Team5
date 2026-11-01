import { fitArtistsCamera, subgenreLabels } from './genreCamera.js'

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

// Make labels readable by moving the camera, never by moving an artist.
export function edmFocusCamera(dots, width, height, { rightInset = 24 } = {}) {
  const members = dots.filter(dot => dot.genre === 'electronic')
  const fitted = fitArtistsCamera(members, width, height, { rightInset })
  if (!fitted) return null
  const sx = (364 + width - rightInset) / 2, sy = (48 + height - 80) / 2
  let cx = (sx - fitted.x) / fitted.z, cy = (sy - fitted.y) / fitted.z
  // Split personalised tiers can leave the fitted centre in empty space. Anchor
  // to the closest existing artist in that case, without modifying any dot.
  const near = [...members].sort((a, b) =>
    Math.hypot(a.x + a.d / 2 - cx, a.y + a.d / 2 - cy) - Math.hypot(b.x + b.d / 2 - cx, b.y + b.d / 2 - cy)
    || a.artistId.localeCompare(b.artistId))[0]
  if (Math.hypot(near.x + near.d / 2 - cx, near.y + near.d / 2 - cy) > 160) {
    cx = near.x + near.d / 2; cy = near.y + near.d / 2
  }
  let candidate
  for (let step = 16; step <= 40; step++) {
    const z = step / 10
    candidate = { z, x: sx - cx * z, y: sy - cy * z }
    const labels = subgenreLabels(members, 'electronic', candidate, width, height,
      { rightInset, stable: true, showAll: true })
    if (labels.length && !labels.some((a, i) => labels.slice(i + 1).some(b => overlaps(a, b)))) return candidate
  }
  return candidate
}
