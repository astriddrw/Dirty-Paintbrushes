import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FadeInHeading } from "@/components/FadeInHeading"
import { EmailFrame } from "@/components/email-frame"
import { getSentIssueHtml, periodLabel } from "@/lib/newsletter-archive"

// Reads the database on every request (sent issues only).
export const dynamic = "force-dynamic"

export function generateMetadata({ params }: { params: { period: string } }): Metadata {
  const label = /^\d{4}-\d{2}$/.test(params.period) ? periodLabel(params.period) : "Newsletter"
  return {
    title: `The Monthly Briefing, ${label} | Dirty Paintbrushes`,
    description: `The ${label} issue of the Dirty Paintbrushes monthly newsletter on art market financial crime.`,
  }
}

// "View in browser" target for each sent issue, and the archive's pages.
export default async function NewsletterIssuePage({ params }: { params: { period: string } }) {
  const html = await getSentIssueHtml(params.period)
  if (!html) notFound()
  const label = periodLabel(params.period)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground mb-2">
            <a href="/newsletter" className="underline underline-offset-4 hover:text-oxblood">
              Newsletter
            </a>
          </p>
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-oxblood mb-8 font-headline">
            {label}
          </FadeInHeading>
          <EmailFrame html={html} title={`The Monthly Briefing, ${label}`} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
