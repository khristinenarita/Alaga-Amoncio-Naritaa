'use client'

import { useAlaga } from '../alaga-provider'

export function SosScreen() {
  const { openSosModal } = useAlaga()

  return (
    <section className="screen show">
      <div className="card">
        <h3>Emergency help</h3>
        <p>Press once. Your family gets your location right away.</p>
      </div>
      <button type="button" className="sosbtn" aria-label="Send SOS" onClick={openSosModal}>
        SOS
      </button>
      <p className="hint">Only press if you need help.</p>
    </section>
  )
}
