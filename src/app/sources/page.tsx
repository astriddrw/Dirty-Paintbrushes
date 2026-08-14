import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ExternalLink } from "lucide-react"
import { TIER_GROUP_LABELS, TIER_DESCRIPTIONS } from "@/lib/data"
import type { RssSource } from "@/lib/types"
import type { Metadata } from "next"
import { FadeInHeading } from "@/components/FadeInHeading"
import { formatTag } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Sources | Dirty Paintbrushes",
  description:
    "We aggregate content from trusted publications, government agencies, and research institutions covering art market financial crime.",
}

const tierOrder = ["tier1", "tier2", "tier3", "tier4", "tier5"] as const

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

  const tierCount = tierOrder.filter((tier) => (groupedSources[tier]?.length ?? 0) > 0).length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-indigo mb-4 font-headline">
            Sources
          </FadeInHeading>
          <p className="text-lg text-indigo mb-2 max-w-2xl leading-relaxed">
            We aggregate content from trusted publications, government agencies,
            and research institutions covering art market financial crime.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {sources.length} active source{sources.length !== 1 ? "s" : ""} across {tierCount} tier
            {tierCount !== 1 ? "s" : ""}.
          </p>

          {/* Jump to tier — a quiet inline sentence, not a second label row.
              An uppercase-tracked nav here duplicated the tier heading
              directly below it almost verbatim and read as a stutter. */}
          {tierCount > 1 && (
            <nav aria-label="Jump to tier" className="text-xs text-muted-foreground mb-10">
              Jump to:{" "}
              {tierOrder
                .filter((tier) => groupedSources[tier]?.length)
                .map((tier, i, arr) => (
                  <span key={tier}>
                    <a
                      href={`#${tier}`}
                      className="underline decoration-1 decoration-muted-foreground/40 hover:decoration-indigo hover:text-indigo underline-offset-4 transition-colors"
                    >
                      {TIER_GROUP_LABELS[tier]}
                    </a>
                    {i < arr.length - 1 ? ", " : "."}
                  </span>
                ))}
            </nav>
          )}

          {/* Sources by Tier */}
          <div className="flex flex-col gap-10">
            {tierOrder.map((tier) => {
              const tierSources = groupedSources[tier] ?? []
              if (tierSources.length === 0) return null
              const isSearchAlert = tier === "tier5"
              return (
                <section key={tier} id={tier} className="scroll-mt-20">
                  <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-oxblood mb-1">
                    {TIER_GROUP_LABELS[tier]}
                  </h2>
                  <p className="text-sm text-oxblood mb-4">
                    {TIER_DESCRIPTIONS[tier]}
                  </p>
                  {/* A hairline border here reads as a stray light-blue rule
                      against the warm parchment field (simultaneous-contrast
                      effect — same clash the Latest Intelligence hue-match
                      fix addressed) — whitespace-only rhythm avoids it. */}
                  <div className="flex flex-col">
                    {tierSources.map((source) => (
                      <a
                        key={source.id}
                        href={source.site_url || source.feed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-4 py-3 px-2 -mx-2 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-normal text-foreground group-hover:opacity-70 transition-opacity">
                            {formatTag(source.name)}
                          </h3>
                          {isSearchAlert && (
                            <span className="text-xs font-medium text-ochre-on-light">
                              Search alert
                            </span>
                          )}
                          <span className="sr-only">(opens in a new tab)</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-indigo group-hover:opacity-70 transition-opacity flex-shrink-0 mt-1" />
                      </a>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
