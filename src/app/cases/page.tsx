import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FadeInHeading } from "@/components/FadeInHeading"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cases",
  description: "Documented cases of financial crime in the art market, tracked from investigation through to resolution.",
}

export default function CasesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto text-center py-16 lg:py-24">
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-oxblood mb-6 font-headline">
            Case Tracker
          </FadeInHeading>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            We&apos;re building out full case files that tie coverage of the same matter together over time. In the
            meantime, the feed carries all the latest reporting.
          </p>
          <a
            href="/feed"
            className="inline-flex items-center justify-center px-8 py-3 bg-indigo text-background font-nav uppercase text-[15px] font-light hover:opacity-80 transition-opacity"
          >
            Browse the Feed
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
