// Projection used by the placeholder map. The stylised map art is drawn in a
// 1300×1000 "world" covering central Singapore; real lat/lng are linearly
// mapped into it. When the real map API is plugged in, only <EventMap> needs
// to change — events keep their lat/lng (via event.venue).

export const MAP_WIDTH = 1300
export const MAP_HEIGHT = 1000

// The drawn map continues beyond the central 1300x1000 picture, so there is
// more to see when zooming out. PAD is how far it reaches on each side.
export const MAP_PAD_X = 650
export const MAP_PAD_Y = 500
export const WORLD_WIDTH = MAP_WIDTH + MAP_PAD_X * 2
export const WORLD_HEIGHT = MAP_HEIGHT + MAP_PAD_Y * 2

const BOUNDS = { north: 1.32, south: 1.27, west: 103.825, east: 103.89 }

export function project({ lat, lng }) {
  return {
    x: ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * MAP_WIDTH,
    y: ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * MAP_HEIGHT,
  }
}
