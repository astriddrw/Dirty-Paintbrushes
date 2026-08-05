import Link from "next/link"

export function HomeHero() {
  return (
    <section className="px-6 lg:px-8 py-20 lg:py-36 flex items-center justify-center min-h-[45vh] bg-[#2B4593]">
      <div className="max-w-2xl mx-auto text-center">
        <div className="space-y-8">
          {/* Main Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-serif italic font-normal leading-tight text-[#E6E2C5] animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Dirty Paintbrushes
          </h1>

          {/* Subheading */}
          <p
            className="text-lg lg:text-xl leading-relaxed text-[#E6E2C5] animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            The tracker for financial crime in the art world. Fraud, money laundering, terror financing, sanctions. All in one place, up to date.
          </p>

          {/* CTA — text-link style, no button chrome */}
          <div
            className="flex flex-row gap-8 justify-center items-center animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
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
    </section>
  )
}
