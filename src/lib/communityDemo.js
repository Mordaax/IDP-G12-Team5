import db from '../data/db.json' with { type: 'json' }

const artist = db.events.artists.find(item => item.id === 'fallingislands')
export const FIRST_GIG_COMMENT = 'It will be my first time attending an event like this! Really excited to hear them live!\nAnybody synthwave enthusiasts want to go together?'
export const RECOMMENDATION_REQUEST = 'Hi Joel! Thanks for the suggestions in the forum. Do you have any more local Synthwave recommendations?'
export const JOEL_CONVERSATION = [
  { from: 'me', text: RECOMMENDATION_REQUEST },
  { from: 'them', text: 'Yeah sure! Try Kin Leonn for atmospheric electronic sounds and Riot In Magenta for synth-led grooves. U can check out their artist pages and upcoming gigs too.\n\nAre you a new fan of DJ Beatroot by chance?' },
  { from: 'me', text: 'Yeah I am! I really liked their song "Winding Waves". Been listening on repeat for the past few days.' },
  { from: 'them', text: "Awesome :). See you there at battlebox! I'll be there with my friends, do come say hi!" },
  { from: 'me', text: "Sure! See y'all there!" },
]

// Shared for this application load only. Replies survive client-side navigation.
export function createCommunityDemoStore({ schedule = (fn, delay = 1200) => setTimeout(fn, delay) } = {}) {
  let state = { commentId: null, forumReplies: [], messages: [], messagePending: false, messageUnread: false, notifications: [],
    messageDraft: '', conversationIndex: 0, conversationPlaying: false, conversationComplete: false, conversationStopped: false }
  const listeners = new Set()
  let sequence = 0
  let playbackVersion = 0
  const update = patch => {
    state = { ...state, ...patch }
    listeners.forEach(listener => listener())
  }
  const notification = (id, who, text, type, to) => ({ id, who, text, type, to, time: 'just now', read: false })
  const receive = message => ({ messageUnread: true,
    notifications: [notification(message.id, 'Joel Tan', ' sent you a message.', 'Messages', `${db.routes.messages}?c=joel-tan`), ...state.notifications] })
  const queuePlayback = (fn, delay) => {
    const version = playbackVersion
    schedule(() => { if (state.conversationPlaying && version === playbackVersion) fn() }, delay)
  }
  const playStep = () => {
    const step = JOEL_CONVERSATION[state.conversationIndex]
    if (!step) { update({ conversationPlaying: false, conversationComplete: true, messageDraft: '', messagePending: false }); return }
    const deliver = () => {
      const message = { ...step, id: `demo-message-${++sequence}`, at: Date.now() }
      update({ messages: [...state.messages, message], conversationIndex: state.conversationIndex + 1,
        messageDraft: '', messagePending: false, ...(step.from === 'them' ? receive(message) : {}) })
      playStep()
    }
    if (step.from === 'them') {
      update({ messagePending: true })
      queuePlayback(deliver, 650)
    } else {
      let length = state.messageDraft.length
      const typeNext = () => {
        if (length === step.text.length) { queuePlayback(deliver, 350); return }
        update({ messageDraft: step.text.slice(0, ++length) })
        queuePlayback(typeNext, 12)
      }
      queuePlayback(typeNext, 350)
    }
  }
  const pauseConversation = () => {
    if (!state.conversationPlaying) return
    playbackVersion += 1
    update({ conversationPlaying: false, messagePending: false })
  }
  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    startConversation: () => {
      if (!state.commentId || state.conversationPlaying || state.conversationComplete || state.conversationStopped) return
      if (state.messages.length && state.conversationIndex === 0) return
      playbackVersion += 1
      update({ conversationPlaying: true })
      playStep()
    },
    pauseConversation,
    stopConversation: () => { pauseConversation(); update({ conversationStopped: true }) },
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
      pauseConversation()
      const turn = state.messages.filter(message => message.from === 'them').length
      const answer = JOEL_CONVERSATION.filter(message => message.from === 'them')[turn]
      const id = `demo-message-${++sequence}`
      update({ messages: [...state.messages, { id, from: 'me', text: text.trim(), at: Date.now() }], messagePending: !!answer, conversationStopped: true, messageDraft: '' })
      if (!answer) return true
      schedule(() => {
        const reply = { id: `${id}-reply`, from: 'them', text: answer.text, at: Date.now() }
        update({ messages: [...state.messages, reply], messagePending: false, ...receive(reply) })
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
