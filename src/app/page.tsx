import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HomeHero } from "@/components/HomeHero"
import { ArticleRow } from "@/components/article-row"
import { BookmarksProvider } from "@/lib/bookmarks-context"
import type { Article } from "@/lib/types"

export default async function HomePage() {
  const supabase = createClient()
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_date", { ascending: false })
    .limit(4)

  const articles: Article[] = (data ?? []) as Article[]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1">
        <HomeHero />

        {/* Latest Intelligence - real published articles, same rows as the Feed page */}
        <section className="px-6 lg:px-8 py-16 lg:py-20 border-t border-border bg-light-blue">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl lg:text-3xl font-serif italic text-indigo">
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
                <BookmarksProvider>
                  <div className="border-t border-border">
                    {articles.map((article) => (
                      <ArticleRow key={article.id} article={article} />
                    ))}
                  </div>
                </BookmarksProvider>

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
                  New intelligence is added daily — check back soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
