export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Copyright and tagline */}
          <div>
            <p className="text-sm font-serif font-semibold text-foreground mb-2">
              Dirty Paintbrushes
            </p>
            <p className="text-sm text-muted-foreground">
              Tracking financial crime in the art world
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col gap-3">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </a>
            <a href="/feed" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Feed
            </a>
            <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="/sources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sources
            </a>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="border-t border-border pt-8 space-y-4">
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-2">Disclaimer</p>
            <p className="mb-4">
              Comments reflect individual views and do not constitute verified intelligence. Users are responsible for the accuracy and legality of their contributions.
            </p>
            <p>
              This platform reflects personal research and views only, and is not affiliated with any employer or organisation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
