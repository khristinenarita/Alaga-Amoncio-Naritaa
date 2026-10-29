'use client'

import { useAlaga } from '../alaga-provider'

export function FamilyHomeScreen() {
  const { meds, sosActive, sosAt, session, go, showToast } = useAlaga()
  const takenCount = meds.filter((m) => m.takenAt).length
  const call = () => showToast(`Calling ${session.patientName}…`)

  return (
    <section className="screen show">
      {sosActive ? (
        <>
          <div className="alert">
            <h3>{`SOS from ${session.patientName}`}</h3>
            {`Sent at ${sosAt}. Location received.`}
          </div>
          <button type="button" className="btn red" onClick={call}>
            Call now
          </button>
        </>
      ) : (
        <div className="safe">
          <h3>{`${session.patientName} is safe`}</h3>
          No alerts today.
        </div>
      )}

      <div className="card">
        <div className="row">
          <h3>{session.patientFull}</h3>
          <span className="pill">Last seen 2 min ago</span>
        </div>
        <p>Home, Davao City</p>
      </div>

      <div className="card">
        <h3>Today</h3>
        <p>{`${takenCount} of ${meds.length} medicines taken today.`}</p>
        <button type="button" className="btn alt" onClick={() => go('fmeds')}>
          See medicines
        </button>
      </div>

      <button type="button" className="btn" onClick={call}>
        {`Call ${session.patientName}`}
      </button>
    </section>
  )
}
