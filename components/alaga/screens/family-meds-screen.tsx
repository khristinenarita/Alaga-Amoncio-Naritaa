'use client'

import { useAlaga } from '../alaga-provider'

export function FamilyMedsScreen() {
  const { meds, go } = useAlaga()

  return (
    <section className="screen show">
      <div className="card">
        <h3>Medicines today</h3>
        {meds.map((med, i) => (
          <div className="row med-row" key={`${med.name}-${med.minutes}-${i}`}>
            <span>{med.name}</span>
            <span className={`pill${med.takenAt ? ' ok' : ''}`}>
              {med.takenAt ? `Taken ${med.takenAt}` : `Due ${med.time}`}
            </span>
          </div>
        ))}
      </div>
      <button type="button" className="btn" onClick={() => go('fadd')}>
        Assign a medicine
      </button>
    </section>
  )
}
