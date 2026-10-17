import { useSyncExternalStore } from 'react'
import { getTheme, setTheme, subscribe } from '@/theme/theme'

/** The current site theme id ('discover' or 'style-guide'); re-renders when it changes. */
export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme)
}

const OPTIONS = [
  { id: 'discover', label: 'Style Guide 1', hint: 'This site’s look, taken from the Discover page' },
  { id: 'style-guide', label: 'Style Guide 2', hint: 'The team’s guide from the feat/style-guide branch' },
]

/** Radio buttons that choose which style guide the whole site follows. */
export default function ThemeToggle({ className = '' }) {
  const theme = useTheme()
  return (
    <fieldset className={`m-0 flex shrink-0 items-center gap-[2px] whitespace-nowrap rounded-[8px] border border-black/10 bg-white p-[3px] text-[12px] ${className}`}>
      <legend className="sr-only">Site style</legend>
      {OPTIONS.map((o) => {
        const on = theme === o.id
        return (
          <label
            key={o.id}
            title={o.hint}
            className={`flex cursor-pointer items-center gap-[6px] rounded-[6px] px-[9px] py-[4px] font-medium text-ink transition-colors ${on ? 'bg-black/5' : 'hover:bg-black/5'}`}
          >
            <input
              type="radio"
              name="site-style"
              value={o.id}
              checked={on}
              onChange={() => setTheme(o.id)}
              className="size-[13px] accent-[var(--lrm-brand)]"
            />
            {o.label}
          </label>
        )
      })}
    </fieldset>
  )
}
