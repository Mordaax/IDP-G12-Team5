export default function PreviewPlaybackIcon({ playing }) {
  return playing
    ? <span aria-hidden="true" className="flex h-[22px] items-end gap-[3px]">{[0, 1, 2].map(bar => <i key={bar} className="block h-full w-[4px] origin-bottom animate-eq bg-current motion-reduce:animate-none" style={{ animationDelay: `${-bar * 0.3}s` }} />)}</span>
    : <svg width="15" height="18" viewBox="0 0 24 28" aria-hidden="true"><path d="M0 0L24 14L0 28Z" fill="currentColor" /></svg>
}
