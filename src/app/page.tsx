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
    .limit(5)

  const articles: Article[] = (data ?? []) as Article[]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1">
        <HomeHero />

        {/* Latest Intelligence - real published articles, same rows as the Feed page */}
        {articles.length > 0 && (
          <section className="px-6 lg:px-8 py-16 lg:py-20 border-t border-border bg-light-blue">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
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
            </div>
          </section>
        )}

        {/* Navigation to Other Pages */}
        <section className="px-6 lg:px-8 py-24 lg:py-32 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-8 lg:gap-12">
              <Link
                href="/feed"
                className="group border border-oxblood p-6 hover:border-ochre transition-all"
              >
                <h3 className="font-serif italic text-lg mb-2 text-center text-oxblood group-hover:text-ochre-on-light group-hover:underline transition-colors">Browse Feed</h3>
                <p className="text-sm text-center text-muted-foreground">Curated intelligence and news tracking art market financial crime.</p>
              </Link>
              <Link
                href="/sources"
                className="group border border-oxblood p-6 hover:border-ochre transition-all"
              >
                <h3 className="font-serif italic text-lg mb-2 text-center text-oxblood group-hover:text-ochre-on-light group-hover:underline transition-colors">Sources</h3>
                <p className="text-sm text-center text-muted-foreground">Trusted publications, regulatory bodies, and investigative outlets.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
