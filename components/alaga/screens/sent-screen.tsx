'use client'

import { useAlaga } from '../alaga-provider'

export function SentScreen() {
  const { sosAt, session, cancelSos } = useAlaga()

  return (
    <section className="screen show">
      <div className="alert">
        <h3>Help is on the way</h3>
        <span>
          Alert sent at <b>{sosAt}</b>
        </span>
      </div>
      <div className="card">
        <h3>Sent to your family</h3>
        <p>{`Sent to ${session.familyName}.`}</p>
      </div>
      <div className="card">
        <h3>What they can see</h3>
        <p>Your location in Davao City.</p>
      </div>
      <button type="button" className="btn alt" onClick={cancelSos}>
        {"I'm okay – cancel alert"}
      </button>
    </section>
  )
}
