import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom',
  plugins: [{ name: 'messages-session-boundary', enforce: 'pre', transform(source, id) {
    if (id.split('?')[0].endsWith('/src/components/Attachments.jsx')) return `
      export const AttachButtons = () => null;
      export const AttachmentList = () => null;
      export const AttachmentTray = () => null;
      export const attachmentSummary = () => '';
      export const useAttachments = () => ({ items: [], clear() {} });
    `
    if (id.split('?')[0].endsWith('/src/lib/useSession.js')) return `
      import { useState } from 'react';
      export const useSession = () => ({ signedIn: true, signOut() {} });
      export const useSessionState = (key, initial) => useState(initial);
    `
  } }],
})
try {
  const { default: Messages } = await server.ssrLoadModule('/src/pages/Messages.jsx')
  const { communityDemo } = await server.ssrLoadModule('/src/lib/communityDemo.js')
  test('Joel thread starts empty with no incoming greeting before Kit initiates', () => {
    communityDemo.postComment('kit-messages-test')
    const html = renderToStaticMarkup(createElement(MemoryRouter,
      { initialEntries: ['/messages?c=joel-tan'] }, createElement(Messages)))
    assert.match(html, /Joel Tan/)
    assert.match(html, /Start a conversation/)
    assert.doesNotMatch(html, /Hi Kit! Joel here|Happy to share more local music/)
    assert.doesNotMatch(html, /id="msg-joel-tan-0"/)
    assert.deepEqual(communityDemo.getSnapshot().messages, [])
  })
} finally {
  await server.close()
}
