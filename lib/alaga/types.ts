export type Role = 'p' | 'f'

export type AuthMode = 'in' | 'up'

export type ScreenId =
  | 'role'
  | 'auth'
  | 'home'
  | 'meds'
  | 'sos'
  | 'sent'
  | 'fhome'
  | 'fmeds'
  | 'fadd'
  | 'fmsgs'

export interface Med {
  name: string
  note: string
  time: string
  minutes: number
  takenAt: string | null
  addedBy?: string
}

export interface Account {
  name: string
  user: string
  pass: string
  code: string
}

export type Accounts = Record<Role, Account[]>

export interface Message {
  text: string
  time: string
  sos: boolean
  code: string
}

export interface Session {
  code: string
  patientFull: string
  patientName: string
  familyName: string
}

export interface BannerState {
  title: string
  text: string
  sos: boolean
  visible: boolean
}

export interface SignUpFields {
  name: string
  user: string
  pass: string
  code: string
}

export interface NewMedFields {
  name: string
  note: string
  time: string
}
