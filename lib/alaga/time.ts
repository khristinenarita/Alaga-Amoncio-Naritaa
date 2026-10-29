export function formatNow(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatClock(): string {
  return formatNow().replace(/ ?[AP]M/i, '')
}

export function parseTimeInput(value: string): { label: string; minutes: number } {
  const [hours, mins] = value.split(':').map(Number)
  const label = `${((hours + 11) % 12) + 1}:${String(mins).padStart(2, '0')}${hours < 12 ? ' AM' : ' PM'}`
  return { label, minutes: hours * 60 + mins }
}

export function firstName(fullName: string): string {
  return fullName.split(' ')[0]
}
