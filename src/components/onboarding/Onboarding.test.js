import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const onboarding = await server.ssrLoadModule('/src/components/onboarding/Onboarding.jsx')
  const { GENRE_BY_KEY } = await server.ssrLoadModule('/src/data/index.js')

  const { genreFamilies, variantColour } = await server.ssrLoadModule('/src/style-guide/genrePalette.js')
  const Manual = (await server.ssrLoadModule('/src/pages/OnboardingManual.jsx')).default
  const Spotify = (await server.ssrLoadModule('/src/pages/OnboardingSpotify.jsx')).default
  const { loadTasteProfile } = await server.ssrLoadModule('/src/lib/tasteProfile.js')

  function capturePage(Component) {
    let tree
    function Capture() { tree = Component(); return null }
    renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Capture)))
    const elements = []
    function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit)
      if (!node?.props) return
      elements.push(node)
      visit(node.props.children)
    }
    visit(tree)
    return elements
  }

  test('both onboarding paths restore saved choices and save the current profile before continuing', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    try {
      for (const Component of [Manual, Spotify]) {
        const profile = { selected: ['Dream pop'], songs: ['Slow Burn'] }
        let stored = JSON.stringify(profile)
        let writes = 0
        const storage = {
          getItem() { return stored },
          setItem(key, value) { assert.equal(key, 'lrm.taste-profile'); writes++; stored = value },
        }
        Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
        const elements = capturePage(Component)
        assert.deepEqual(elements.find(node => node.type === onboarding.GenreCard).props.selected, profile.selected)
        const songs = elements.find(node => node.type === onboarding.SongCard)
        assert.deepEqual(songs.props.added, profile.songs)
        assert.equal(typeof songs.props.onToggle, 'function', 'songs remain editable')
        const action = elements.find(node => String(node.props.children).match(/^(?:Save profile|Next)/))
        assert.equal(action.props.to, '/discover/for-you?view=personalised')
        action.props.onClick({ preventDefault() { assert.fail('a selected subgenre is valid') } })
        assert.equal(writes, 1)
        assert.deepEqual(loadTasteProfile(storage), profile)
      }
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
      else delete globalThis.localStorage
    }
  })

  test('Spotify preserves an intentionally empty profile and prevents Next without writing', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    try {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
        getItem() { return JSON.stringify({ selected: [], songs: [] }) },
        setItem() { assert.fail('invalid Next must not save') },
      } })
      const elements = capturePage(Spotify)
      assert.deepEqual(elements.find(node => node.type === onboarding.GenreCard).props.selected, [])
      const action = elements.find(node => node.props['aria-disabled'] !== undefined)
      let prevented = false
      action.props.onClick({ preventDefault() { prevented = true } })
      assert.equal(prevented, true)
      assert.equal(action.props['aria-disabled'], true)
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
      else delete globalThis.localStorage
    }
  })

  test('genre choices cover the seven catalogue families and all 29 child shades', () => {
    assert.deepEqual(onboarding.MAIN_GENRES.map(genre => genre.key), genreFamilies.map(family => family.id))
    const expected = genreFamilies.flatMap(family => family.variants.map(variant => ({
      name: variant.label, genre: family.id, dot: variantColour(family, variant),
    })))
    assert.deepEqual(onboarding.SUBGENRES.map(({ name, genre, dot }) => ({ name, genre, dot })), expected)
    const html = renderToStaticMarkup(createElement(onboarding.GenreCard, {
      title: 'Your genres', selected: ['Traditional', 'Reggae'], onToggle() {}, chipStyle: 'bold',
    }))
    assert.equal((html.match(/aria-pressed=/g) || []).length, 36)
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 2)
    assert.match(html, /overflow-y-auto/)
    assert.match(html, /h-\[340px\]/)
  })

  test('taste profile shows selected genres and subgenres with their colours, without percentages', () => {
    assert.equal(typeof onboarding.TasteProfile, 'function')
    const html = renderToStaticMarkup(createElement(onboarding.TasteProfile, {
      selected: ['Ambient electronic', 'Electronic / EDM', 'House', 'Pop'],
    }))
    for (const name of ['Ambient electronic', 'Electronic / EDM', 'House', 'Pop']) assert.ok(html.includes(name))
    assert.ok(html.includes(`background:${GENRE_BY_KEY.electronic.dot}`))
    assert.ok(html.includes(`background:${GENRE_BY_KEY.pop.dot}`))
    assert.doesNotMatch(html.replace(/<[^>]*>/g, ''), /%|Tracks of the Woods/)
    assert.ok(html.indexOf('Electronic / EDM') < html.indexOf('Ambient electronic'))
    assert.ok(html.includes(`background:${onboarding.SUBGENRES.find(genre => genre.name === 'House').dot}`))
  })

  test('onboarding paths share the unweighted profile and Discover has no percentage labels', () => {
    for (const path of ['../../pages/OnboardingSpotify.jsx', '../../pages/OnboardingManual.jsx']) {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8')
      assert.match(source, /<TasteProfile selected=\{genres\}/)
      assert.doesNotMatch(source, /WEIGHTS|Math\.round|\.pct|GENRE_BY_KEY\.(?:indie|mandopop)|dotOverrides/)
      const defaults = source.match(/\[genres, setGenres\] = useState\(\(\) => savedProfile\?\.selected \?\? (\[[^\n]+\])\)/)
      assert.ok(defaults, 'genre defaults are explicit')
      const selected = JSON.parse(defaults[1].replaceAll("'", '"'))
      assert.deepEqual(onboarding.orderedPicks(selected).sort(), [...selected].sort(), 'every default is an active catalogue choice')
    }
    for (const path of ['../discover/Graph.jsx', '../discover/Panels.jsx']) {
      const source = readFileSync(new URL(path, import.meta.url), 'utf8')
      assert.doesNotMatch(source, /\d+%/)
    }
  })

  test('taste profile supports a subgenre-only selection and an empty selection', () => {
    assert.equal(typeof onboarding.TasteProfile, 'function')
    const subgenre = renderToStaticMarkup(createElement(onboarding.TasteProfile, { selected: ['Ambient electronic'] }))
    assert.ok(subgenre.includes('Ambient electronic'))
    assert.ok(subgenre.includes(`background:${onboarding.SUBGENRES.find(genre => genre.name === 'Ambient electronic').dot}`))
    assert.doesNotMatch(subgenre, /Pick at least/)
    const empty = renderToStaticMarkup(createElement(onboarding.TasteProfile, { selected: [] }))
    assert.ok(empty.includes('Pick at least one genre or subgenre.'))
  })
} finally {
  await server.close()
}
