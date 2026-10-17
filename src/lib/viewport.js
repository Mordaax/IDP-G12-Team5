// The Figma frames are 1440px wide. On wider windows the pages stretch to fill the
// screen; on narrower windows the whole page is zoomed down so it still fits without
// sideways scrolling. `--screen-h` is the window height in (zoomed) CSS px, so pages
// can fill the full height with `min-h-[var(--screen-h)]`.
export const DESIGN_WIDTH = 1440

export function installViewportFit() {
  const root = document.documentElement
  const apply = () => {
    const zoom = Math.min(1, window.innerWidth / DESIGN_WIDTH)
    root.style.zoom = zoom === 1 ? '' : String(zoom)
    root.style.setProperty('--screen-h', `${window.innerHeight / zoom}px`)
  }
  apply()
  window.addEventListener('resize', apply)
}
