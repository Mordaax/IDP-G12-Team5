import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const excluded = new Set(['TeamStyleGuide.jsx', 'ThemeToggle.jsx', 'Overview.jsx'])
function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? sources(path) : entry.name.endsWith('.jsx') && !excluded.has(entry.name) ? [path] : []
  })
}
const files = ['src/pages', 'src/components'].flatMap(dir => sources(join(root, dir)))

test('product headings use display typography and floating surfaces use restrained elevation', () => {
  const violations = []
  for (const path of files) {
    const source = readFileSync(path, 'utf8')
    for (const heading of source.matchAll(/<h[1-4]\b[^>]*className="([^"]*)"/g)) {
      if (!heading[1].includes('font-display')) violations.push(`${relative(root, path)}: heading lacks font-display`)
    }
    if (/shadow-\[0[^\]]*rgba\(/.test(source) || /\bshadow-(?:lg|xl|2xl)\b/.test(source)) {
      violations.push(`${relative(root, path)}: hard-coded heavy elevation`)
    }
  }
  assert.deepEqual(violations, [])
})

test('forms and secondary actions use control radii without changing circular identities or genre chips', () => {
  const cases = [
    ['src/components/ConfirmDialog.jsx', /rounded-control border border-line[^\n]*>Cancel/],
    ['src/components/discover/Panels.jsx', /h-\[44px\] w-\[300px\] rounded-control/],
    ['src/pages/Messages.jsx', /h-\[48px\] min-w-0 flex-1[^"\n]*rounded-control border border-line/],
    ['src/pages/Profile.jsx', /rounded-control border border-line[^\n]*>Edit profile/],
    ['src/pages/Auth.jsx', /rounded-control[^\n]*>\s*\n\s*<GoogleMark/],
  ]
  for (const [path, pattern] of cases) assert.match(readFileSync(join(root, path), 'utf8'), pattern, path)
  assert.match(readFileSync(join(root, 'src/components/NavBar.jsx'), 'utf8'), /size-\[36px\][^"\n]*rounded-\[18px\]/)
  assert.match(readFileSync(join(root, 'src/components/onboarding/Onboarding.jsx'), 'utf8'), /items-center gap-\[6px\] rounded-full/)
  assert.match(readFileSync(join(root, 'src/pages/Onboarding.jsx'), 'utf8'), /fill="#1ED760"/)
})

test('selected controls and destructive confirmation use semantic state colours', () => {
  const onboarding = readFileSync(join(root, 'src/components/onboarding/Onboarding.jsx'), 'utf8')
  assert.doesNotMatch(onboarding, /bg-ink\b/)
  assert.match(onboarding, /bg-accent-tint/)
  const confirm = readFileSync(join(root, 'src/components/ConfirmDialog.jsx'), 'utf8')
  assert.match(confirm, /bg-danger\b/)
  const spotify = readFileSync(join(root, 'src/pages/OnboardingSpotify.jsx'), 'utf8')
  assert.match(spotify, /bg-accent hover:bg-accent-hover/)
})

test('unscaled narrow pages give shared navigation its own row', () => {
  const nav = readFileSync(join(root, 'src/components/NavBar.jsx'), 'utf8')
  const styles = readFileSync(join(root, 'src/styles.css'), 'utf8')
  assert.match(nav, /lrm-navbar/)
  assert.match(styles, /:root\[data-no-fit\] \.lrm-navbar > nav\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/)
})

test('core primary actions use the shared accent and control shape', () => {
  const actions = [
    ['src/components/NavBar.jsx', '>Sign up</Link>'],
    ['src/pages/Forum.jsx', '>Start discussion</Link>'],
    ['src/pages/Profile.jsx', '>Save</button>'],
    ['src/pages/Thread.jsx', '>Save changes</button>'],
    ['src/components/discover/Panels.jsx', '>Start exploring</button>'],
    ['src/pages/Onboarding.jsx', '>{c.cta}</Link>'],
  ]
  for (const [path, marker] of actions) {
    const source = readFileSync(join(root, path), 'utf8')
    const end = source.indexOf(marker)
    assert.notEqual(end, -1, `${path}: action exists`)
    const start = source.lastIndexOf('className=', end)
    const classes = source.slice(start, end)
    assert.match(classes, /bg-accent\b/, `${path}: primary action uses accent`)
    assert.match(classes, /text-on-accent\b/, `${path}: primary action uses contrast token`)
    assert.match(classes, /rounded-control\b/, `${path}: primary action uses control radius`)
  }
})
