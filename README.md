# Alaga – Interactive Navigation Flow

A medicine reminder and SOS prototype for patients and their family caregivers, built with Next.js (App Router), React and TypeScript.

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

Demo accounts:

| Role    | Login           | Password | Family code |
| ------- | --------------- | -------- | ----------- |
| Patient | `remy`          | `1234`   | `ALG-4821`  |
| Family  | `ana@email.com` | `ana123` | `ALG-4821`  |

## Project structure

```
app/
  layout.tsx            Fonts, metadata, global styles
  page.tsx              Renders <AlagaApp />
  alaga.css             App styles (phone frame, cards, buttons, nav…)
components/alaga/
  alaga-app.tsx         Phone shell + screen router
  alaga-provider.tsx    App state and actions (React context)
  top-bar.tsx           Header with title, back and log out
  bottom-nav.tsx        Patient / family tab bar
  status-bar.tsx        Live clock
  overlays.tsx          Banner, toast and SOS confirm modal
  screens/
    role-screen.tsx             Choose patient or family
    auth-screen.tsx             Log in / create account
    home-screen.tsx             Patient home (next medicine)
    meds-screen.tsx             Patient dose log
    sos-screen.tsx              SOS button
    sent-screen.tsx             SOS sent confirmation
    family-home-screen.tsx      Caregiver overview
    family-meds-screen.tsx      Caregiver dose log
    family-add-screen.tsx       Assign a medicine
    family-messages-screen.tsx  Messages from the patient
lib/alaga/
  types.ts              Shared TypeScript types
  data.ts               Seed medicines, demo accounts, screen config
  time.ts               Time formatting helpers
```

## Notes

State lives in memory (same as the original single-file prototype), so it resets on reload. To make accounts and medicines persistent, connect a database (for example Neon) and replace the provider actions with server actions.
