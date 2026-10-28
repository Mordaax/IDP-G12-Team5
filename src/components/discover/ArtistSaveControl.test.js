import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

for (const variant of ['control', 'heart']) {
  for (const saved of [false, true]) test(`${variant} control is accessible with saved=${saved}`, async () => {
    const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
      plugins: [{ name: 'study-test-boundary', enforce: 'pre', transform(source, id) {
        if (id.split('?')[0].endsWith('/src/lib/useArtistSaveStudy.js')) return `export const useArtistSaveStudy = () => ({ ready: true, savedIds: ${saved ? "['artist-a']" : '[]'}, preview: true, study: {} })`
        if (id.split('?')[0].endsWith('/src/lib/useVariant.js')) return `export const useVariant = () => '${variant}'`
      } }],
    })
    try {
      const { default: Control } = await server.ssrLoadModule('/src/components/discover/ArtistSaveControl.jsx')
      const html = renderToStaticMarkup(createElement(Control, { artist: { artistId: 'artist-a', name: 'Artist A' }, onChange() {} }))
      assert.match(html, new RegExp(`aria-label="${variant === 'heart' ? (saved ? 'Unlike' : 'Like') : (saved ? 'Unfollow' : 'Follow')} Artist A"`))
      assert.match(html, new RegExp(`aria-pressed="${saved}"`))
      if (variant === 'heart') {
        assert.match(html, /<svg/)
        assert.match(html, /h-\[44px\]/)
        assert.match(html, /focus-visible:outline-2/)
      }
      else assert.match(html, saved ? />Following ✓<\/button>/ : />Follow<\/button>/)
    } finally { await server.close() }
  })
}
