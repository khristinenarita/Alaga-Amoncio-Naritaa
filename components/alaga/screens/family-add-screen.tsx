'use client'

import { useState } from 'react'
import type { NewMedFields } from '@/lib/alaga/types'
import { useAlaga } from '../alaga-provider'

export function FamilyAddScreen() {
  const { session, assignMed } = useAlaga()
  const [fields, setFields] = useState<NewMedFields>({ name: '', note: '', time: '09:00' })
  const [error, setError] = useState('')

  const update = (key: keyof NewMedFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = assignMed(fields)
    if (result) setError(result)
  }

  return (
    <section className="screen show">
      <form onSubmit={handleSubmit} noValidate>
        <div className="card">
          <label htmlFor="mName">Medicine name and dose</label>
          <input
            id="mName"
            placeholder="Example: Aspirin 81 mg"
            autoComplete="off"
            value={fields.name}
            onChange={update('name')}
          />
          <label htmlFor="mNote">What it is for (optional)</label>
          <input
            id="mNote"
            placeholder="Example: For the heart"
            autoComplete="off"
            value={fields.note}
            onChange={update('note')}
          />
          <label htmlFor="mTime">Time to take it</label>
          <input id="mTime" type="time" value={fields.time} onChange={update('time')} />
        </div>
        <p className="err" role="alert">
          {error}
        </p>
        <button type="submit" className="btn">
          {`Assign to ${session.patientName}`}
        </button>
      </form>
    </section>
  )
}
