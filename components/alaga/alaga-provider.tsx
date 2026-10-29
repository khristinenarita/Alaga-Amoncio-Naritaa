'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_SESSION, SEED_ACCOUNTS, SEED_MEDS } from '@/lib/alaga/data'
import { firstName, formatNow, parseTimeInput } from '@/lib/alaga/time'
import type {
  Account,
  Accounts,
  AuthMode,
  BannerState,
  Med,
  Message,
  NewMedFields,
  Role,
  ScreenId,
  Session,
  SignUpFields,
} from '@/lib/alaga/types'

interface AlagaContextValue {
  screen: ScreenId
  role: Role
  authMode: AuthMode
  meds: Med[]
  sosActive: boolean
  sosAt: string
  messages: Message[]
  unread: number
  session: Session
  banner: BannerState | null
  toast: string | null
  sosModalOpen: boolean
  go: (id: ScreenId) => void
  pickRole: (role: Role) => void
  setAuthMode: (mode: AuthMode) => void
  signIn: (user: string, pass: string) => string | null
  signUp: (fields: SignUpFields) => string | null
  takeMed: (index: number) => void
  openSosModal: () => void
  closeSosModal: () => void
  confirmSos: () => void
  cancelSos: () => void
  assignMed: (fields: NewMedFields) => string | null
  showToast: (message: string) => void
}

const AlagaContext = createContext<AlagaContextValue | null>(null)

const freshMeds = () => SEED_MEDS.map((m) => ({ ...m }))

export function AlagaProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('role')
  const [role, setRole] = useState<Role>('p')
  const [authMode, setAuthModeState] = useState<AuthMode>('in')
  const [meds, setMeds] = useState<Med[]>(freshMeds)
  const [sos, setSos] = useState({ active: false, at: '' })
  const [messages, setMessages] = useState<Message[]>([])
  const [pendingForPatient, setPendingForPatient] = useState<string[]>([])
  const [unread, setUnread] = useState(0)
  const [accounts, setAccounts] = useState<Accounts>(SEED_ACCOUNTS)
  const [session, setSession] = useState<Session>(DEFAULT_SESSION)
  const [banner, setBanner] = useState<BannerState | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [sosModalOpen, setSosModalOpen] = useState(false)

  const bannerTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(
    () => () => {
      clearTimeout(bannerTimer.current)
      clearTimeout(toastTimer.current)
    },
    [],
  )

  const showBanner = useCallback((title: string, text: string, sosStyle: boolean, duration: number) => {
    setBanner({ title, text, sos: sosStyle, visible: true })
    clearTimeout(bannerTimer.current)
    bannerTimer.current = setTimeout(() => {
      setBanner((b) => (b ? { ...b, visible: false } : b))
    }, duration)
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1800)
  }, [])

  const notify = useCallback(
    (text: string, sosStyle = false) => {
      setMessages((prev) => [{ text, time: formatNow(), sos: sosStyle, code: session.code }, ...prev])
      setUnread((u) => u + 1)
      showBanner(`Message sent to ${session.familyName}`, text, sosStyle, 3200)
    },
    [session.code, session.familyName, showBanner],
  )

  const go = useCallback((id: ScreenId) => {
    if (id === 'fmsgs') setUnread(0)
    setScreen(id)
  }, [])

  const pickRole = useCallback(
    (r: Role) => {
      setRole(r)
      setAuthModeState('in')
      go('auth')
    },
    [go],
  )

  const login = useCallback(
    (account: Account, r: Role, list: Accounts) => {
      const patient = r === 'p' ? account : list.p.find((x) => x.code === account.code)
      const family = r === 'f' ? account : list.f.find((x) => x.code === account.code)
      setSession({
        code: account.code,
        patientFull: patient?.name ?? 'Remy',
        patientName: firstName(patient?.name ?? 'Remy'),
        familyName: family ? firstName(family.name) : 'your family',
      })
      go(r === 'p' ? 'home' : 'fhome')
      if (r === 'p' && pendingForPatient.length) {
        showBanner('New medicine', pendingForPatient.join(' '), false, 4200)
        setPendingForPatient([])
      }
    },
    [go, pendingForPatient, showBanner],
  )

  const signIn = useCallback(
    (userInput: string, pass: string) => {
      const user = userInput.trim().toLowerCase()
      const account = accounts[role].find((x) => x.user === user && x.pass === pass)
      if (!account) {
        return `Wrong ${role === 'f' ? 'email' : 'username'} or password. Please try again.`
      }
      login(account, role, accounts)
      return null
    },
    [accounts, login, role],
  )

  const signUp = useCallback(
    (fields: SignUpFields) => {
      const name = fields.name.trim()
      const user = fields.user.trim().toLowerCase()
      const pass = fields.pass
      const enteredCode = fields.code.trim().toUpperCase()
      const userLabel = role === 'f' ? 'email' : 'username'

      if (!name || !user || !pass) return 'Please fill in every box.'
      if (pass.length < 4) return 'Password needs at least 4 characters.'
      if (accounts[role].some((x) => x.user === user)) {
        return `That ${userLabel} is already used. Try logging in.`
      }

      let code = enteredCode
      if (role === 'f') {
        if (!accounts.p.some((x) => x.code === enteredCode)) {
          return 'Family code not found. Ask the patient for their code.'
        }
      } else {
        code = `ALG-${Math.floor(1000 + Math.random() * 9000)}`
        setMeds(freshMeds().map((m) => ({ ...m, takenAt: null })))
        setSos({ active: false, at: '' })
      }

      const account: Account = { name, user, pass, code }
      const nextAccounts: Accounts = { ...accounts, [role]: [...accounts[role], account] }
      setAccounts(nextAccounts)
      login(account, role, nextAccounts)
      showToast(role === 'p' ? `Account created. Family code: ${code}` : 'Account created. You are linked.')
      return null
    },
    [accounts, login, role, showToast],
  )

  const takeMed = useCallback(
    (index: number) => {
      const med = meds[index]
      if (!med || med.takenAt) return
      const time = formatNow()
      setMeds((prev) => prev.map((m, i) => (i === index ? { ...m, takenAt: time } : m)))
      notify(`${session.patientName} took ${med.name} at ${time}.`)
    },
    [meds, notify, session.patientName],
  )

  const confirmSos = useCallback(() => {
    setSosModalOpen(false)
    const at = formatNow()
    setSos({ active: true, at })
    go('sent')
    notify(`SOS from ${session.patientName} at ${at}. Location: Davao City. Please call now.`, true)
  }, [go, notify, session.patientName])

  const cancelSos = useCallback(() => {
    setSos((s) => ({ ...s, active: false }))
    go('home')
    notify(`${session.patientName} is okay. The SOS alert was cancelled.`)
  }, [go, notify, session.patientName])

  const assignMed = useCallback(
    (fields: NewMedFields) => {
      const name = fields.name.trim()
      if (!name || !fields.time) return 'Please enter the medicine name and the time.'
      const { label, minutes } = parseTimeInput(fields.time)
      const med: Med = {
        name,
        note: fields.note.trim() || 'Take as directed',
        time: label,
        minutes,
        takenAt: null,
        addedBy: session.familyName,
      }
      setMeds((prev) => [...prev, med].sort((a, b) => a.minutes - b.minutes))
      setPendingForPatient((p) => [...p, `${session.familyName} added ${name} at ${label}.`])
      go('fmeds')
      showToast(`${name} assigned to ${session.patientName}`)
      return null
    },
    [go, session.familyName, session.patientName, showToast],
  )

  const value = useMemo<AlagaContextValue>(
    () => ({
      screen,
      role,
      authMode,
      meds,
      sosActive: sos.active,
      sosAt: sos.at,
      messages,
      unread,
      session,
      banner,
      toast,
      sosModalOpen,
      go,
      pickRole,
      setAuthMode: setAuthModeState,
      signIn,
      signUp,
      takeMed,
      openSosModal: () => setSosModalOpen(true),
      closeSosModal: () => setSosModalOpen(false),
      confirmSos,
      cancelSos,
      assignMed,
      showToast,
    }),
    [
      screen,
      role,
      authMode,
      meds,
      sos,
      messages,
      unread,
      session,
      banner,
      toast,
      sosModalOpen,
      go,
      pickRole,
      signIn,
      signUp,
      takeMed,
      confirmSos,
      cancelSos,
      assignMed,
      showToast,
    ],
  )

  return <AlagaContext.Provider value={value}>{children}</AlagaContext.Provider>
}

export function useAlaga() {
  const ctx = useContext(AlagaContext)
  if (!ctx) throw new Error('useAlaga must be used within AlagaProvider')
  return ctx
}
