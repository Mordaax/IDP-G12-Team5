// A small "Are you sure?" dialog, used before deleting a post or unsending a message.
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ConfirmDialog({ title, body, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const cancelButton = useRef(null)
  useEffect(() => {
    cancelButton.current?.focus()
    const onKey = (event) => event.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return createPortal(<div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 p-[20px]" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-body" className="w-full max-w-[380px] animate-pop rounded-panel bg-surface p-[22px] shadow-pop">
      <h2 id="confirm-title" className="font-display m-0 text-[17px] font-semibold text-ink">{title}</h2>
      {body && <p id="confirm-body" className="m-0 mt-[6px] text-[13px] leading-[1.5] text-muted">{body}</p>}
      <div className="mt-[20px] flex justify-end gap-[10px]">
        <button ref={cancelButton} type="button" onClick={onCancel} className="rounded-control border border-line px-[16px] py-[8px] text-[13px] font-semibold text-ink hover:bg-soft">Cancel</button>
        <button type="button" onClick={onConfirm} className="rounded-control bg-danger px-[16px] py-[8px] text-[13px] font-semibold text-on-accent hover:bg-danger/90">{confirmLabel}</button>
      </div>
    </div>
  </div>, document.body)
}
