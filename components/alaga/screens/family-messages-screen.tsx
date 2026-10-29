'use client'

import { useAlaga } from '../alaga-provider'

export function FamilyMessagesScreen() {
  const { messages, session } = useAlaga()
  const visible = messages.filter((m) => m.code === session.code)

  return (
    <section className="screen show">
      <div className="card">
        <h3>{`Messages from ${session.patientName}`}</h3>
        {visible.length ? (
          visible.map((m, i) => (
            <div className="msg" key={`${m.time}-${i}`}>
              {m.sos && <span aria-label="Emergency">{'🚨 '}</span>}
              {m.text}
              <small>{m.time}</small>
            </div>
          ))
        ) : (
          <p>{`No messages yet. They appear when ${session.patientName} confirms a medicine or sends SOS.`}</p>
        )}
      </div>
    </section>
  )
}
