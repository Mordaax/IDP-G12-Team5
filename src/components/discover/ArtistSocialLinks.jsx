const platforms = [
  {key:'instagram', label:'Instagram', search:name => `https://www.instagram.com/explore/search/keyword/?q=${name}`},
  {key:'tiktok', label:'TikTok', search:name => `https://www.tiktok.com/search?q=${name}`},
  {key:'spotify', label:'Spotify', search:name => `https://open.spotify.com/search/${name}`},
  {key:'soundcloud', label:'SoundCloud', search:name => `https://soundcloud.com/search?q=${name}`},
]

export default function ArtistSocialLinks({artist}) {
  const name = encodeURIComponent(artist.name)
  return <nav aria-label={`${artist.name} social media`} className="mt-[12px] flex items-center gap-[12px] border-t border-divider pt-[12px]">
    {platforms.map(({key,label,search}) => {
      const profile = artist.links?.[key]
      const hasProfile = typeof profile === 'string' && /^https?:\/\//i.test(profile)
      return <a key={key} href={hasProfile ? profile : search(name)} target="_blank" rel="noopener noreferrer"
        aria-label={hasProfile ? `${artist.name} on ${label}` : `Find ${artist.name} on ${label}`}
        title={hasProfile ? label : `${label} · Search for ${artist.name}`}
        className="flex size-[44px] shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <img src={`/assets/icons/social-${key}.svg`} alt="" width="44" height="44" className="size-[44px]" />
      </a>
    })}
  </nav>
}
