import { createContext, useCallback, useContext, useRef, useState } from 'react'

// Small message shown at the bottom of the page ("Event saved", "Link copied", ...).
const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const [key, setKey] = useState(0)
  const timer = useRef(null)

  const toast = useCallback((text) => {
    setMessage(text)
    setKey((k) => k + 1)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 2500)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[100]">
        {message && (
          <p key={key} className="absolute bottom-[28px] left-1/2 m-0 animate-toast whitespace-nowrap rounded-full bg-ink px-[18px] py-[10px] text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(var(--lrm-raw-rgb-000000),0.25)]">
            {message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

/** Share a page: the system share sheet where there is one, otherwise copy the link. */
export function useShare() {
  const toast = useToast()
  return async (title) => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${title} on LittleRedMusic`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast('Link copied to clipboard')
    } catch (err) {
      if (err?.name !== 'AbortError') toast('Could not share this page')
    }
  }
}
