'use client'

import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section - Centered, Editorial */}
        <section className="px-6 lg:px-8 py-32 lg:py-64 flex items-center justify-center min-h-[70vh] bg-[#2B4593]">
          <div className="max-w-2xl mx-auto text-center">
            <div className="space-y-8">
              {/* Main Headline */}
              <h1
                className={`text-5xl sm:text-6xl lg:text-7xl font-serif italic font-normal leading-tight text-[#E6E2C5] transition-all duration-1000 ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '100ms' }}
              >
                Dirty Paintbrushes
              </h1>

              {/* Subheading */}
              <p
                className={`text-lg lg:text-xl leading-relaxed text-[#E6E2C5] transition-all duration-1000 ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                The tracker for financial crime in the art world. Fraud, money laundering, terror financing, sanctions. All in one place, up to date.
              </p>

              {/* CTA — text-link style, no button chrome */}
              <div
                className={`flex flex-row gap-8 justify-center items-center transition-all duration-1000 ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '500ms' }}
              >
                <Link
                  href="/feed"
                  className="font-serif italic text-lg text-ochre underline decoration-1 decoration-ochre underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  Explore Feed
                </Link>
                <Link
                  href="/saved"
                  className="font-serif italic text-lg text-[#E6E2C5] underline decoration-1 decoration-[#E6E2C5]/50 underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  Saved Articles
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section - Editorial Content */}
        <section className="px-6 lg:px-8 py-24 lg:py-32 border-t border-border bg-[#E6E2C5]">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6 text-base leading-relaxed text-foreground">
              <h2 className="text-3xl font-serif font-normal mb-6">Why Dirty Paintbrushes?</h2>

              <p>
                The art market is a sector that has long been overlooked from a regulatory perspective. It is highly opaque and inherently cross-border, which makes it particularly vulnerable to fraud, tax evasion, sanctions circumvention, and in some cases, the financing of criminal networks.
              </p>

              <p>
                Dirty Paintbrushes started as a research question. How can something as cultural and subjective as art be used to move and obscure illicit finance?
              </p>

              <p>
                While studying International Relations at King&apos;s College London, I focused on financial crime and non-traditional assets. During my exchange at Georgetown University, I developed a research paper titled &ldquo;Dirty Paintbrushes: The Use of the Art Market in Financing Terrorist Activity&rdquo;, looking at recent case studies in the UK and US, from NFTs to antiquities.
              </p>

              <p>
                That work led me to focus more closely on the art market as a financial crime risk area, and made it clear how fragmented this space is. Information is difficult to track, often reactive, and rarely brought together in one place.
              </p>

              <p>
                This platform is a way to collate and follow developments at the intersection of the art market and financial crime. It is designed for anyone interested in this space who wants a clearer, more efficient way to stay informed. You can also use the comment feature to add analysis, flag connections, and interact with others following this area.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation to Other Pages */}
        <section className="px-6 lg:px-8 py-24 lg:py-32 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-8 lg:gap-12">
              <Link
                href="/feed"
                className="group border border-ochre p-6 hover:bg-secondary transition-all"
              >
                <h3 className="font-serif text-lg mb-2 group-hover:underline group-hover:text-ochre">Browse Feed</h3>
                <p className="text-sm text-muted-foreground">Real-time aggregated reporting on art market financial crime.</p>
              </Link>
              <Link
                href="/sources"
                className="group border border-ochre p-6 hover:bg-secondary transition-all"
              >
                <h3 className="font-serif text-lg mb-2 group-hover:underline group-hover:text-ochre">Sources</h3>
                <p className="text-sm text-muted-foreground">Trusted publications, regulatory bodies, and investigative outlets.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
