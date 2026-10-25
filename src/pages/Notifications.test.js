import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
  plugins: [{ name: 'notification-session-boundary', enforce: 'pre', transform(source, id) {
    if (id.split('?')[0].endsWith('/src/lib/useSession.js')) return 'export const useSession = () => ({ signedIn: true, signOut() {} });'
  } }],
})
try {
  const { default: Notifications } = await server.ssrLoadModule('/src/pages/Notifications.jsx')
  const { communityDemo } = await server.ssrLoadModule('/src/lib/communityDemo.js')
  test('notifications start empty with no unread bell badge, while retaining settings', () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Notifications)))
    assert.match(html, /No notifications yet\./)
    assert.doesNotMatch(html, /liked your|started following you|mentioned you in a post|New event added near you|replied to your comment|Weekly digest is ready/)
    assert.match(html, /<button[^>]*disabled=""[^>]*>Mark all as read<\/button>/)
    assert.match(html, /aria-label="Notifications"/)
    assert.doesNotMatch(html, /Notifications \(\d+ unread\)/)
    const bell = html.match(/<a[^>]*aria-label="Notifications"[^>]*>([\s\S]*?)<\/a>/)?.[1]
    assert.ok(bell)
    assert.doesNotMatch(bell, /<span/)
    assert.match(html, /Notification settings/)
    assert.equal((html.match(/role="switch"/g) || []).length, 6)
  })
  test('forum participation produces a visible notification feed with persistent read state', () => {
    communityDemo.postComment('kit-test')
    const render = () => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Notifications)))
    let html = render()
    assert.match(html, /Joel Tan/)
    assert.match(html, /welcomed you to the analogue set discussion/)
    assert.doesNotMatch(html, /No notifications yet/)
    assert.match(html, /Return to event &amp; tickets/)
    communityDemo.markAllRead()
    html = render()
    assert.match(html, /<button[^>]*disabled=""[^>]*>Mark all as read<\/button>/)
    assert.doesNotMatch(html, /aria-label="Unread"/)
  })
} finally {
  await server.close()
}
