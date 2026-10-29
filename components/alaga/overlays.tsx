'use client'

import { useAlaga } from './alaga-provider'

export function Banner() {
  const { banner } = useAlaga()
  const classes = ['banner', banner?.visible ? 'show' : '', banner?.sos ? 'sos' : ''].filter(Boolean).join(' ')

  return (
    <div className={classes} role="status">
      {banner && (
        <>
          <b>{banner.title}</b>
          {banner.text}
        </>
      )}
    </div>
  )
}

export function Toast() {
  const { toast } = useAlaga()
  if (!toast) return null
  return (
    <div className="toast" role="status">
      {toast}
    </div>
  )
}

export function SosModal() {
  const { sosModalOpen, closeSosModal, confirmSos } = useAlaga()
  if (!sosModalOpen) return null

  return (
    <div className="modal show" role="dialog" aria-modal="true" aria-labelledby="sos-modal-title">
      <div className="card">
        <h3 id="sos-modal-title">Send SOS to your family?</h3>
        <p>They will get your location right now.</p>
        <button type="button" className="btn red" onClick={confirmSos} autoFocus>
          Yes, send help
        </button>
        <button type="button" className="btn alt" onClick={closeSosModal}>
          No, go back
        </button>
      </div>
    </div>
  )
}
