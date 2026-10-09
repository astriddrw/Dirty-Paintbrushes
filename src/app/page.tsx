import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HomeHero } from "@/components/HomeHero"
import { NewsletterMarquee } from "@/components/newsletter-marquee"
import { HomeArticleRow } from "@/components/HomeArticleRow"
import { NewsletterSignupModal } from "@/components/newsletter-signup-modal"
import { formatHeaderTimestamp } from "@/lib/utils"
import type { Article } from "@/lib/types"

export default async function HomePage() {
  const supabase = createClient()
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    // nullsFirst: false — Postgres' default for DESC is NULLS FIRST, which
    // would otherwise permanently pin any article missing a published_date
    // at the very top, ahead of everything actually recent.
    .order("published_date", { ascending: false, nullsFirst: false })
    .limit(5)

  const articles: Article[] = (data ?? []) as Article[]
  // Computed once, server-side, at request time — not a live client clock.
  const dateTime = formatHeaderTimestamp(new Date())

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1">
        <HomeHero />

        {/* Latest Intelligence — real published articles, in the homepage's
            own row style (HomeArticleRow): no divider lines, generous gap
            between entries instead. */}
        <section className="px-6 lg:px-8 py-16 lg:py-20 bg-light-blue">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs text-muted-foreground mb-3">{dateTime}</p>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl lg:text-3xl font-headline font-semibold tracking-tight text-indigo">
                Latest Intelligence
              </h2>
              <Link
                href="/feed"
                className="font-nav uppercase text-[15px] font-light text-indigo hover:opacity-70 transition-opacity"
              >
                View all →
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-8 max-w-xl">
              Every article is filtered and classified before publication.{" "}
              <Link
                href="/sources"
                className="underline decoration-1 underline-offset-4 hover:opacity-70 transition-opacity"
              >
                See our sources
              </Link>
              .
            </p>

            {articles.length > 0 ? (
              <>
                <div className="flex flex-col gap-10">
                  {articles.map((article) => (
                    <HomeArticleRow key={article.id} article={article} />
                  ))}
                </div>

                <div className="flex justify-center mt-10">
                  <Link
                    href="/feed"
                    className="px-8 py-3 bg-indigo text-background font-nav uppercase text-[15px] font-light hover:opacity-80 transition-opacity"
                  >
                    Look for more
                  </Link>
                </div>
              </>
            ) : (
              <div className="border-t border-border py-16 text-center">
                <p className="text-muted-foreground">
                  New intelligence is added daily. Check back soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <NewsletterMarquee />

      <Footer />
      <NewsletterSignupModal />
    </div>
  )
}
