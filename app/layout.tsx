import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import './alaga.css'

const sans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-alaga-sans',
})

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-alaga-serif',
})

export const metadata: Metadata = {
  title: 'Alaga – Interactive Navigation Flow',
  description:
    'Alaga helps patients track medicines and send SOS alerts, while family caregivers check in and assign medicines.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#033A47',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
