import { useSyncExternalStore } from 'react'
import { getTheme, setTheme, subscribe } from '@/theme/theme'

/** The current site theme id ('discover' or 'style-guide'); re-renders when it changes. */
export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme)
}

/** Switch that puts the whole site on the feat/style-guide look (and back). */
export default function ThemeToggle({ className = '' }) {
  const on = useTheme() === 'style-guide'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setTheme(on ? 'discover' : 'style-guide')}
      title="Use the colours and fonts from the feat/style-guide branch on every page"
      className={`flex items-center gap-[8px] rounded-[8px] border border-black/10 bg-white px-[10px] py-[6px] text-[12px] font-medium text-ink hover:bg-black/5 ${className}`}
    >
      <span className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${on ? 'bg-brand' : 'bg-black/20'}`}>
        <span className={`absolute top-[2px] size-[14px] rounded-full bg-white shadow transition-[left] ${on ? 'left-[16px]' : 'left-[2px]'}`} />
      </span>
      Follow style guide
    </button>
  )
}
