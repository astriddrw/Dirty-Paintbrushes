import Link from "next/link"

export function HomeHero() {
  return (
    <section className="px-6 lg:px-8 py-20 lg:py-36 flex items-center justify-center min-h-[45vh] bg-indigo">
      <div className="max-w-2xl mx-auto text-center">
        <div className="space-y-8">
          {/* Main Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-serif italic font-normal leading-tight text-aged-vellum animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Dirty Paintbrushes
          </h1>

          {/* Subheading */}
          <p
            className="text-lg lg:text-xl leading-relaxed text-aged-vellum animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            Curated intelligence and news tracking art market financial crime.
          </p>

          {/* CTA — text-link style, no button chrome */}
          <div
            className="flex flex-row gap-8 justify-center items-center animate-fade-in-up"
            style={{ animationDelay: '500ms' }}
          >
            <Link
              href="/feed"
              className="font-serif italic text-lg text-ochre-on-dark underline decoration-1 decoration-ochre-on-dark underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Explore Feed
            </Link>
            <Link
              href="/sources"
              className="font-serif italic text-lg text-aged-vellum underline decoration-1 decoration-aged-vellum/50 underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Browse Sources
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
