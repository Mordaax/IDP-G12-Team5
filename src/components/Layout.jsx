import NavBar from './NavBar'

// A full-window page: the nav bar on top, content filling the rest of the screen.
export function Page({ active, children, className = '' }) {
  return (
    <div className={`flex min-h-[var(--screen-h)] flex-col bg-canvas ${className}`}>
      <NavBar active={active} />
      {children}
    </div>
  )
}

// The 1440px-wide column of the Figma frames, centred on wider screens.
// Children use the frame's own coordinates, measured from below the 72px nav bar.
export function Stage({ height, children, className = '' }) {
  return (
    <main className={`relative mx-auto w-[1440px] shrink-0 ${className}`} style={{ height }}>
      {children}
    </main>
  )
}

// Map-style screens (Discover): fill the window below the nav. The side panels pin
// to the window edges while the graph stays centred.
export function MapArea({ children, label, className = '' }) {
  return (
    <main aria-label={label} className={`relative h-[calc(var(--screen-h)-72px)] min-h-[560px] w-full flex-1 overflow-hidden bg-canvas ${className}`}>
      {children}
    </main>
  )
}
