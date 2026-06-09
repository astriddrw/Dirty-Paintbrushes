import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
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
    <html lang="en" className={`${playfairDisplay.variable} ${dmSans.variable} bg-background`}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
