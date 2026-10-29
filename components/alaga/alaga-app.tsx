'use client'

import { AlagaProvider, useAlaga } from './alaga-provider'
import { BottomNav } from './bottom-nav'
import { Banner, SosModal, Toast } from './overlays'
import { StatusBar } from './status-bar'
import { TopBar } from './top-bar'
import { AuthScreen } from './screens/auth-screen'
import { FamilyAddScreen } from './screens/family-add-screen'
import { FamilyHomeScreen } from './screens/family-home-screen'
import { FamilyMedsScreen } from './screens/family-meds-screen'
import { FamilyMessagesScreen } from './screens/family-messages-screen'
import { HomeScreen } from './screens/home-screen'
import { MedsScreen } from './screens/meds-screen'
import { RoleScreen } from './screens/role-screen'
import { SentScreen } from './screens/sent-screen'
import { SosScreen } from './screens/sos-screen'
import type { ScreenId } from '@/lib/alaga/types'

const SCREENS: Record<ScreenId, () => React.JSX.Element> = {
  role: RoleScreen,
  auth: AuthScreen,
  home: HomeScreen,
  meds: MedsScreen,
  sos: SosScreen,
  sent: SentScreen,
  fhome: FamilyHomeScreen,
  fmeds: FamilyMedsScreen,
  fadd: FamilyAddScreen,
  fmsgs: FamilyMessagesScreen,
}

function Phone() {
  const { screen } = useAlaga()
  const Screen = SCREENS[screen]

  return (
    <div className="phone">
      <div className="island" aria-hidden="true" />
      <StatusBar />
      <TopBar />
      <div className="body">
        <Screen key={screen} />
      </div>
      <BottomNav />
      <div className="home-ind" aria-hidden="true">
        <b />
      </div>
      <SosModal />
      <Banner />
      <Toast />
    </div>
  )
}

export function AlagaApp() {
  return (
    <AlagaProvider>
      <div className="wrap">
        <main className="device">
          <i className="a" aria-hidden="true" />
          <i className="b" aria-hidden="true" />
          <i className="c" aria-hidden="true" />
          <i className="d" aria-hidden="true" />
          <Phone />
        </main>
      </div>
    </AlagaProvider>
  )
}
