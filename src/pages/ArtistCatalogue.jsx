import { useState } from 'react'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { ARTISTS, GENRES, GENRE_BY_KEY, SUBGENRE_BY_ID, ROUTES } from '@/data'

export default function ArtistCatalogue() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('all')
  const term = query.trim().toLowerCase()
  const visible = ARTISTS.filter(artist => (genre === 'all' || artist.primaryGenreId === genre) && [artist.name, ...artist.languages, ...artist.subgenreIds.map(id => SUBGENRE_BY_ID[id].label)].join(' ').toLowerCase().includes(term))
  return <Page active="artists"><main className="mx-auto w-full max-w-[1440px] px-[80px] py-[40px]">
    <div className="flex items-end justify-between gap-[24px]"><div><p className="m-0 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">Find your next sound</p><h1 className="font-display m-0 mt-[12px] text-[44px] font-semibold text-ink">Artist catalogue</h1><p className="mt-[12px] text-[14px] text-muted">{ARTISTS.length} artists across {GENRES.length} scenes.</p></div><Link to={ROUTES.discover} className="rounded-control border border-line bg-surface px-[18px] py-[12px] text-[13px] font-semibold text-ink hover:bg-soft">Explore the map →</Link></div>
    <div className="my-[28px] flex items-end gap-[16px] rounded-panel border border-line bg-surface p-[20px]">
      <label className="flex flex-1 flex-col gap-[8px] text-[12px] font-semibold text-ink">Search artists<input type="search" aria-label="Search the artist catalogue" value={query} onChange={event => setQuery(event.target.value)} placeholder="Artist, subgenre or language" className="min-h-[44px] rounded-control border border-line bg-surface px-[14px] text-[14px] font-normal" /></label>
      <label className="flex w-[260px] flex-col gap-[8px] text-[12px] font-semibold text-ink">Main genre<select aria-label="Main genre" value={genre} onChange={event => setGenre(event.target.value)} className="min-h-[44px] rounded-control border border-line bg-surface px-[12px] text-[14px] font-normal"><option value="all">All genres</option>{GENRES.map(family => <option key={family.key} value={family.key}>{family.name}</option>)}</select></label>
    </div>
    <p role="status" className="mb-[20px] text-[13px] text-muted">{visible.length} of {ARTISTS.length} artists</p>
    <div className="grid grid-cols-4 gap-[18px]">{visible.map(artist => {
      const family = GENRE_BY_KEY[artist.primaryGenreId], child = SUBGENRE_BY_ID[artist.subgenreIds[0]]
      return <Link key={artist.id} data-catalogue-artist={artist.id} to={`/artists/${artist.id}`} className="group overflow-hidden rounded-card border border-line bg-surface shadow-[var(--lrm-shadow-card)] transition-colors hover:bg-soft">
        <div aria-hidden="true" className="flex h-[130px] items-center justify-center font-display text-[40px] font-semibold text-on-accent" style={{ background: child.colour.css, color: child.colour.foreground ?? '#fff' }}>{artist.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}</div>
        <div className="p-[18px]"><h2 className="font-display m-0 text-[18px] font-semibold text-ink group-hover:underline">{artist.name}</h2><p className="mb-0 mt-[8px] text-[12px] text-muted">{family.name}</p><span className="mt-[12px] inline-flex items-center gap-[6px] rounded-full border border-line px-[9px] py-[4px] text-[11px] text-ink"><span aria-hidden="true" className="size-[6px] rounded-full" style={{ background: child.colour.css }} />{child.label}</span></div>
      </Link>
    })}</div>
    {!visible.length && <div className="rounded-panel border border-dashed border-line p-[32px] text-[14px] text-muted">No artists match these filters. Try another name or genre.</div>}
  </main></Page>
}
