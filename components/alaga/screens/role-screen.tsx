'use client'

import { useAlaga } from '../alaga-provider'

export function RoleScreen() {
  const { pickRole } = useAlaga()

  return (
    <section className="screen show">
      <div className="card centered">
        <h3 className="welcome">Welcome to Alaga</h3>
        <p>Choose how you will use the app.</p>
      </div>
      <button type="button" className="btn" onClick={() => pickRole('p')}>
        I&apos;m the patient<small>Medicines and SOS</small>
      </button>
      <button type="button" className="btn alt" onClick={() => pickRole('f')}>
        I&apos;m family<small>Check on your loved one</small>
      </button>
    </section>
  )
}
