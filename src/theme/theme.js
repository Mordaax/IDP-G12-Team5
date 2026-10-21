// Which theme the whole site uses, remembered in this browser.
//   'style-guide' — the default, following the team's guide at /style-guide
//   'discover'    — the original Discover look, retained for explicit comparison
// The values live in theme.css; this only sets <html data-theme="…">. index.html
// applies the saved choice before the page draws, so there is no flash of the other theme.

export const THEMES = [
  { id: 'discover', label: 'Discover' },
  { id: 'style-guide', label: 'Style guide' },
]

const KEY = 'lrm.theme'
const listeners = new Set()

export function getTheme() {
  return document.documentElement.dataset.theme || 'style-guide'
}

export function setTheme(id) {
  const root = document.documentElement
  const theme = id === 'discover' ? 'discover' : 'style-guide'
  root.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch { /* storage blocked: the choice lasts until the page reloads */ }
  listeners.forEach((fn) => fn())
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// keep other open tabs in step
window.addEventListener('storage', (e) => {
  if (e.key === KEY) setTheme(e.newValue || 'style-guide')
})
