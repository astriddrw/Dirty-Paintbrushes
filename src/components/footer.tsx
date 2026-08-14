export function Footer() {
  return (
    <footer className="border-t border-border bg-indigo">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Copyright and tagline */}
          <div>
            <p className="text-sm font-serif font-semibold text-aged-vellum mb-2">
              Dirty Paintbrushes
            </p>
            <p className="text-sm text-aged-vellum">
              Tracking financial crime in the art world
            </p>
            <p className="text-xs text-aged-vellum mt-4">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col gap-3">
            <a href="/" className="text-sm font-light text-white hover:opacity-70 transition-opacity">
              Home
            </a>
            <a href="/feed" className="text-sm font-light text-white hover:opacity-70 transition-opacity">
              Feed
            </a>
            <a href="/about" className="text-sm font-light text-white hover:opacity-70 transition-opacity">
              About
            </a>
            <a href="/sources" className="text-sm font-light text-white hover:opacity-70 transition-opacity">
              Sources
            </a>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="border-t border-white/20 pt-8 space-y-4">
          <div className="text-xs text-aged-vellum leading-relaxed">
            <p className="font-semibold text-white mb-2">Disclaimer</p>
            <p className="mb-4">
              Comments reflect individual views and do not constitute verified intelligence. Users are responsible for the accuracy and legality of their contributions.
            </p>
            <p>
              This platform reflects personal research and views only, and is not affiliated with any employer or organisation.
            </p>
          </div>

          {/* Quiet admin entry point — deliberately not a public CTA, so it
              lives here rather than in the primary nav list above. */}
          <div className="flex justify-end">
            <a
              href="/admin"
              className="text-xs text-aged-vellum/70 hover:text-aged-vellum transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
