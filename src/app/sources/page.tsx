import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SourcesFolderCover } from "@/components/SourcesFolderCover"
import type { RssSource } from "@/lib/types"
import type { Metadata } from "next"

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-14">
        <div className="max-w-6xl mx-auto">
          {/* Real heading kept for accessibility/SEO — visually the
              folder's own paperclipped label carries the page title now,
              so this doesn't need to render on screen too. */}
          <h1 className="sr-only">Sources</h1>

          <div className="flex flex-wrap items-start gap-10">
            <div className="flex-1 min-w-[240px] basis-[300px]" style={{ paddingTop: "clamp(24px, 6vw, 64px)" }}>
              <p className="text-indigo leading-relaxed max-w-[26ch]" style={{ fontSize: "clamp(18px, 2.4vw, 25px)" }}>
                We aggregate content from trusted publications, government agencies,
                and research institutions covering art market financial crime.
              </p>
            </div>
            <div className="flex-1 min-w-[320px] basis-[460px] flex justify-center">
              <SourcesFolderCover groupedSources={groupedSources} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
