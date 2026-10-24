import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const { RecommendedPanel } = await server.ssrLoadModule('/src/components/discover/Panels.jsx')
  const { ARTIST_BY_ID } = await server.ssrLoadModule('/src/data/index.js')
  const ForYou = (await server.ssrLoadModule('/src/pages/ForYou.jsx')).default

  test('the saved-profile destination opens the personalised map with the current taste choices', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    try {
      for (const selected of ['House', 'Indie rock']) {
        Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
          getItem: () => JSON.stringify({ selected: [selected], songs: [] }),
        } })
        let tree
        function Capture() { tree = ForYou(); return null }
        renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/discover/for-you?view=personalised'] }, createElement(Capture)))
        const nodes = []
        function visit(node) {
          if (Array.isArray(node)) return node.forEach(visit)
          if (!node?.props) return
          nodes.push(node); visit(node.props.children)
        }
        visit(tree)
        const map = nodes.find(node => node.props.viewKey)
        assert.equal(map.props.viewKey, 'personalised')
        assert.ok(map.props.recommendationArea)
        const recommended = map.props.dots.filter(dot => dot.isRecommended)
        assert.ok(recommended.length > 0)
        assert.ok(recommended.some(dot => dot.subgenre === selected))
        assert.ok(recommended.every(dot => dot.genre === (selected === 'House' ? 'electronic' : 'rock')))
        const panel = nodes.find(node => node.type === RecommendedPanel)
        assert.deepEqual(panel.props.rows.map(row => row.artist.id).sort(), recommended.map(dot => dot.artistId).sort())
      }
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
      else delete globalThis.localStorage
    }
  })

  test('Discover opens with the song playlist visible alongside the map selector', () => {
    let tree
    function Capture() { tree = ForYou(); return null }
    renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Capture)))
    const nodes = []
    function visit(node) {
      if (Array.isArray(node)) return node.forEach(visit)
      if (!node?.props) return
      nodes.push(node)
      visit(node.props.children)
    }
    visit(tree)
    assert.ok(nodes.some(node => node.type === RecommendedPanel), 'The playlist should start open')
    assert.ok(nodes.some(node => node.props['aria-label'] === 'Map view'))
    const map = nodes.find(node => node.props.viewKey)
    const panel = nodes.find(node => node.type === RecommendedPanel)
    assert.equal(typeof map.props.onTogglePreview, 'function')
    assert.equal(map.props.onTogglePreview, panel.props.onTogglePreview, 'Both controls must use the same player')
    assert.equal(map.props.activePreview, panel.props.activePreview)
    assert.equal(typeof panel.props.onJumpToArtist, 'function')
  })

  test('the playlist shows only the shared active track as playing', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(RecommendedPanel, {
        activePreview: { artistId: 'demo-gridwake', title: 'Midnight Transit' },
        onTogglePreview() {},
      })))
    assert.match(html, /aria-label="Pause Midnight Transit"/)
    assert.match(html, /aria-label="Play Low Tide"/)
    assert.equal([...html.matchAll(/aria-label="Pause /g)].length, 1)
    const stopped = renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(RecommendedPanel, { activePreview: null, onTogglePreview() {} })))
    assert.doesNotMatch(stopped, /aria-label="Pause /)
  })

  test('song dividers leave balanced space after tiles and before the next row', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(RecommendedPanel, { onClose() {} })))
    const rows = [...html.matchAll(/<li class="([^"]*)" style="top:(\d+)px">([\s\S]*?)<\/li>/g)]
    assert.equal(rows.length, 6)
    for (let index = 0; index < rows.length - 1; index++) {
      const height = Number(rows[index][1].match(/h-\[(\d+)px\]/)[1])
      const tileSize = Number(rows[index][3].match(/size-\[(\d+)px\]/)[1])
      const after = height - tileSize
      const before = Number(rows[index + 1][2]) - Number(rows[index][2]) - height
      assert.ok(before >= 10, 'Divider needs breathing room before the following tile')
      assert.ok(Math.abs(after - before) <= 1, 'Divider should be centred between tiles')
    }
  })

  test('recommendations retain the original six-song playlist with catalogue artist links', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null,
      createElement(RecommendedPanel, { onClose() {} })))
    assert.match(html, /Recommended for you/)
    for (const title of ['Low Tide', 'Midnight Transit', 'Slow Burn', 'Kampong Bass', 'Coastline', 'Hollow Bark']) {
      assert.ok(html.includes(title), `Missing original prototype song: ${title}`)
    }
    assert.equal([...html.matchAll(/aria-label="(?:Play|Pause) /g)].length, 6)
    assert.match(html, /prototype|demo/i)
    assert.doesNotMatch(html.replace(/<[^>]*>/g, ''), /Explore the scenes|78%|128 recommendations/)
    const artists = [...html.matchAll(/href="\/artists\/([^"]+)"/g)]
    assert.equal(artists.length, 6)
    for (const [, id] of artists) assert.ok(ARTIST_BY_ID[id], `Unknown artist ${id}`)
    assert.match(html, /Close recommendations/)
    assert.equal([...html.matchAll(/aria-label="Jump to /g)].length, 6)
  })
} finally {
  await server.close()
}
