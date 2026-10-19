import db from '../../data/db.json' with { type: 'json' }

export const FORUM_CATEGORIES = [
  { id: 'all', label: 'All discussions', path: '/forum' },
  { id: 'events', label: 'Events & Shows', path: '/forum/events' },
  { id: 'artists', label: 'Artists & bands', path: '/forum/artists' },
  { id: 'gear', label: 'Gear & production', path: '/forum/gear' },
  { id: 'saved', label: 'Saved forums', path: '/forum/saved' },
]

const featuredTopics = [
  {
    id: 'battlebox', category: 'events', title: 'Playing the full synth set at BattleBox on Sunday',
    author: 'FallingIslands', authorArtist: true, body: 'We’re bringing the analogue rig down into the bunker. Come say hi after the set.',
    createdAt: 600, ago: '2h ago', votes: 24, eventId: 'fallingislands-battlebox',
    comments: [
      { id: 'synthkid', who: 'synthkid', ago: '1h ago', minutesAgo: 60, body: 'An analogue set in the bunker? This is going to sound unreal.', votes: 12,
        replies: [{ id: 'op', who: 'FallingIslands', badge: 'OP · ARTIST', ago: '45m ago', minutesAgo: 45, body: 'That’s the plan! Come say hi after the set.', votes: 8 }] },
      { id: 'nightbus', who: 'nightbus', ago: '32m ago', minutesAgo: 32, body: 'Been waiting to hear the full synth set live. See you on Sunday!', votes: 5 },
      { id: 'waveform', who: 'waveform', ago: '10m ago', minutesAgo: 10, body: 'What synths are you bringing? Would love a closer look at the rig after the set.', votes: 3 },
    ],
  },
  { id: 'gamelan-lawn', category: 'events', title: 'Who else is going to Gamelan on the Lawn?', author: 'sunsetlistener', body: 'I’m heading to Bay East for the outdoor set. Anyone want to meet near the entrance before it starts?', createdAt: 500, ago: '3h ago', votes: 18, eventId: 'loka-nada-bay-east', comments: [
    { id: 'gamelan-1', who: 'nightbus', ago: '2h ago', minutesAgo: 120, body: 'I’ll be there. Looking forward to hearing the gamelan outdoors.', votes: 6 },
    { id: 'gamelan-2', who: 'kitbeats', ago: '1h ago', minutesAgo: 60, body: 'The lawn is easy to find from the MRT side. See you there!', votes: 3 },
  ] },
  { id: 'local-rnb', category: 'artists', title: 'Best local R&B artists?', author: 'softfocus', body: 'I’m looking for Singapore R&B artists to add to my playlist. Who should I hear first?', createdAt: 400, ago: '5h ago', votes: 31, comments: [
    { id: 'rnb-1', who: 'waveform', ago: '4h ago', minutesAgo: 240, body: 'Start with a live set if you can. The smaller rooms are where I keep finding favourites.', votes: 8 },
  ] },
  { id: 'lullaboy-setlist', category: 'events', title: 'Lullaboy live at BattleBox — setlist guesses', author: 'nightbus', body: 'What songs are you hoping make the setlist? I’m hoping for a quiet encore.', createdAt: 300, ago: '7h ago', votes: 15, eventId: 'lullaboy-live-battlebox', comments: [
    { id: 'lullaboy-1', who: 'synthkid', ago: '6h ago', minutesAgo: 360, body: 'A stripped-back version near the end would be perfect.', votes: 4 },
  ] },
  { id: 'late-transmission', category: 'events', title: 'Late Transmission: worth the trip?', author: 'waveform', body: 'Considering the BattleBox show. Has anyone caught this act live before?', createdAt: 200, ago: '9h ago', votes: 9, eventId: 'late-transmission-battlebox', comments: [
    { id: 'late-1', who: 'nightbus', ago: '8h ago', minutesAgo: 480, body: 'The last set had a great atmosphere. I’d go again.', votes: 3 },
  ] },
  { id: 'home-studio', category: 'gear', title: 'What is in your home recording setup?', author: 'synthkid', body: 'Looking for ideas for a small recording corner. What gear has stayed in your setup?', createdAt: 100, ago: '1d ago', votes: 11, comments: [
    { id: 'studio-1', who: 'waveform', ago: '20h ago', minutesAgo: 1200, body: 'A simple interface and a quiet room helped me more than another plug-in.', votes: 7 },
  ] },
]

const artistNames = new Map(db.events.artists.map((artist) => [artist.id, artist.name]))
const venueNames = new Map(db.events.venues.map((venue) => [venue.id, venue.fullName]))
const featuredEventIds = new Set(featuredTopics.map((topic) => topic.eventId).filter(Boolean))

const eventTopics = db.events.events
  .filter((event) => !featuredEventIds.has(event.id))
  .map((event, index) => ({
    id: `event-${event.id}`,
    category: 'events',
    title: `${event.name || `${artistNames.get(event.headliner)} @ ${venueNames.get(event.venueId)}`} discussion`,
    author: artistNames.get(event.headliner),
    body: event.about,
    createdAt: -index - 1,
    ago: 'Event discussion',
    votes: 0,
    eventId: event.id,
    comments: [],
  }))

export const FORUM_TOPICS = [...featuredTopics, ...eventTopics]
export const eventTopicFor = (eventId) => FORUM_TOPICS.find((topic) => topic.eventId === eventId)

export const topicUrl = (topic) => topic.id === 'battlebox' ? '/forum/battlebox' : `/forum/topics/${topic.id}`

export function visibleTopics(topics, category = 'all', query = '', savedIds = []) {
  const needle = query.trim().toLowerCase()
  return topics.filter(topic =>
    (category === 'all' || (category === 'saved' ? savedIds.includes(topic.id) : topic.category === category)) &&
    (!needle || `${topic.title} ${topic.body} ${topic.author}`.toLowerCase().includes(needle)),
  ).sort((a, b) => b.createdAt - a.createdAt)
}

export function sortComments(comments, sort = 'best', votes = {}) {
  return [...comments].sort((a, b) => {
    if (sort === 'newest') return (a.minutesAgo ?? 0) - (b.minutesAgo ?? 0)
    if (sort === 'oldest') return (b.minutesAgo ?? 0) - (a.minutesAgo ?? 0)
    return (b.votes + (votes[b.id] || 0)) - (a.votes + (votes[a.id] || 0))
  })
}

export function countComments(comments, mine = []) {
  return comments.reduce((count, comment) => count + 1 + (comment.replies?.length || 0), mine.length)
}
