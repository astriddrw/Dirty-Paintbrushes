import type { Metadata } from 'next'
import { Instrument_Serif, Roboto, Noto_Sans, Lora, Archivo } from 'next/font/google'
import localFont from 'next/font/local'
import { AuthProvider } from '@/lib/auth-context'
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

// Page-title face — the big FadeInHeading titles (Sources, Latest
// Intelligence, etc). Split from --font-title (Lora, article-row titles)
// because at this larger scale a second serif read too close to the
// Instrument Serif hero; a heavy grotesque gives it its own register.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-headline',
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
    <html lang="en" className={`${instrumentSerif.variable} ${roboto.variable} ${notoSans.variable} ${berky.variable} ${lora.variable} ${archivo.variable} bg-background`}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
