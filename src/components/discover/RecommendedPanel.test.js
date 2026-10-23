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
  })
} finally {
  await server.close()
}
