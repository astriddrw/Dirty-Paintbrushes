import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ExternalLink } from "lucide-react"
import { TIER_GROUP_LABELS, TIER_DESCRIPTIONS } from "@/lib/data"
import type { RssSource } from "@/lib/types"
import type { Metadata } from "next"
import Link from "next/link"
import { FadeInHeading } from "@/components/FadeInHeading"
import { formatTag } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Sources | Dirty Paintbrushes",
  description:
    "We aggregate content from trusted publications, government agencies, and research institutions covering art market financial crime.",
}

const tierOrder = ["tier1", "tier2", "tier3", "tier5", "tier4"] as const

export default async function SourcesPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from("rss_sources")
    .select("*")
    .eq("active", true)
    .order("name")

  const sources: RssSource[] = (data ?? []) as RssSource[]

  const groupedSources = tierOrder.reduce((acc, tier) => {
    acc[tier] = sources.filter((s) => s.tier === tier)
    return acc
  }, {} as Record<string, RssSource[]>)

  return (
    <div className="min-h-screen flex flex-col bg-light-blue">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <FadeInHeading className="text-4xl lg:text-5xl italic font-normal tracking-tight text-indigo mb-4 font-serif">
            Sources
          </FadeInHeading>
          <p className="text-lg text-indigo mb-12 max-w-2xl leading-relaxed">
            We aggregate content from trusted publications, government agencies,
            and research institutions covering art market financial crime.
          </p>

          {/* Sources by Tier */}
          <div className="flex flex-col gap-12">
            {tierOrder.map((tier) => {
              const tierSources = groupedSources[tier] ?? []
              if (tierSources.length === 0) return null
              return (
                <section key={tier}>
                  <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-ochre mb-1">
                    {TIER_GROUP_LABELS[tier]}
                  </h2>
                  <p className="text-sm text-indigo mb-6">
                    {TIER_DESCRIPTIONS[tier]}
                  </p>
                  <div className="flex flex-col gap-4">
                    {tierSources.map((source) => (
                      <a
                        key={source.id}
                        href={source.feed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-4 p-4 -mx-4 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <h3 className="text-base font-medium text-indigo group-hover:opacity-70 transition-opacity">
                          {formatTag(source.name)}
                        </h3>
                        <ExternalLink className="h-4 w-4 text-indigo hover:opacity-70 transition-opacity flex-shrink-0 mt-1" />
                      </a>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

          {/* Quiet admin entry point — not meant to be a public CTA */}
          <div className="mt-16 flex justify-center">
            <Link
              href="/admin"
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
