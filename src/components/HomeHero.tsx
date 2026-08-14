import Link from "next/link"

export function HomeHero() {
  return (
    <section className="px-6 lg:px-8 py-8 bg-indigo">
      <div className="max-w-5xl mx-auto flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h1
          className="text-4xl lg:text-5xl font-serif italic font-normal leading-tight text-aged-vellum animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          Dirty Paintbrushes
        </h1>

        <p
          className="text-base text-aged-vellum animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          Curated intelligence and news tracking art market financial crime.
        </p>

        {/* CTA — text-link style, no button chrome */}
        <div
          className="flex flex-row gap-6 items-center ml-auto animate-fade-in-up"
          style={{ animationDelay: '500ms' }}
        >
          <Link
            href="/feed"
            className="font-serif italic text-base text-ochre-on-dark underline decoration-1 decoration-ochre-on-dark underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Explore Feed
          </Link>
          <Link
            href="/sources"
            className="font-serif italic text-base text-aged-vellum underline decoration-1 decoration-aged-vellum/50 underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Browse Sources
          </Link>
        </div>
      </div>
    </section>
  )
}
