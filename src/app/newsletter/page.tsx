import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { FadeInHeading } from "@/components/FadeInHeading"

export const metadata = {
  title: "Newsletter | Dirty Paintbrushes",
  description: "A monthly digest of art market financial crime intelligence, once a month, curated not automated.",
}

export default function NewsletterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-oxblood mb-6 font-headline">
            Monthly digest
          </FadeInHeading>

          <div className="space-y-4 text-base leading-relaxed text-foreground mb-10">
            <p>
              Once a month, a roundup of what mattered in art market financial crime, grouped by
              case type, reviewed by hand before it goes out.
            </p>
            <p className="text-sm text-muted-foreground">
              No spam, unsubscribe any time.
            </p>
          </div>

          <NewsletterSignup variant="full" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
