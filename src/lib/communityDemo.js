import db from '../data/db.json' with { type: 'json' }

const artist = db.events.artists.find(item => item.id === 'fallingislands')
export const FIRST_GIG_COMMENT = 'It will be my first time attending an event like this! Really excited to hear them live!\nAnybody synthwave enthusiasts want to go together?'
export const RECOMMENDATION_REQUEST = 'Hi Joel! Thanks for the suggestions in the forum. Do you have any more local Synthwave recommendations?'

// Shared for this application load only. Replies survive client-side navigation.
export function createCommunityDemoStore({ schedule = fn => setTimeout(fn, 1200) } = {}) {
  let state = { commentId: null, forumReplies: [], messages: [], messagePending: false, messageUnread: false, notifications: [] }
  const listeners = new Set()
  let sequence = 0
  const update = patch => {
    state = { ...state, ...patch }
    listeners.forEach(listener => listener())
  }
  const notification = (id, who, text, type, to) => ({ id, who, text, type, to, time: 'just now', read: false })
  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    postComment: id => {
      if (state.commentId) return
      update({
        commentId: id,
        forumReplies: [
          { id: 'demo-artist-reply', who: artist.name, badge: 'OP · ARTIST', ago: 'just now', minutesAgo: 0, votes: 0, body: 'Welcome, Kit! A first synthwave gig is something special. We’re bringing the full analogue rig — come say hi after the set!' },
          { id: 'demo-listener-reply', who: 'Joel Tan', ago: 'just now', minutesAgo: 0, votes: 0, body: 'You’ll love it! I recommend checking out Kin Leonn and Riot In Magenta too if you enjoy these sounds. Message me if you’d like more local recommendations.' },
        ],
        notifications: [
          notification('forum-joel', 'Joel Tan', ' replied to your first-gig comment with local music recommendations.', 'Replies', `${db.routes.thread}#comment-${id}`),
          notification('forum-artist', artist.name, ' welcomed you to the analogue set discussion.', 'Replies', `${db.routes.thread}#comment-${id}`),
          ...state.notifications,
        ],
      })
    },
    sendMessage: text => {
      if (!state.commentId || !text.trim() || state.messagePending) return false
      const id = `demo-message-${++sequence}`
      update({ messages: [...state.messages, { id, from: 'me', text: text.trim(), at: Date.now() }], messagePending: true })
      schedule(() => {
        const reply = { id: `${id}-reply`, from: 'them', text: 'Absolutely! Try Kin Leonn for atmospheric electronic sounds and Riot In Magenta for synth-led grooves. Their artist pages and upcoming gigs are a great place to keep exploring. See you at the analogue set!', at: Date.now() }
        update({ messages: [...state.messages, reply], messagePending: false, messageUnread: true,
          notifications: [notification(id, 'Joel Tan', ' sent you local Synthwave recommendations.', 'Messages', `${db.routes.messages}?c=joel-tan`), ...state.notifications] })
      })
      return true
    },
    openMessages: () => { if (state.messageUnread) update({ messageUnread: false }) },
    setArtistSaved: saved => {
      const remaining = state.notifications.filter(item => item.id !== 'saved-artist')
      if (saved && remaining.length === state.notifications.length) update({ notifications: [notification('saved-artist', artist.name, ' is now in your saved artists. Explore their music and upcoming performances.', 'Follows', db.routes.artist), ...remaining] })
      else if (!saved && remaining.length !== state.notifications.length) update({ notifications: remaining })
    },
    markRead: id => update({ notifications: state.notifications.map(item => item.id === id ? { ...item, read: true } : item) }),
    markAllRead: () => update({ notifications: state.notifications.map(item => ({ ...item, read: true })) }),
  }
}

export const communityDemo = createCommunityDemoStore()
