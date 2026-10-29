import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Alaga',
    short_name: 'Alaga',
    description: 'Alaga helps patients track medicines and send SOS alerts, while family caregivers check in and assign medicines.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#033A47',
    icons: [
      {
        src: '/icon-light-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}