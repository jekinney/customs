import React from 'react'
import type { Metadata } from 'next'
import './styles.css'
import { Header } from '@/components/site/Header'
import { Footer } from '@/components/site/Footer'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '120 Customs — Trucks Built For The Show',
    template: '%s | 120 Customs',
  },
  description:
    'Precision resto-mods, suspension drops, overland rigs and frame-off custom truck builds. Hand-fabricated since 2012.',
  icons: { icon: '/brand/120-gear-gold.png' },
  openGraph: {
    title: '120 Customs — Trucks Built For The Show',
    description: 'Custom truck builds, suspension drops and resto-mods. Since 2012.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
