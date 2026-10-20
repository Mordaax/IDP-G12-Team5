// Attachments for Messages and Discussions: photos, videos, files, camera photos, voice
// recordings and locations.
// The site has no backend, so files stay in this browser tab: they show up anywhere in the
// app until the page is reloaded. Only small metadata (name, type, size) goes into the
// session; the file itself lives in the in-memory store below. Locations are plain data,
// so they survive a reload.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useToast } from '@/lib/toast'
import { ATTRIBUTION, SG_BOUNDS, TILE_URL, nearestPlace } from '@/features/events/utils/onemap'

const store = new Map() // attachment id → blob URL
const MAX_BYTES = 50 * 1024 * 1024
const MAX_RECORDING_SECONDS = 5 * 60

export const kindOf = (type = '') => type.startsWith('image/') ? 'image' : type.startsWith('video/') ? 'video' : type.startsWith('audio/') ? 'audio' : 'file'

export const formatSize = (bytes = 0) => bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

const formatTime = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

function register(blob, name, extra = {}) {
  const id = `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  store.set(id, URL.createObjectURL(blob))
  return { id, name, type: blob.type, size: blob.size, kind: kindOf(blob.type), ...extra }
}

/** Short text for previews such as the conversation list: "📷 Photo", "🎙 Voice message +1". */
export function attachmentSummary(items) {
  if (!items?.length) return ''
  const first = items[0]
  const label = first.recording ? '🎙 Voice message' : { image: '📷 Photo', video: '🎬 Video', audio: '🎵 Audio', file: `📎 ${first.name}`, location: '📍 Location' }[first.kind]
  return items.length > 1 ? `${label} +${items.length - 1}` : label
}

/** Attachments waiting to be sent with the next message or comment. */
export function useAttachments() {
  const [items, setItems] = useState([])
  const add = (list) => setItems((old) => [...old, ...list])
  const remove = (id) => { // also used for locations, which have no stored file
    const url = store.get(id)
    if (url) URL.revokeObjectURL(url)
    store.delete(id)
    setItems((old) => old.filter((item) => item.id !== id))
  }
  // after sending: the files now belong to the posted message, so keep their URLs
  const clear = () => setItems([])
  return { items, add, remove, clear }
}

const Icon = {
  media: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="m21 16-5-5-9 9" /></svg>,
  file: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 11-8.6 8.6a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4L15.5 7" /></svg>,
  mic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>,
  camera: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.5" r="3.5" /></svg>,
  pin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>,
  doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>,
}

const iconButton = 'flex size-[32px] shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-soft hover:text-ink disabled:opacity-40'

/**
 * Buttons to add a photo/video, a file, or a voice recording.
 * `guard` wraps each action (e.g. requireLogin for guests).
 */
export function AttachButtons({ onAdd, guard = (action) => action() }) {
  const toast = useToast()
  const mediaInput = useRef(null)
  const fileInput = useRef(null)
  const recorder = useRef(null)
  const stream = useRef(null)
  const chunks = useRef([])
  const cancelled = useRef(false)
  const startedAt = useRef(0)
  const [seconds, setSeconds] = useState(null) // null = not recording
  const [cameraOpen, setCameraOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const captureInput = useRef(null)

  useEffect(() => () => { cancelled.current = true; recorder.current?.state === 'recording' && recorder.current.stop(); stream.current?.getTracks().forEach((track) => track.stop()) }, [])
  useEffect(() => {
    if (seconds === null) return undefined
    if (seconds >= MAX_RECORDING_SECONDS) { stop(); return undefined }
    const timer = setTimeout(() => setSeconds((s) => (s === null ? s : s + 1)), 1000)
    return () => clearTimeout(timer)
  }, [seconds]) // eslint-disable-line react-hooks/exhaustive-deps

  const takeFiles = (event) => {
    const files = [...event.target.files]
    event.target.value = ''
    const tooBig = files.filter((file) => file.size > MAX_BYTES)
    if (tooBig.length) toast(`${tooBig.length === 1 ? tooBig[0].name : `${tooBig.length} files`} too large (max 50 MB)`)
    const ok = files.filter((file) => file.size <= MAX_BYTES)
    if (ok.length) onAdd(ok.map((file) => register(file, file.name)))
  }

  const start = () => guard(async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { toast('Voice recording isn’t supported in this browser'); return }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      toast('Microphone access was blocked')
      return
    }
    chunks.current = []
    cancelled.current = false
    const instance = new MediaRecorder(stream.current)
    instance.ondataavailable = (event) => event.data.size && chunks.current.push(event.data)
    instance.onstop = () => {
      stream.current?.getTracks().forEach((track) => track.stop())
      if (cancelled.current || !chunks.current.length) return
      const blob = new Blob(chunks.current, { type: instance.mimeType || 'audio/webm' })
      onAdd([register(blob, 'Voice message', { recording: true, duration: startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0 })])
    }
    recorder.current = instance
    startedAt.current = Date.now()
    instance.start()
    setSeconds(0)
  })
  const stop = () => { setSeconds(null); recorder.current?.state === 'recording' && recorder.current.stop() }
  const cancel = () => { cancelled.current = true; stop() }

  // camera: a live preview where the browser allows it, otherwise the phone's camera app
  const openCamera = () => guard(() => {
    if (navigator.mediaDevices?.getUserMedia) setCameraOpen(true)
    else captureInput.current?.click()
  })

  const shareLocation = () => guard(() => {
    if (!navigator.geolocation) { toast('Location isn’t available in this browser'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const point = { lat: coords.latitude, lng: coords.longitude }
      const place = await nearestPlace(point)
      setLocating(false)
      onAdd([{ id: `loc-${Date.now()}`, kind: 'location', name: place || 'My location', ...point, accuracy: Math.round(coords.accuracy) }])
    }, (error) => {
      setLocating(false)
      toast(error.code === error.PERMISSION_DENIED ? 'Location access was blocked' : 'Couldn’t find your location, try again')
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
  })

  if (seconds !== null) {
    return <span className="flex shrink-0 items-center gap-[8px] rounded-full bg-accent-tint py-[4px] pl-[10px] pr-[4px] text-[12px] text-ink" role="status" aria-label={`Recording, ${formatTime(seconds)}`}>
      <span className="size-[8px] animate-pulse rounded-full bg-brand" aria-hidden="true" />
      <span className="tabular-nums">{formatTime(seconds)}</span>
      <button type="button" onClick={cancel} aria-label="Cancel recording" className="flex size-[26px] items-center justify-center rounded-full text-muted hover:bg-white hover:text-ink">×</button>
      <button type="button" onClick={stop} aria-label="Finish recording" className="flex h-[26px] items-center rounded-full bg-ink px-[10px] text-[12px] font-semibold text-white hover:bg-black">Done</button>
    </span>
  }

  return <span className="flex shrink-0 items-center gap-[2px]">
    <input ref={mediaInput} type="file" accept="image/*,video/*" multiple hidden onChange={takeFiles} />
    <input ref={fileInput} type="file" multiple hidden onChange={takeFiles} />
    <input ref={captureInput} type="file" accept="image/*" capture="environment" hidden onChange={takeFiles} />
    <button type="button" className={iconButton} aria-label="Take a photo" title="Camera" onClick={openCamera}>{Icon.camera}</button>
    <button type="button" className={iconButton} aria-label="Add photo or video" title="Photo or video" onClick={() => guard(() => mediaInput.current?.click())}>{Icon.media}</button>
    <button type="button" className={iconButton} aria-label="Attach a file" title="File" onClick={() => guard(() => fileInput.current?.click())}>{Icon.file}</button>
    <button type="button" className={iconButton} aria-label="Record a voice message" title="Record voice" onClick={start}>{Icon.mic}</button>
    <button type="button" className={`${iconButton} ${locating ? 'animate-pulse text-brand' : ''}`} aria-label={locating ? 'Finding your location' : 'Share your location'} title="Location" disabled={locating} onClick={shareLocation}>{Icon.pin}</button>
    {cameraOpen && <CameraModal onClose={() => setCameraOpen(false)} onFallback={() => { setCameraOpen(false); captureInput.current?.click() }}
      onCapture={(blob) => { setCameraOpen(false); onAdd([register(blob, `Photo ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.jpg`)]) }} />}
  </span>
}

/** Full-screen camera: live preview, take a photo, then retake or use it. */
function CameraModal({ onCapture, onClose, onFallback }) {
  const toast = useToast()
  const video = useRef(null)
  const stream = useRef(null)
  const [facing, setFacing] = useState('user')
  const [canFlip, setCanFlip] = useState(false)
  const [shot, setShot] = useState(null) // { blob, url }
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    setReady(false)
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then(async (media) => {
        if (!alive) { media.getTracks().forEach((track) => track.stop()); return }
        stream.current = media
        if (video.current) { video.current.srcObject = media; await video.current.play().catch(() => {}) }
        setReady(true)
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => [])
        if (alive) setCanFlip(devices.filter((device) => device.kind === 'videoinput').length > 1)
      })
      .catch((error) => {
        if (!alive) return
        if (error?.name === 'NotAllowedError') { toast('Camera access was blocked'); onClose() }
        else onFallback() // no webcam: try the device's own camera / photo picker
      })
    return () => { alive = false; stream.current?.getTracks().forEach((track) => track.stop()) }
  }, [facing]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); if (shot) URL.revokeObjectURL(shot.url) }
  }, [shot]) // eslint-disable-line react-hooks/exhaustive-deps

  const take = () => {
    const element = video.current
    if (!element?.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = element.videoWidth
    canvas.height = element.videoHeight
    // the preview is mirrored like a selfie camera, but the saved photo isn't (so text reads normally)
    canvas.getContext('2d').drawImage(element, 0, 0)
    canvas.toBlob((blob) => blob && setShot({ blob, url: URL.createObjectURL(blob) }), 'image/jpeg', 0.9)
  }

  return createPortal(<div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 p-[20px]" role="dialog" aria-modal="true" aria-label="Take a photo">
    <div className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-[16px] bg-ink text-white shadow-2xl">
      <div className="flex items-center justify-between px-[16px] py-[12px]">
        <p className="m-0 text-[14px] font-semibold">{shot ? 'Use this photo?' : 'Take a photo'}</p>
        <button type="button" onClick={onClose} aria-label="Close camera" className="flex size-[32px] items-center justify-center rounded-full text-[20px] hover:bg-white/10">×</button>
      </div>
      <div className="relative aspect-[4/3] w-full bg-black">
        {shot ? <img src={shot.url} alt="Photo preview" className="size-full object-contain" />
          : <video ref={video} playsInline muted className={`size-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`} />}
        {!shot && !ready && <p className="absolute inset-0 m-0 flex items-center justify-center text-[13px] text-white/70">Starting camera…</p>}
      </div>
      <div className="flex items-center justify-center gap-[16px] px-[16px] py-[16px]">
        {shot ? <>
          <button type="button" onClick={() => { URL.revokeObjectURL(shot.url); setShot(null) }} className="rounded-full border border-white/40 px-[18px] py-[9px] text-[13px] font-semibold hover:bg-white/10">Retake</button>
          <button type="button" onClick={() => onCapture(shot.blob)} className="rounded-full bg-white px-[18px] py-[9px] text-[13px] font-semibold text-ink hover:bg-white/90">Use photo</button>
        </> : <>
          <span className="w-[80px]" />
          <button type="button" onClick={take} disabled={!ready} aria-label="Take photo" className="size-[64px] rounded-full border-[4px] border-white bg-white/20 transition-transform hover:scale-105 disabled:opacity-40" />
          <span className="flex w-[80px] justify-end">{canFlip && <button type="button" onClick={() => setFacing((side) => (side === 'user' ? 'environment' : 'user'))} className="rounded-full px-[10px] py-[6px] text-[12px] hover:bg-white/10">Flip ⟲</button>}</span>
        </>}
      </div>
    </div>
  </div>, document.body)
}

const inSingapore = ({ lat, lng }) => lat >= SG_BOUNDS[0][0] && lat <= SG_BOUNDS[1][0] && lng >= SG_BOUNDS[0][1] && lng <= SG_BOUNDS[1][1]

/** A shared location: a small map with a pin, the place name and a link to open it in Maps. */
function LocationCard({ item, tone }) {
  const element = useRef(null)
  useEffect(() => {
    const map = L.map(element.current, { zoomControl: false, attributionControl: true, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false })
    map.attributionControl.setPrefix(false)
    const tiles = inSingapore(item)
      ? L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 })
      : L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 })
    tiles.addTo(map)
    map.setView([item.lat, item.lng], 16)
    L.circleMarker([item.lat, item.lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#e23b2e', fillOpacity: 1 }).addTo(map)
    return () => map.remove()
  }, [item.lat, item.lng]) // eslint-disable-line react-hooks/exhaustive-deps
  const maps = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
  const sub = tone === 'dark' ? 'text-white/70' : 'text-subtle'
  return <div className={`w-[260px] max-w-full overflow-hidden rounded-[10px] border ${tone === 'dark' ? 'border-white/25' : 'border-line'}`}>
    <div ref={element} className="h-[130px] w-full [&_.leaflet-control-attribution]:!bg-white/80 [&_.leaflet-control-attribution]:!px-[4px] [&_.leaflet-control-attribution]:!text-[8px] [&_.leaflet-control-attribution]:!leading-[1.3] [&_.leaflet-control-attribution_img]:!hidden" aria-label={`Map of ${item.name}`} role="img" />
    <a href={maps} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-[8px] px-[10px] py-[8px] text-[13px] ${tone === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-soft text-ink hover:bg-wash'}`}>
      {Icon.pin}
      <span className="min-w-0"><span className="block truncate font-medium">{item.name}</span><span className={`block text-[11px] ${sub}`}>Open in Maps ↗</span></span>
    </a>
  </div>
}

/** Previews of attachments waiting to be sent, each with a remove button. */
export function AttachmentTray({ items, onRemove }) {
  if (!items.length) return null
  return <ul className="m-0 flex list-none flex-wrap gap-[8px] p-0" aria-label="Attachments to send">
    {items.map((item) => {
      const url = store.get(item.id)
      return <li key={item.id} className="relative animate-pop">
        {item.kind === 'image' ? <img src={url} alt={item.name} className="size-[64px] rounded-[10px] border border-line object-cover" />
          : item.kind === 'video' ? <video src={url} muted className="size-[64px] rounded-[10px] border border-line bg-ink object-cover" aria-label={item.name} />
            : <span className="flex h-[64px] max-w-[200px] items-center gap-[8px] rounded-[10px] border border-line bg-soft px-[10px] text-[12px] text-ink">
              {item.kind === 'location' ? Icon.pin : item.recording ? Icon.mic : Icon.doc}
              <span className="min-w-0"><span className="block truncate font-medium">{item.recording ? 'Voice message' : item.name}</span><span className="block text-subtle">{item.kind === 'location' ? `Location · ±${item.accuracy || 0} m` : item.recording ? formatTime(item.duration) : formatSize(item.size)}</span></span>
            </span>}
        <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.recording ? 'voice message' : item.name}`}
          className="absolute -right-[6px] -top-[6px] flex size-[20px] items-center justify-center rounded-full bg-ink text-[12px] leading-none text-white shadow hover:bg-black">×</button>
      </li>
    })}
  </ul>
}

/** Attachments inside a sent message or posted comment. `tone="dark"` for dark chat bubbles. */
export function AttachmentList({ items, tone = 'light' }) {
  if (!items?.length) return null
  const chip = tone === 'dark' ? 'border-white/25 bg-white/10 text-white hover:bg-white/20' : 'border-line bg-soft text-ink hover:bg-wash'
  return <div className="flex flex-col gap-[6px]">
    {items.map((item) => {
      if (item.kind === 'location') return <LocationCard key={item.id} item={item} tone={tone} />
      const url = store.get(item.id)
      if (!url) return <span key={item.id} className={`inline-flex items-center gap-[8px] rounded-[10px] border px-[10px] py-[8px] text-[12px] ${chip}`}>{Icon.doc}<span>{item.recording ? 'Voice message' : item.name} · only available until the page is reloaded</span></span>
      if (item.kind === 'image') return <a key={item.id} href={url} target="_blank" rel="noopener noreferrer" className="block w-fit"><img src={url} alt={item.name} className="max-h-[240px] max-w-full rounded-[10px] object-cover" /></a>
      if (item.kind === 'video') return <video key={item.id} src={url} controls className="max-h-[260px] max-w-full rounded-[10px] bg-black" aria-label={item.name} />
      if (item.kind === 'audio') return <span key={item.id} className="flex flex-col gap-[4px]">
        <span className={`text-[11px] ${tone === 'dark' ? 'text-white/70' : 'text-subtle'}`}>{item.recording ? '🎙 Voice message' : item.name}</span>
        <audio src={url} controls className="h-[36px] w-[260px] max-w-full" />
      </span>
      return <a key={item.id} href={url} download={item.name} className={`inline-flex w-fit max-w-full items-center gap-[10px] rounded-[10px] border px-[12px] py-[9px] text-[13px] ${chip}`}>
        {Icon.doc}
        <span className="min-w-0"><span className="block truncate font-medium">{item.name}</span><span className={`block text-[11px] ${tone === 'dark' ? 'text-white/70' : 'text-subtle'}`}>{formatSize(item.size)} · Download</span></span>
      </a>
    })}
  </div>
}
