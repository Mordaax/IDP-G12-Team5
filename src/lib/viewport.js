// The Figma frames are 1440px wide. On wider windows the pages stretch to fill the
// screen; on narrower windows the whole page is zoomed down so it still fits without
// sideways scrolling. `--screen-h` is the window height in (zoomed) CSS px, so pages
// can fill the full height with `min-h-[var(--screen-h)]`.
export const DESIGN_WIDTH = 1440

let apply = () => {}

/** Turn the zoom off for pages that are responsive on their own (the team style guide). */
export function setViewportFit(on) {
  document.documentElement.toggleAttribute('data-no-fit', !on)
  apply()
}

export function installViewportFit() {
  const root = document.documentElement
  apply = () => {
    const navZoom = Math.min(1, window.innerWidth / DESIGN_WIDTH)
    const zoom = root.hasAttribute('data-no-fit') ? 1 : Math.min(1, window.innerWidth / DESIGN_WIDTH)
    root.style.zoom = zoom === 1 ? '' : String(zoom)
    root.style.setProperty('--screen-h', `${window.innerHeight / zoom}px`)
    root.style.setProperty('--nav-zoom', String(navZoom / zoom))
  }
  apply()
  window.addEventListener('resize', apply)
}
