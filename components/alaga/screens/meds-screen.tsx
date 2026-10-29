'use client'

import { useAlaga } from '../alaga-provider'

export function MedsScreen() {
  const { meds, takeMed } = useAlaga()
  const takenCount = meds.filter((m) => m.takenAt).length

  return (
    <section className="screen show">
      <div className="card">
        <div className="row">
          <h3>Today</h3>
          <span className="pill">{`${takenCount} of ${meds.length} taken`}</span>
        </div>
        <p>Tap the big button after you take each medicine.</p>
      </div>

      {meds.map((med, i) => (
        <div className="card" key={`${med.name}-${med.minutes}-${i}`}>
          <div className="row">
            <h3>{med.name}</h3>
            <span className={`pill${med.takenAt ? ' ok' : ''}`}>{med.time}</span>
          </div>
          <p>
            {med.note}
            {med.addedBy ? ` · Added by ${med.addedBy}` : ''}
          </p>
          {med.takenAt ? (
            <button type="button" className="btn alt" disabled>
              {`✓ Taken at ${med.takenAt}`}
            </button>
          ) : (
            <>
              <button type="button" className="btn" onClick={() => takeMed(i)}>
                I took it
              </button>
              <p className="hint">Your family gets a message.</p>
            </>
          )}
        </div>
      ))}
    </section>
  )
}
