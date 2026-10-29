'use client'

import { FAMILY_NAV, PATIENT_NAV } from '@/lib/alaga/data'
import { useAlaga } from './alaga-provider'

export function BottomNav() {
  const { screen, role, unread, go } = useAlaga()

  if (screen === 'role' || screen === 'auth') return null

  const items = role === 'f' ? FAMILY_NAV : PATIENT_NAV

  return (
    <nav className="nav" aria-label="Main">
      {items.map(({ id, icon, label }) => {
        const active = screen === id || (screen === 'sent' && id === 'sos') || (screen === 'fadd' && id === 'fmeds')
        const classes = [id === 'sos' ? 'sos' : '', active ? 'on' : ''].filter(Boolean).join(' ')
        return (
          <button
            key={id}
            type="button"
            className={classes}
            aria-current={active ? 'page' : undefined}
            onClick={() => go(id)}
          >
            {id === 'fmsgs' && unread > 0 && (
              <em className="dot">
                <span className="sr-only">{`${unread} unread`}</span>
              </em>
            )}
            <b aria-hidden="true">{icon}</b>
            {label}
          </button>
        )
      })}
    </nav>
  )
}
