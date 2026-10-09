import type { Metadata } from 'next'
import { Instrument_Serif, Noto_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import { AuthProvider } from '@/lib/auth-context'
import { LenisSmoothScroll } from '@/components/LenisSmoothScroll'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
})

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-nav',
  display: 'swap',
})

const berky = localFont({
  src: './fonts/BERKY.ttf',
  variable: '--font-brand',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://dirtypaintbrushes.com'),
  title: 'Dirty Paintbrushes | Art Market Financial Crime Intelligence',
  description: 'The tracker for financial crime in the art world. Fraud, money laundering, terror financing, sanctions. All in one place, updated regularly.',
  openGraph: {
    title: 'Dirty Paintbrushes',
    description: 'Curated intelligence and news tracking art market financial crime.',
    url: 'https://dirtypaintbrushes.com',
    siteName: 'Dirty Paintbrushes',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dirty Paintbrushes',
    description: 'Curated intelligence and news tracking art market financial crime.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${notoSans.variable} ${berky.variable} bg-background`}>
      <body className="antialiased">
        <LenisSmoothScroll />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
