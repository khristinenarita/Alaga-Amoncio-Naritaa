import type { Accounts, Med, ScreenId, Session } from './types'

export const SEED_MEDS: readonly Med[] = [
  { name: 'Losartan 50 mg', note: 'For blood pressure', time: '8:00 AM', minutes: 480, takenAt: '8:04 AM' },
  { name: 'Metformin 500 mg', note: 'For blood sugar', time: '12:00 PM', minutes: 720, takenAt: null },
  { name: 'Amlodipine 5 mg', note: 'For blood pressure', time: '8:00 PM', minutes: 1200, takenAt: null },
]

export const SEED_ACCOUNTS: Accounts = {
  p: [{ name: 'Remy Villanueva', user: 'remy', pass: '1234', code: 'ALG-4821' }],
  f: [{ name: 'Ana Villanueva', user: 'ana@email.com', pass: 'ana123', code: 'ALG-4821' }],
}

export const DEFAULT_SESSION: Session = {
  code: '',
  patientFull: 'Remy',
  patientName: 'Remy',
  familyName: 'your family',
}

export const SCREEN_TITLES: Record<ScreenId, [string, string]> = {
  role: ['Alaga', 'Who is using the app?'],
  auth: ['', ''],
  home: ['Home', 'Good morning'],
  meds: ['Medicines', 'Reminders and dose log'],
  sos: ['SOS', 'Emergency help'],
  sent: ['Alert sent', 'SOS'],
  fhome: ['Family Dashboard', 'Caregiver'],
  fmeds: ['Medicines', 'Dose log'],
  fadd: ['Assign a medicine', ''],
  fmsgs: ['Messages', 'From patient'],
}

export const BACK_TARGET: Partial<Record<ScreenId, ScreenId>> = {
  sent: 'sos',
  auth: 'role',
  fadd: 'fmeds',
}

export interface NavItem {
  id: ScreenId
  icon: string
  label: string
}

export const PATIENT_NAV: NavItem[] = [
  { id: 'home', icon: '⌂', label: 'Home' },
  { id: 'meds', icon: '✚', label: 'Medicines' },
  { id: 'sos', icon: '!', label: 'SOS' },
]

export const FAMILY_NAV: NavItem[] = [
  { id: 'fhome', icon: '⌂', label: 'Overview' },
  { id: 'fmeds', icon: '✚', label: 'Medicines' },
  { id: 'fmsgs', icon: '✉', label: 'Messages' },
]

export const DEMO_CREDENTIALS = {
  p: { user: 'remy', pass: '1234' },
  f: { user: 'ana@email.com', pass: 'ana123' },
} as const

export const DEMO_FAMILY_CODE = 'ALG-4821'
