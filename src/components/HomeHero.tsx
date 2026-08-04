"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { WorldClock } from "@/components/WorldClock"

export function HomeHero() {
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
  }, [])

  return (
    <section className="relative px-6 lg:px-8 py-20 lg:py-36 flex items-center justify-center min-h-[45vh] bg-[#2B4593]">
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
              href="/sources"
              className="font-serif italic text-lg text-[#E6E2C5] underline decoration-1 decoration-[#E6E2C5]/50 underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Browse Sources
            </Link>
          </div>
        </div>
      </div>

      <WorldClock className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8 text-[#E6E2C5]" />
    </section>
  )
}
