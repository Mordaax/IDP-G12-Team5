import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'})
try {
  const {default: SocialLinks} = await server.ssrLoadModule('/src/components/discover/ArtistSocialLinks.jsx')
  test('artist card has four named social links with platform logo assets', () => {
    const html = renderToStaticMarkup(createElement(SocialLinks,{artist:{name:'DJ Beatroot',links:{instagram:'https://www.instagram.com/example_artist/'}}}))
    assert.equal((html.match(/<a /g)||[]).length,4)
    for (const platform of ['instagram','tiktok','spotify','soundcloud']) assert.ok(html.includes(`social-${platform}.svg`))
    for (const label of ['Instagram','TikTok','Spotify','SoundCloud']) assert.ok(html.includes(label))
    assert.match(html,/href="https:\/\/www.instagram.com\/example_artist\/"/)
    assert.match(html,/https:\/\/www.tiktok.com\/search\?q=DJ%20Beatroot/)
    assert.match(html,/https:\/\/open.spotify.com\/search\/DJ%20Beatroot/)
    assert.match(html,/https:\/\/soundcloud.com\/search\?q=DJ%20Beatroot/)
    assert.equal((html.match(/rel="noopener noreferrer"/g)||[]).length,4)
  })
  test('missing or unsafe profile links fall back to a labelled artist search', () => {
    const html = renderToStaticMarkup(createElement(SocialLinks,{artist:{name:'Band & Friends',links:{spotify:'javascript:alert(1)'}}}))
    assert.doesNotMatch(html,/javascript:/)
    assert.match(html,/Find Band &amp; Friends on Spotify/)
    assert.match(html,/Band%20%26%20Friends/)
  })
} finally {await server.close()}
