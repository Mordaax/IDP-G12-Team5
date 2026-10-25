// Small, dependency-free date helpers (all output is deterministic en-SG style).

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// Date-input values use local calendar days, never UTC ISO conversion.
export const calendarDate = (date = new Date()) => `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  if (year < 1) return false
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(0, 0, 0, 0)
  return calendarDate(date) === value
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Fixed calendar dates stay put; other prototype events retain rolling offsets. */
export function eventDay(event, today = startOfDay()) {
  if (event.date == null) return addDays(startOfDay(today), event.dayOffset)
  if (!isCalendarDate(event.date)) throw new Error(`Invalid event date: ${event.date}`)
  const [year, month, day] = event.date.split('-').map(Number)
  const date = startOfDay(today)
  date.setFullYear(year, month - 1, day)
  return date
}

export const eventDayOffset = (event, today = startOfDay()) => Math.round((eventDay(event, today) - startOfDay(today)) / 86400000)

/** "21:00" + a day → Date */
export function withTime(day, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(day)
  d.setHours(h, m, 0, 0)
  return d
}

export const dow = (d) => DOW[d.getDay()]
export const dowUpper = (d) => dow(d).toUpperCase()
export const monthShort = (d) => MONTHS[d.getMonth()]

/** 21:00 → "9:00 PM" */
export function time12(d) {
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
}

/** 20:00 → "8PM", 19:30 → "7:30PM" (compact, used on map labels) */
export function timeCompact(d) {
  const h = d.getHours()
  const m = d.getMinutes()
  const base = `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}`
  return `${base}${h < 12 ? 'AM' : 'PM'}`
}

/** "Sat 19 Sep" */
export const dayLabel = (d) => `${dow(d)} ${d.getDate()} ${monthShort(d)}`
/** "Sat 19 Sep 2026" */
export const dayLabelYear = (d) => `${dayLabel(d)} ${d.getFullYear()}`
/** "SAT 19 SEP · 8PM" (map cards) */
export const cardStamp = (d) => `${dowUpper(d)} ${d.getDate()} ${monthShort(d).toUpperCase()} · ${timeCompact(d)}`
