// Which theme the whole site uses (React and Vue pages alike), remembered in this browser.
//   'discover'    — the default look, taken from the Discover page
//   'style-guide' — the team's draft from the feat/style-guide branch
// The values live in theme.css; this only sets <html data-theme="…">. index.html and events.html
// apply the saved choice before the page draws, so there is no flash of the other theme.

export const THEMES = [
  { id: 'discover', label: 'Discover' },
  { id: 'style-guide', label: 'Style guide' },
]

const KEY = 'lrm.theme'
const listeners = new Set()

export function getTheme() {
  return document.documentElement.dataset.theme || 'discover'
}

export function setTheme(id) {
  const root = document.documentElement
  if (id === 'style-guide') root.dataset.theme = id
  else delete root.dataset.theme
  try {
    if (id === 'style-guide') localStorage.setItem(KEY, id)
    else localStorage.removeItem(KEY)
  } catch { /* storage blocked: the choice lasts until the page reloads */ }
  listeners.forEach((fn) => fn())
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// keep other open tabs in step
window.addEventListener('storage', (e) => {
  if (e.key === KEY) setTheme(e.newValue || 'discover')
})
