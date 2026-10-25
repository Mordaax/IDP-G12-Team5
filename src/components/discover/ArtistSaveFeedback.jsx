import { useState } from 'react'
import { useArtistSaveStudy } from '@/lib/useArtistSaveStudy'

export default function ArtistSaveFeedback() {
  const { study, preview, variant, exposed, finished, feedbackSubmitted } = useArtistSaveStudy()
  const [open, setOpen] = useState(false)
  const [preference, setPreference] = useState('')
  const [ease, setEase] = useState('')
  const [reason, setReason] = useState('')
  if ((!exposed && !preview) || feedbackSubmitted) return null
  return <>
    <div className="absolute top-[24px] left-1/2 z-30 -translate-x-1/2 rounded-control border border-line bg-surface p-[8px] text-[12px]">
      {preview && <span className="mr-[12px] text-muted">Preview {variant === 'control' ? 'A: Follow' : 'B: Heart'} · not recorded</span>}
      <button type="button" onClick={() => { study.finishTask(); setOpen(true) }} className="font-semibold underline">{finished ? 'Give feedback' : 'Finish exploring'}</button>
    </div>
    {open && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-[24px]" onKeyDown={e => { if (e.key === 'Escape') setOpen(false) }}>
      <section role="dialog" aria-modal="true" aria-labelledby="save-feedback-title" className="w-full max-w-[440px] rounded-card bg-surface p-[28px] text-ink" onKeyDown={e => {
        if (e.key !== 'Tab') return
        const controls = [...e.currentTarget.querySelectorAll('button, select, textarea')]
        const first = controls[0], last = controls.at(-1)
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }}>
        <h2 id="save-feedback-title" className="font-display mb-[20px] text-[20px] font-semibold">How was saving artists?</h2>
        <form onSubmit={e => { e.preventDefault(); if (study.submitFeedback({ preference, ease: Number(ease), reason })) setOpen(false) }} className="flex flex-col gap-[16px]">
          <label className="flex flex-col gap-[6px]">How easy was it to keep artists you liked?
            <select autoFocus required value={ease} onChange={e => setEase(e.target.value)} className="rounded-control border border-line p-[8px]"><option value="">Choose a rating</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n}{n === 1 ? ' — Very difficult' : n === 5 ? ' — Very easy' : ''}</option>)}</select>
          </label>
          <label className="flex flex-col gap-[6px]">Which control would you prefer?
            <select required value={preference} onChange={e => setPreference(e.target.value)} className="rounded-control border border-line p-[8px]"><option value="">Choose an option</option><option value="control">Follow button</option><option value="heart">Heart icon ♥</option><option value="no_preference">No preference</option></select>
          </label>
          <label className="flex flex-col gap-[6px]">What influenced your choice? (optional)
            <textarea value={reason} maxLength={1000} onChange={e => setReason(e.target.value)} className="rounded-control border border-line p-[8px]" placeholder="Please leave out personal details." />
          </label>
          <div className="flex justify-end gap-[16px]"><button type="button" onClick={() => setOpen(false)}>Close</button><button className="rounded-control bg-accent px-[16px] py-[10px] font-semibold text-on-accent">Submit feedback</button></div>
        </form>
      </section>
    </div>}
  </>
}
