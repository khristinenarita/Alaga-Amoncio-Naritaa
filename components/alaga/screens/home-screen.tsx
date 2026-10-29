'use client'

import { useAlaga } from '../alaga-provider'

export function HomeScreen() {
  const { meds, session, go, showToast } = useAlaga()
  const next = meds.find((m) => !m.takenAt)

  function speak() {
    try {
      const text = next
        ? `Your next medicine is ${next.name} at ${next.time}`
        : 'You have taken all your medicines today.'
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
    } catch {
      showToast('Voice not available')
    }
  }

  return (
    <section className="screen show">
      <div className="card">
        <div className="row">
          <h3>Next medicine</h3>
          <span className="pill">{next ? next.time : 'Done'}</span>
        </div>
        <p>{next ? next.name : 'All medicines taken today. Well done!'}</p>
        <button type="button" className="btn" onClick={() => go('meds')}>
          Open my medicines
        </button>
      </div>

      <button type="button" className="btn red" onClick={() => go('sos')}>
        {'SOS – I need help'}
      </button>
      <button type="button" className="btn alt" onClick={speak}>
        Read this aloud
      </button>
      <p className="hint">
        Your family code: <b>{session.code}</b>
      </p>
    </section>
  )
}
