'use client'

import { BACK_TARGET, SCREEN_TITLES } from '@/lib/alaga/data'
import { useAlaga } from './alaga-provider'

export function TopBar() {
  const { screen, role, authMode, session, go } = useAlaga()
  const back = BACK_TARGET[screen]
  let [title, subtitle] = SCREEN_TITLES[screen]

  switch (screen) {
    case 'home':
      subtitle = `Good morning, ${session.patientName}`
      break
    case 'fhome':
      subtitle = `${session.familyName} · Caregiver`
      break
    case 'fmeds':
      subtitle = `${session.patientName}'s dose log`
      break
    case 'fmsgs':
      subtitle = `From ${session.patientName}`
      break
    case 'fadd':
      subtitle = `For ${session.patientName}`
      break
    case 'auth':
      title = authMode === 'in' ? 'Log in' : 'Create account'
      subtitle = `${role === 'p' ? 'Patient' : 'Family'} account`
      break
  }

  const showLogout = screen !== 'role' && !back

  return (
    <header className="top">
      {back && (
        <>
          <button type="button" className="back" onClick={() => go(back)}>
            {'‹ Back'}
          </button>
          <br />
        </>
      )}
      <h2>{title}</h2>
      <div className="row">
        <span>{subtitle}</span>
        {showLogout && (
          <button type="button" className="back sw" onClick={() => go('role')}>
            Log out
          </button>
        )}
      </div>
    </header>
  )
}
