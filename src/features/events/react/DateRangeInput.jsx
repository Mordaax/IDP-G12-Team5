import { useEffect, useId, useState } from 'react'
import { parseSingaporeDate } from '../utils/date'

const displayDate = value => value ? value.split('-').reverse().join('/') : ''

// Browsers otherwise activate only the native indicator inside this overlay.
export function openDatePicker({ currentTarget }) {
  currentTarget.showPicker?.()
}

/** Keep incomplete typing out of the ISO draft; the companion retains the native calendar. */
export default function DateRangeInput({ label, name, value, min, max, invalid, onChange, onValidityChange }) {
  const id = useId()
  const [text, setText] = useState(() => displayDate(value))
  useEffect(() => { setText(displayDate(value)) }, [value])
  const edit = (next) => {
    setText(next)
    const iso = parseSingaporeDate(next)
    const valid = iso !== null
    onValidityChange(!valid)
    if (valid) onChange(iso)
  }
  return <div className="events-date-field">
    <label htmlFor={id}>{label}</label>
    <div className="events-date-field__control">
      <input id={id} type="text" aria-label={`${name} date`} aria-describedby="events-date-range-help" aria-invalid={invalid} placeholder="DD/MM/YYYY" autoComplete="off" maxLength={10} value={text} onChange={event => edit(event.target.value)} />
      <span className="events-date-field__picker">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>
        <input type="date" onClick={openDatePicker} aria-label={`Choose ${name.toLowerCase()} date`} aria-describedby="events-date-range-help" aria-invalid={invalid} min={min} max={max} value={value} onChange={event => { setText(displayDate(event.target.value)); onValidityChange(false); onChange(event.target.value) }} />
      </span>
    </div>
  </div>
}
