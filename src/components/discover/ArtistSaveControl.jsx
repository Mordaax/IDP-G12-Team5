import { useEffect } from 'react'
import { useArtistSaveStudy } from '@/lib/useArtistSaveStudy'
import { artistProfileState } from '@/lib/session'

export default function ArtistSaveControl({ artist, onChange }) {
  const { variant, ready, savedIds, study, preview } = useArtistSaveStudy()
  const saved = savedIds.includes(artist.artistId)
  useEffect(() => {
    if (!preview && artist.artistId === 'dj-beatroot' && artistProfileState.getSnapshot().saved) {
      study.setSaved(artist.artistId, true, { track: false })
    }
    if (ready) study.expose(artist.artistId)
  }, [artist.artistId, ready, study, preview])
  const toggle = () => {
    study.setSaved(artist.artistId, !saved)
    if (!preview && artist.artistId === 'dj-beatroot') artistProfileState.setSaved(!saved)
    onChange(!saved, variant)
  }
  return <button type="button" disabled={!ready} onClick={toggle} aria-pressed={saved}
    aria-label={`${variant === 'heart' ? (saved ? 'Unlike' : 'Like') : (saved ? 'Unfollow' : 'Follow')} ${artist.name}`}
    title={variant === 'heart' ? (saved ? 'Unlike artist' : 'Like artist') : undefined}
    className={`flex h-[36px] flex-1 items-center justify-center rounded-control text-[12px] font-semibold disabled:opacity-50 ${saved ? 'border-[1.5px] border-ink text-ink' : 'bg-accent text-on-accent hover:bg-accent-hover'}`}>
    {variant === 'heart' ? <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg> : saved ? 'Following ✓' : 'Follow'}
  </button>
}
