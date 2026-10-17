// 📸 5 Onboarding (before connect spotify) — Figma 1431:2207.
import Link from '@/components/AppLink'
import { Page, Stage } from '@/components/Layout'
import { OnboardingHeader } from '@/components/onboarding/Onboarding'
import { ROUTES } from '@/data'

const CARDS = [
  { top: 132, title: 'Connect Spotify', body: 'Reads your top artists and recent plays — we never post anything.', cta: 'Connect', to: `${ROUTES.onboardingSpotify}?from=spotify`, logo: <SpotifyLogo /> },
  { top: 264, title: 'Connect Apple Music', body: 'Reads your library and recent listening — nothing is shared publicly.', cta: 'Connect', to: `${ROUTES.onboardingSpotify}?from=apple`, logo: <AppleMusicLogo /> },
  { top: 396, title: 'Create your taste profile manually', body: 'Choose your genres and songs yourself — no streaming account needed.', cta: 'Choose manually', to: ROUTES.onboardingManual, wide: true },
]

export default function Onboarding() {
  return (
    <Page active="discover">
      <div className="h-px w-full bg-divider" />
      <Stage height={827}>
        <OnboardingHeader title="Let’s build your taste profile" subtitle="Connect a music service, or create your taste profile manually — either way takes a minute." />

        {CARDS.map((c) => (
          <div key={c.title} className="absolute left-[340px] h-[112px] w-[760px] rounded-[12px] border border-line bg-white" style={{ top: c.top }}>
            <div className={`absolute left-[19px] top-[27px] flex size-[56px] items-center justify-center rounded-[12px] ${c.logo ? '' : 'border border-dashed border-faint'}`}>{c.logo}</div>
            <p className="absolute left-[87px] top-[27px] m-0 whitespace-nowrap text-[16px] leading-normal font-semibold text-ink">{c.title}</p>
            {c.wide
              ? <p className="absolute left-[87px] top-[51px] m-0 whitespace-nowrap text-[12px] leading-normal text-subtle">{c.body}</p>
              : <p className="absolute left-[87px] top-[51px] m-0 w-[236px] text-[12px] leading-[16px] text-muted">{c.body}</p>}
            <Link to={c.to} className="absolute left-[579px] top-[33px] flex h-[44px] w-[156px] items-center justify-center rounded-[22px] bg-ink text-[14px] font-semibold text-white hover:bg-black">{c.cta}</Link>
          </div>
        ))}

        <div className="absolute left-[340px] top-[548px] h-[72px] w-[760px] whitespace-nowrap rounded-[12px] border border-line bg-soft leading-normal">
          <p className="absolute left-[23px] top-[15px] m-0 text-[10px] font-semibold text-subtle">YOUR TASTE PROFILE</p>
          <p className="absolute left-[23px] top-[37px] m-0 text-[12px] text-muted">Updates as you pick. You can change it any time.</p>
          <p className="absolute left-[429px] top-[27px] m-0 text-[13px] text-subtle">Nothing picked yet — choose an option above.</p>
        </div>
      </Stage>
    </Page>
  )
}

function SpotifyLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 168 168" aria-hidden="true"><circle cx="84" cy="84" r="84" fill="#1ED760" /><path fill="#000" d="M122 75c-21-12-55-13-75-7-3 1-7-1-8-4s1-7 4-8c23-7 61-6 85 8 3 2 4 6 2 9-2 2-5 3-8 2zm-1 18c-1 3-5 3-7 2-17-11-44-14-65-8-3 1-6-1-7-4s1-6 4-7c24-7 53-4 73 9 2 1 3 5 2 8zm-8 17c-1 2-4 3-6 2-15-9-34-11-57-6-2 1-4-1-5-3 0-2 1-4 3-5 25-6 46-3 63 7 2 1 3 4 2 5z" /></svg>
  )
}
function AppleMusicLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="am" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FA5C73" /><stop offset="1" stopColor="#FA233B" /></linearGradient></defs><rect width="40" height="40" rx="9" fill="url(#am)" /><path fill="#fff" d="M26.5 9.5v15.2a3.3 3.3 0 1 1-2-3V13.6l-8 1.8v11.3a3.3 3.3 0 1 1-2-3V12.2z" /></svg>
  )
}
