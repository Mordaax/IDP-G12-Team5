import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf8')
const guide = css.split(':root[data-theme="style-guide"] {')[1].split('\n}')[0]
test('guide overlay radius matches its 16px shape specimen', () => {
  assert.match(guide, /--lrm-radius-panel:\s*16px;/)
})
test('guide card elevation matches its restrained shape specimen', () => {
  assert.match(guide, /--lrm-shadow-card:\s*0 2px 8px #27252212;/)
})
test('guide overlay elevation matches its shape specimen', () => {
  assert.match(guide, /--lrm-shadow-panel:\s*0 12px 36px #27252222;/)
})
