// Emoji panel with categories and "recently used" — used for message reactions and the composer.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { sessionGet, sessionSet } from '@/lib/session'

/**
 * Floats `children` next to `anchor` (a DOM element) on top of the whole page, so scrolling
 * containers can't cut it off. Opens above the anchor, or below when there isn't room above.
 * `align="end"` lines up right edges, otherwise left edges.
 */
export function Popover({ anchor, align = 'start', gap = 8, children, ...props }) {
  const box = useRef(null)
  const [style, setStyle] = useState({ visibility: 'hidden', top: 0, left: 0 })
  const place = () => {
    if (!anchor || !box.current) return
    const a = anchor.getBoundingClientRect()
    const { width, height } = box.current.getBoundingClientRect()
    const margin = 8
    const top = a.top - height - gap >= margin ? a.top - height - gap : Math.min(a.bottom + gap, window.innerHeight - height - margin)
    const wanted = align === 'end' ? a.right - width : a.left
    const left = Math.max(margin, Math.min(wanted, window.innerWidth - width - margin))
    const next = { top: Math.max(margin, top), left }
    setStyle((old) => (old.top === next.top && old.left === next.left && !old.visibility ? old : next))
  }
  useLayoutEffect(place)
  useEffect(() => {
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place) }
  }) // eslint-disable-line react-hooks/exhaustive-deps
  return createPortal(<div ref={box} className="fixed z-[2500]" style={style} {...props}>{children}</div>, document.body)
}

export const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍']

const GROUPS = [
  { id: 'smileys', icon: '😀', label: 'Smileys', emoji: '😀 😃 😄 😁 😆 😅 🤣 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😏 😒 🙄 😬 😮‍💨 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 🥴 😵 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 👻 👽 🤖 💩 🤡' },
  { id: 'gestures', icon: '👍', label: 'People', emoji: '👍 👎 👏 🙌 🫶 👐 🤲 🤝 🙏 ✌️ 🤞 🫰 🤟 🤘 👌 🤌 🤏 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤙 💪 🦾 ✍️ 🤳 💅 👀 👁️ 👄 🫦 🧠 🫀 🙋 🙆 🙅 🤷 🤦 💃 🕺 👯 🧑‍🎤 👩‍🎤 👨‍🎤 🧑‍🤝‍🧑 🫂' },
  { id: 'hearts', icon: '❤️', label: 'Hearts', emoji: '❤️ 🧡 💛 💚 🩵 💙 💜 🤎 🖤 🩶 🤍 🩷 💔 ❤️‍🔥 ❤️‍🩹 💕 💞 💓 💗 💖 💘 💝 💟 ❣️ 💌 💋 😻 🥰 😍 💯 💢 💥 💫 💦 💨 🔥 ✨ 🌟 ⭐ ⚡' },
  { id: 'music', icon: '🎵', label: 'Music', emoji: '🎵 🎶 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🪈 📻 🎙️ 🔊 🔉 📢 📣 🎚️ 🎛️ 💿 📀 🎬 🎭 🎫 🎟️ 🪩 🎪 🎉 🎊 🥳 🍾 🥂 🍻 🕺 💃 🪅' },
  { id: 'activities', icon: '⚽', label: 'Activities', emoji: '⚽ 🏀 🏈 ⚾ 🎾 🏐 🏓 🏸 🥊 🎯 🎳 🎮 🕹️ 🎲 🧩 ♟️ 🎨 🖌️ 📸 📷 🎥 📹 🏆 🥇 🥈 🥉 🏅 🎖️ 🛹 🏄 🚴 🧘 🏋️ 🤸' },
  { id: 'food', icon: '🍕', label: 'Food', emoji: '🍕 🍔 🍟 🌭 🌮 🌯 🥙 🍜 🍝 🍣 🍱 🥟 🍤 🍙 🍚 🍛 🥘 🍲 🥗 🍿 🧋 ☕ 🍵 🥤 🧃 🍺 🍷 🍸 🍹 🍦 🍩 🍪 🎂 🍰 🧁 🍫 🍬 🍭 🍎 🍉 🍓 🍒 🥭 🍍 🥑 🌶️' },
  { id: 'nature', icon: '🌸', label: 'Nature', emoji: '🌸 🌺 🌻 🌹 🌷 🌼 💐 🍀 🌿 🌱 🌴 🌵 🍁 🍂 🌙 🌛 ☀️ 🌤️ ⛅ 🌧️ ⛈️ 🌈 ❄️ ☃️ 🌊 🌋 🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🦄 🐝 🦋 🐢 🐙 🐬 🐳' },
  { id: 'travel', icon: '🚇', label: 'Travel', emoji: '🚇 🚆 🚌 🚕 🚗 🛵 🚲 ✈️ 🚀 🛸 🚢 ⛴️ 🏙️ 🌃 🌆 🌉 🎡 🎢 🏟️ 🏛️ 🗼 🏝️ 🏖️ ⛰️ 🏕️ 🗺️ 📍 🧭 ⏰ ⌛ 📅 🎒 🧳 🇸🇬' },
  { id: 'symbols', icon: '💬', label: 'Symbols', emoji: '💬 💭 🗯️ ✅ ☑️ ✔️ ❌ ❎ ➕ ➖ ❓ ❗ ‼️ ⁉️ 💤 🆗 🆒 🆕 🆙 🔝 🔜 🔛 🔚 🎵 ♻️ ⚠️ 🚫 ⛔ 🔞 📌 📎 🔗 🔒 🔓 🔔 🔕 🏳️‍🌈 🏁' },
].map((group) => ({ ...group, emoji: group.emoji.split(' ') }))

/** A panel of emoji. `onPick(emoji)` is called for each choice; the panel stays open unless `closeOnPick`. */
export default function EmojiPanel({ onPick, selected, className = '', label = 'Choose an emoji' }) {
  // saved straight away: the panel often closes in the same click, before React would store it
  const [recent, setRecent] = useState(() => sessionGet('emoji.recent', []))
  const [tab, setTab] = useState(recent.length ? 'recent' : 'smileys')
  const groups = [{ id: 'recent', icon: '🕘', label: 'Recently used', emoji: recent }, ...GROUPS]
  const active = groups.find((group) => group.id === tab) || groups[1]
  const pick = (emoji) => {
    const next = [emoji, ...sessionGet('emoji.recent', []).filter((item) => item !== emoji)].slice(0, 24)
    sessionSet('emoji.recent', next)
    setRecent(next)
    onPick(emoji)
  }
  return <div data-emoji-panel className={`flex w-[324px] max-w-[calc(100vw-16px)] flex-col overflow-hidden rounded-[14px] border border-line bg-white shadow-xl ${className}`} role="dialog" aria-label={label}>
    <div className="flex gap-[1px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-divider px-[4px] py-[4px]" role="tablist" aria-label="Emoji categories">
      {groups.map((group) => <button key={group.id} type="button" role="tab" aria-selected={tab === group.id} aria-label={group.label} title={group.label} onClick={() => setTab(group.id)}
        className={`flex size-[30px] shrink-0 items-center justify-center rounded-[8px] text-[16px] ${tab === group.id ? 'bg-soft' : 'opacity-60 hover:bg-wash hover:opacity-100'}`}>{group.icon}</button>)}
    </div>
    <p className="m-0 px-[10px] pt-[8px] text-[11px] font-semibold text-subtle">{active.label}</p>
    <div className="grid max-h-[210px] grid-cols-9 gap-[2px] overflow-y-auto p-[6px]" role="tabpanel">
      {active.emoji.length ? active.emoji.map((emoji) => <button key={emoji} type="button" onClick={() => pick(emoji)} aria-label={emoji} aria-pressed={selected === emoji}
        className={`flex size-[32px] items-center justify-center rounded-[8px] text-[20px] transition-transform hover:scale-125 hover:bg-wash ${selected === emoji ? 'bg-soft' : ''}`}>{emoji}</button>)
        : <p className="col-span-9 m-0 py-[20px] text-center text-[12px] text-subtle">Emoji you use will show up here</p>}
    </div>
  </div>
}
