import type { Metadata } from 'next'
import { Instrument_Serif, DM_Sans, Noto_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
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
  title: 'Dirty Paintbrushes | Art Market Financial Crime Intelligence',
  description: 'The tracker for financial crime in the art world. Fraud, money laundering, terror financing, sanctions. All in one place, updated regularly.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable} ${notoSans.variable} ${berky.variable} bg-background`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
