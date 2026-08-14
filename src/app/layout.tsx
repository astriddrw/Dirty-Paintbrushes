import type { Metadata } from 'next'
import { Instrument_Serif, Roboto, Noto_Sans, Lora } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
})

// Article-title face — deliberately distinct from Instrument Serif, which is
// now scoped to the wordmark and homepage hero only, so it stays a rare,
// specific signal rather than the default headline treatment everywhere.
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-title',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
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
    <html lang="en" className={`${instrumentSerif.variable} ${roboto.variable} ${notoSans.variable} ${berky.variable} ${lora.variable} bg-background`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
