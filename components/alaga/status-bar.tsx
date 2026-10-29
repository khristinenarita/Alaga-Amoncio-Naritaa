'use client'

import { useEffect, useState } from 'react'
import { formatClock } from '@/lib/alaga/time'

export function StatusBar() {
  const [clock, setClock] = useState('9:41')

  useEffect(() => {
    setClock(formatClock())
    const id = setInterval(() => setClock(formatClock()), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="status">
      <span>{clock}</span>
      <span aria-hidden="true">▂▄▆ ▮▮▮</span>
    </div>
  )
}
