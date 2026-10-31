import { useParams } from 'react-router-dom'
import Link from '@/components/AppLink'
import { Page } from '@/components/Layout'
import { ARTISTS, ARTIST_BY_ID, SUBGENRE_BY_ID, GENRE_BY_KEY, SHARED_AUDIENCES, ROUTES } from '@/data'
import { useShare, useToast } from '@/lib/toast'
import { useSession, useSessionState } from '@/lib/useSession'

const secondaryAction = 'flex min-h-[44px] items-center justify-center gap-[8px] rounded-control border border-line bg-surface px-[16px] text-[13px] font-semibold text-ink transition-colors hover:bg-soft'
const socials = [['instagram', 'Instagram'], ['twitter', 'X (Twitter)'], ['spotify', 'Spotify'], ['youtube', 'YouTube']]

const number = new Intl.NumberFormat('en-SG')
const quietLink = 'inline-flex min-h-[44px] items-center gap-[8px] rounded-control text-[14px] font-semibold text-muted transition-colors hover:text-accent hover:underline'
const heading = 'font-display m-0 text-[24px] leading-[1.3] font-semibold text-ink'

function familyFor(artist) {
  return GENRE_BY_KEY[artist.primaryGenreId]
}

function ArtistAvatar({ artist, compact = false }) {
  const initials = artist.name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join('').toUpperCase()
  const colour = familyFor(artist)?.dot || SUBGENRE_BY_ID[artist.subgenreIds?.[0]]?.colour?.css || 'var(--lrm-muted)'
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-card ${compact ? 'size-[56px]' : 'aspect-square w-full'}`} style={{ background: colour, color: 'var(--lrm-on-accent)' }}>
      {artist.images?.avatar
        ? <img src={artist.images.avatar} alt={compact ? '' : artist.name} className="size-full object-cover" />
        : <span aria-hidden="true" className={`font-display font-semibold ${compact ? 'text-[20px]' : 'text-[88px] leading-none'}`}>{initials}</span>}
    </div>
  )
}

function GenreBadge({ label, colour }) {
  return <span className="inline-flex min-h-[30px] items-center gap-[8px] rounded-full border border-line bg-surface px-[12px] py-[4px] text-[12px] font-medium text-ink"><span aria-hidden="true" className="size-[8px] shrink-0 rounded-full" style={{ background: colour || 'var(--lrm-muted)' }} />{label}</span>
}

function EmptySection({ id, title, message, detail, slots = false }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className={`${heading} mb-[16px]`}>{title}</h2>
      {slots ? <>
        <div className="grid grid-cols-3 gap-[16px]" aria-label={`${title} placeholder slots`}>
          {[1, 2, 3].map(slot => <div key={slot} className="min-w-0 overflow-hidden rounded-card border border-line bg-surface">
            <div aria-hidden="true" className="flex aspect-[4/3] items-center justify-center border-b border-line bg-soft text-[32px] text-faint">♫</div>
            <div className="p-[16px]"><p className="m-0 text-[14px] font-semibold text-muted">{title === 'Albums & Singles' ? 'Release' : 'Event'} slot {slot}</p><p className="m-0 mt-[6px] text-[12px] text-muted">Placeholder · not announced</p></div>
          </div>)}
        </div>
        <p className="m-0 mt-[12px] text-[13px] leading-[1.5] text-muted"><strong className="font-semibold">{message}.</strong> {detail}</p>
      </> : <div className="rounded-card border border-dashed border-line bg-soft px-[24px] py-[32px]">
        <p className="m-0 text-[14px] font-semibold text-ink">{message}</p><p className="m-0 mt-[6px] text-[13px] leading-[1.5] text-muted">{detail}</p>
      </div>}
    </section>
  )
}

function SaveArtistButton({ artist }) {
  const { requireLogin } = useSession()
  const [saved, setSaved] = useSessionState(`artist.${artist.id}.saved`, false)
  const toast = useToast()
  return (
    <button type="button" aria-pressed={saved} onClick={() => requireLogin(() => { setSaved(!saved); toast(saved ? `Unfollowed ${artist.name}` : `Following ${artist.name}`) })} className="flex min-h-[44px] items-center justify-center gap-[8px] rounded-control bg-accent px-[20px] text-[13px] font-semibold text-on-accent transition-colors hover:bg-accent-hover">{saved ? 'Following' : 'Follow artist'}</button>
  )
}

export default function CatalogueArtistPage() {
  const { artistId } = useParams()
  const { signedIn } = useSession()
  const share = useShare()
  const discoverPath = signedIn ? ROUTES.forYou : ROUTES.discover
  const artist = Object.hasOwn(ARTIST_BY_ID, artistId) ? ARTIST_BY_ID[artistId] : ARTISTS.find(item => item.id === artistId)

  if (!artist) {
    return <Page active="artists"><main className="mx-auto w-full max-w-[1440px] px-[80px] py-[48px]"><Link to={discoverPath} className={quietLink}><span aria-hidden="true">←</span> Back to Discover</Link><section className="mt-[24px] rounded-panel border border-line bg-surface p-[48px]"><p className="m-0 mb-[12px] text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">Artist catalogue</p><h1 className="font-display m-0 text-[44px] leading-[1.2] font-semibold text-ink">Artist not found</h1><p className="m-0 mt-[16px] text-[14px] leading-[1.65] text-muted">This artist is not in the catalogue. Head back to Discover to find another sound.</p><Link to={discoverPath} className="mt-[24px] inline-flex min-h-[44px] items-center rounded-control bg-accent px-[20px] text-[14px] font-semibold text-on-accent transition-colors hover:bg-accent-hover">Explore Discover →</Link></section></main></Page>
  }

  const families = [...new Set([artist.primaryGenreId, ...(artist.genreIds || [])])].map(key => GENRE_BY_KEY[key]).filter(Boolean)
  const subgenres = [...new Set(artist.subgenreIds || [])].map(id => SUBGENRE_BY_ID[id]).filter(Boolean)
  const languages = (artist.languages || []).map(language => /^instrumental$/i.test(language) ? 'Instrumental' : language)
  const links = Object.entries(artist.links || {}).filter(([, url]) => typeof url === 'string' && /^https?:\/\//i.test(url))
  // Each undirected edge is its own overlap. Never add these into a fan total.
  const related = SHARED_AUDIENCES.flatMap(edge => {
    const otherId = edge.sourceArtistId === artist.id ? edge.targetArtistId : edge.targetArtistId === artist.id ? edge.sourceArtistId : null
    const other = otherId && Object.hasOwn(ARTIST_BY_ID, otherId) ? ARTIST_BY_ID[otherId] : null
    return other ? [{ edge, artist: other }] : []
  }).sort((a, b) => b.edge.sharedListenerCount - a.edge.sharedListenerCount || a.artist.name.localeCompare(b.artist.name))

  return (
    <Page active="artists">
      <main className="mx-auto w-full max-w-[1440px] px-[clamp(20px,5.5vw,80px)] pb-[60px] pt-[24px]">
        <div className="mb-[24px] flex flex-wrap items-center justify-between gap-[16px]">
          <Link to="/artists" className={quietLink}><span aria-hidden="true">←</span> Back to Artists</Link>
          <div className="flex flex-wrap gap-[8px]">
            <SaveArtistButton key={artist.id} artist={artist} />
            <button type="button" onClick={() => share(artist.name)} className={secondaryAction}>Share</button>
            <Link to="/forum/artists" className={secondaryAction}>Forum threads</Link>
          </div>
        </div>

        {/* Keep the desktop columns at every fitted viewport; do not add responsive breakpoints. */}
        <div className="grid grid-cols-[320px_minmax(0,1fr)] items-start gap-[48px]">
          <aside aria-label="Artist details" className="flex min-w-0 flex-col gap-[24px]">
            <ArtistAvatar artist={artist} />
            <div>
              <p className="m-0 mb-[8px] text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">Artist · Singapore</p>
              <h1 id="artist-name" className="font-display m-0 break-words text-[32px] leading-[1.2] font-semibold text-ink">{artist.name}</h1>
              <p className="m-0 mt-[12px] text-[14px] leading-[1.65] text-muted">{artist.bio || artist.summary || 'Biography coming soon.'}</p>
            </div>
            <div>
              <nav aria-label="Artist social media" className="flex flex-wrap gap-[12px]">
                {socials.map(([key, label]) => {
                  const url = links.find(([name]) => name === key || (key === 'twitter' && name === 'x'))?.[1]
                  const icon = <img src={`/assets/icons/social-${key}.svg`} alt="" width="44" height="44" />
                  return url ? <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${artist.name} on ${label}`} title={label} className="block size-[44px] rounded-full transition-transform hover:scale-110">{icon}</a> : <button key={key} type="button" disabled aria-label={`${label} link not available`} title={`${label} link not available`} className="block size-[44px] rounded-full opacity-40">{icon}</button>
                })}
              </nav>
              {!links.length && <p className="m-0 mt-[8px] text-[11px] text-subtle">No artist links added yet.</p>}
              {links.filter(([key]) => !socials.some(([social]) => social === key) && key !== 'x').map(([key, url]) => <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={`${quietLink} mr-[12px] capitalize`}>{key} ↗</a>)}
            </div>
            <section aria-labelledby="genres-heading">
              <h2 id="genres-heading" className="font-display m-0 mb-[12px] text-[18px] font-semibold text-ink">Genres &amp; Subgenres</h2>
              <div className="flex flex-wrap gap-[8px]">{families.map(item => <GenreBadge key={item.key} label={item.name || item.label} colour={item.dot} />)}{subgenres.map(item => <GenreBadge key={item.id} label={item.label} colour={item.colour?.css} />)}</div>
              <p className="m-0 mt-[12px] text-[12px] leading-[1.65] text-muted">{languages.length ? languages.join(' · ') : artist.languageStatus === 'instrumental-demo' ? 'Instrumental' : 'Languages not specified yet'}</p>
            </section>
            <div className="border-t border-line pt-[20px]">
              <p className="m-0 text-[14px] text-muted"><strong className="text-[24px] font-semibold text-ink">Not available</strong><br />listeners on LittleRedMusic</p>
              <p className="m-0 mt-[6px] text-[11px] text-subtle">No platform listener total supplied.</p>
              <p className="m-0 mt-[12px] text-[11px] leading-[1.5] text-subtle">Fictional artist · prototype catalogue</p>
            </div>
          </aside>

          <div className="flex min-w-0 flex-col gap-[40px]">
            <EmptySection id="releases-heading" title="Albums & Singles" message="No releases yet" detail="Releases will appear here when they are added to the catalogue." slots />
            <EmptySection id="upcoming-heading" title="Upcoming Events" message="No upcoming events" detail="No shows are linked to this fictional artist." slots />
            <EmptySection id="past-heading" title="Past Events" message="No past events yet" detail="Shows played on LittleRedMusic will appear here when added to the catalogue." />
            <section aria-labelledby="related-heading" className="border-t border-line pt-[32px]">
              <div className="mb-[16px] flex items-baseline justify-between gap-[16px]"><h2 id="related-heading" className={heading}>Connected artists</h2><span className="shrink-0 text-[11px] text-muted">Demo audience overlaps</span></div>
              <p className="m-0 mb-[20px] text-[13px] leading-[1.65] text-muted">Explore artists with shared LittleRedMusic listeners. Counts are fictional, pairwise and not additive; they are not live analytics or artist fan totals.</p>
              {related.length ? <div className="grid grid-cols-2 gap-[12px]">{related.map(({ edge, artist: other }) => <Link key={edge.id} to={`/artists/${encodeURIComponent(other.id)}`} className="group flex min-w-0 items-center gap-[14px] rounded-card border border-line bg-surface p-[16px] transition-colors hover:bg-soft"><ArtistAvatar artist={other} compact /><div className="min-w-0 flex-1"><h3 className="font-display m-0 break-words text-[16px] font-semibold text-ink group-hover:underline">{other.name}</h3><p className="m-0 mt-[4px] text-[12px] leading-[1.5] text-muted">{familyFor(other)?.name || familyFor(other)?.label || 'Artist'}</p><p className="m-0 mt-[8px] text-[12px] leading-[1.5] text-muted"><strong className="font-semibold text-ink">{number.format(edge.sharedListenerCount)}</strong> shared listeners{edge.isFictional ? ' · fictional' : ''}</p></div><span aria-hidden="true" className="text-muted">↗</span></Link>)}</div> : <p className="m-0 rounded-card border border-dashed border-line p-[24px] text-[14px] text-muted">No shared-audience connections are currently available.</p>}
            </section>
          </div>
        </div>
      </main>
    </Page>
  )
}
