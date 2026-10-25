// 📸 3 Auth (Sign up) — Figma 1431:994 — empty form, Create account disabled until it's complete.
// 📸 4 Auth (Kit Tan Sign up) — Figma 1431:1287 — /signup/filled opens with Kit's details typed in.
// /login reuses the same card for returning users.
import { useEffect, useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Link, { useGo } from '@/components/AppLink'
import { Page } from '@/components/Layout'
import SignedOutMap from '@/components/discover/SignedOutMap'
import { WEB } from '@/components/discover/graphs'
import { IMG, ROUTES, USER } from '@/data'
import { useSession } from '@/lib/useSession'

export default function Auth({ mode = 'signup', prefilled = false }) {
  const navigate = useGo()
  const signup = mode === 'signup'

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') navigate(ROUTES.discover) }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [navigate])

  return (
    <Page className="relative">
      {/* Figma "Discover background" (blurred) + "Overlay" (black 70%) behind the card */}
      <div inert aria-hidden="true" className="pointer-events-none blur-[2px]">
        <SignedOutMap label="Web of artists" graph={WEB} interactive={false} />
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[72px] z-40 flex items-start justify-center overflow-y-auto bg-black/70 py-[92px]">
        <AuthCard key={`${mode}-${prefilled}`} signup={signup} prefilled={prefilled} />
      </div>
    </Page>
  )
}

function AuthCard({ signup, prefilled }) {
  const navigate = useGo()
  const { signIn } = useSession()
  const [params] = useSearchParams()
  const id = useId()
  // where to go once you're in: back to the page that asked you to log in, or the next step
  const next = params.get('next')?.startsWith('/') ? params.get('next') : signup ? ROUTES.onboarding : ROUTES.forYou
  const enter = () => {
    navigate(next)
    signIn() // the mock account: you are now Kit Tan
  }
  const [email, setEmail] = useState(prefilled || !signup ? USER.email : '')
  // Log in is filled in with Kit's account (the mock account), so one click logs you in
  const [password, setPassword] = useState(prefilled || !signup ? 'synthwave26' : '')
  const [confirm, setConfirm] = useState(prefilled ? 'synthwave26' : '')
  const [agreed, setAgreed] = useState(prefilled)
  const [touched, setTouched] = useState(false)

  const emailOk = /^\S+@\S+\.\S+$/.test(email)
  const mismatch = signup && confirm.length > 0 && confirm !== password
  const tooShort = password.length > 0 && password.length < 6
  const complete = signup
    ? emailOk && password.length >= 6 && confirm === password && agreed
    : emailOk && password.length > 0

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (complete) enter()
  }

  return (
    <form
      onSubmit={submit}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      noValidate
      className="relative w-[486px] animate-pop rounded-panel bg-surface px-[88px] pb-[24px] pt-[24px] shadow-panel"
    >
      <Link to={ROUTES.discover} aria-label="Close" className="absolute right-[20px] top-[16px] flex size-[32px] items-center justify-center rounded-card text-[24px] leading-none text-muted hover:bg-divider">×</Link>

      <div className="flex flex-col items-center">
        <img src={IMG.brand} alt="LittleRedMusic" width="40" height="40" className="size-[40px] object-contain" />
        <h1 id={`${id}-title`} className="font-display m-0 text-[30px] leading-normal font-semibold text-ink">{signup ? 'Sign up' : 'Log in'}</h1>
        <p className="m-0 text-[12px] leading-normal font-semibold text-ink-soft">{signup ? 'Save your music preferences' : 'Welcome back to your web of artists'}</p>
      </div>

      <Field id={`${id}-email`} label="Email:" className="mt-[4px]">
        <input id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
          className="h-[48px] w-full rounded-control border border-line bg-surface px-[15px] text-[14px] text-ink outline-none placeholder:text-subtle focus:border-ink" />
        {touched && !emailOk && <Hint>Enter a valid email address.</Hint>}
      </Field>

      <Field id={`${id}-pw`} label="Password:">
        <PasswordInput id={`${id}-pw`} value={password} onChange={setPassword} placeholder={signup ? 'Create a password' : 'Your password'} autoComplete={signup ? 'new-password' : 'current-password'} />
        {signup && tooShort && <Hint>Use at least 6 characters.</Hint>}
      </Field>

      {signup && (
        <Field id={`${id}-confirm`} label="Confirm password:">
          <PasswordInput id={`${id}-confirm`} value={confirm} onChange={setConfirm} placeholder="Confirm password" autoComplete="new-password" />
          {mismatch && <Hint>Passwords don’t match.</Hint>}
        </Field>
      )}

      <div className="mt-[17px] flex items-center gap-[16px]">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[12px] leading-normal text-subtle">or {signup ? 'sign up' : 'log in'} with</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-[12px] flex flex-col items-center gap-[10px]">
        <button type="button" onClick={enter} className="flex h-[35px] w-[256px] items-center justify-center gap-[8px] rounded-control border border-ink text-[13px] font-medium text-ink hover:bg-white">
          <GoogleMark /> {signup ? 'Sign up' : 'Log in'} with Google
        </button>
        <button type="button" onClick={enter} className="flex h-[35px] w-[256px] items-center justify-center gap-[8px] rounded-control bg-ink text-[13px] font-medium text-white hover:bg-black">
          <AppleMark /> {signup ? 'Sign up' : 'Log in'} with Apple
        </button>
      </div>

      {signup && (
        <label className="mt-[22px] flex cursor-pointer items-center gap-[8px] pl-[11px]">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
          {agreed
            ? <img src="/assets/icons/checkbox-dark.svg" alt="" width="16" height="16" className="size-[16px]" />
            : <span className="size-[16px] rounded-[3px] border border-line bg-surface" />}
          <span className="text-[13px] leading-normal text-ink-soft">I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="underline">Terms</a> and <a href="#" onClick={(e) => e.preventDefault()} className="underline">Privacy Policy</a></span>
        </label>
      )}

      <button type="submit" disabled={!complete}
        className={`mt-[13px] h-[52px] w-[310px] rounded-control text-[15px] font-semibold transition-colors ${complete ? 'bg-accent text-on-accent hover:bg-accent-hover' : 'bg-line text-subtle'}`}>
        {signup ? 'Create account' : 'Log in'}
      </button>
      {!complete && (
        <p className="m-0 mt-[10px] text-center text-[12px] leading-normal text-subtle">
          {signup ? 'Fill in every field and accept the terms to continue.' : 'Enter your email and password to continue.'}
        </p>
      )}

      <p className="m-0 mt-[14px] text-center text-[13px] leading-normal text-ink-soft">
        {signup ? 'Already have an account?' : 'New to LittleRedMusic?'}{' '}
        <Link to={signup ? ROUTES.login : ROUTES.signup} className="font-semibold text-ink hover:underline">{signup ? 'Log in' : 'Sign up'}</Link>
      </p>
    </form>
  )
}

function Field({ id, label, children, className = '' }) {
  return (
    <div className={`mt-[6px] flex flex-col gap-[4px] ${className}`}>
      <label htmlFor={id} className="text-[14px] leading-normal font-medium text-ink">{label}</label>
      {children}
    </div>
  )
}

const Hint = ({ children }) => <p className="m-0 text-[12px] text-brand">{children}</p>

function PasswordInput({ id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  const has = value.length > 0
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete}
        className="h-[48px] w-full rounded-control border border-line bg-surface pl-[15px] pr-[80px] text-[14px] text-ink outline-none placeholder:text-subtle focus:border-ink" />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}
        className={`absolute right-[14px] top-1/2 flex -translate-y-1/2 items-center gap-[7px] text-[13px] font-semibold ${has ? 'text-ink' : 'text-faint'}`}>
        <img src={has ? '/assets/icons/eye-dark.svg' : '/assets/icons/eye-muted.svg'} alt="" width="16" height="9" />
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

const GoogleMark = () => (
  <svg width="13" height="13" viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M45 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.5-9.5 6.5-16.1z" /><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.5 46 24 46z" /><path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2 20.4 2 24s1 6.9 2.5 9.9l7.3-5.7z" /><path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.5 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" /></svg>
)
const AppleMark = () => (
  <svg width="12" height="14" viewBox="0 0 384 470" aria-hidden="true"><path fill="currentColor" d="M318 249c-1-55 45-82 47-83-26-37-66-43-80-43-34-4-66 20-84 20-17 0-44-19-72-19-37 1-71 22-90 55-39 67-10 166 28 220 18 27 40 56 69 55 28-1 38-18 72-18s43 18 72 17c30 0 49-27 67-54 21-31 30-61 30-62-1-1-58-23-59-88zM263 87c15-18 26-44 23-69-22 1-49 15-64 33-14 16-27 42-23 67 25 2 49-12 64-31z" /></svg>
)
