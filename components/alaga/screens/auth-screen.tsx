'use client'

import { useState } from 'react'
import { DEMO_CREDENTIALS, DEMO_FAMILY_CODE } from '@/lib/alaga/data'
import type { AuthMode, SignUpFields } from '@/lib/alaga/types'
import { useAlaga } from '../alaga-provider'

const EMPTY: SignUpFields = { name: '', user: '', pass: '', code: '' }

export function AuthScreen() {
  const { role, authMode, setAuthMode, signIn, signUp } = useAlaga()
  const [fields, setFields] = useState<SignUpFields>(EMPTY)
  const [error, setError] = useState('')

  const isFamily = role === 'f'
  const isSignUp = authMode === 'up'

  const update = (key: keyof SignUpFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }))

  function switchMode(mode: AuthMode) {
    setAuthMode(mode)
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = isSignUp ? signUp(fields) : signIn(fields.user, fields.pass)
    if (result) setError(result)
  }

  function fillDemo() {
    const demo = DEMO_CREDENTIALS[role]
    setFields((f) => ({ ...f, user: demo.user, pass: demo.pass }))
  }

  const hint = isSignUp
    ? isFamily
      ? `Demo family code: ${DEMO_FAMILY_CODE}`
      : ''
    : `Demo: ${DEMO_CREDENTIALS[role].user} / ${DEMO_CREDENTIALS[role].pass}`

  return (
    <section className="screen show">
      <div className="seg" role="tablist" aria-label="Account">
        <button
          type="button"
          role="tab"
          aria-selected={!isSignUp}
          className={isSignUp ? '' : 'on'}
          onClick={() => switchMode('in')}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isSignUp}
          className={isSignUp ? 'on' : ''}
          onClick={() => switchMode('up')}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card">
          {isSignUp && (
            <div>
              <label htmlFor="iName">Full name</label>
              <input id="iName" autoComplete="off" value={fields.name} onChange={update('name')} />
            </div>
          )}
          <label htmlFor="iUser">{isFamily ? 'Email' : 'Username'}</label>
          <input
            id="iUser"
            type={isFamily ? 'email' : 'text'}
            autoComplete="off"
            autoCapitalize="none"
            value={fields.user}
            onChange={update('user')}
          />
          <label htmlFor="iPass">Password</label>
          <input id="iPass" type="password" autoComplete="off" value={fields.pass} onChange={update('pass')} />
          {isSignUp && isFamily && (
            <div>
              <label htmlFor="iCode">{"Patient's family code"}</label>
              <input
                id="iCode"
                placeholder="Example: ALG-4821"
                autoComplete="off"
                value={fields.code}
                onChange={update('code')}
              />
            </div>
          )}
        </div>

        <p className="err" role="alert">
          {error}
        </p>
        <button type="submit" className="btn">
          {isSignUp ? 'Create account' : 'Log in'}
        </button>
      </form>

      {!isSignUp && (
        <button type="button" className="btn alt" onClick={fillDemo}>
          Use demo account
        </button>
      )}
      <p className="hint">{hint}</p>
    </section>
  )
}
