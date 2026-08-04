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
          <section className="px-6 lg:px-8 py-16 lg:py-20 border-t border-border">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-serif italic text-indigo">
                  Latest Intelligence
                </h2>
                <Link
                  href="/feed"
                  className="text-sm text-indigo hover:opacity-70 transition-opacity"
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
            </div>
          </section>
        )}

        {/* About Section - Editorial Content */}
        <section className="px-6 lg:px-8 py-24 lg:py-32 border-t border-border bg-[#E6E2C5]">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6 text-base leading-relaxed text-foreground">
              <h2 className="text-3xl font-serif font-normal mb-6">Why Dirty Paintbrushes?</h2>

              <p>
                The art market is a sector that has long been overlooked from a regulatory perspective. It is highly opaque and inherently cross-border, which makes it particularly vulnerable to fraud, tax evasion, sanctions circumvention, and in some cases, the financing of criminal networks.
              </p>

              <p>
                Dirty Paintbrushes started as a research question. How can something as cultural and subjective as art be used to move and obscure illicit finance?
              </p>

              <p>
                While studying International Relations at King&apos;s College London, I focused on financial crime and non-traditional assets. During my exchange at Georgetown University, I developed a research paper titled &ldquo;Dirty Paintbrushes: The Use of the Art Market in Financing Terrorist Activity&rdquo;, looking at recent case studies in the UK and US, from NFTs to antiquities.
              </p>

              <p>
                That work led me to focus more closely on the art market as a financial crime risk area, and made it clear how fragmented this space is. Information is difficult to track, often reactive, and rarely brought together in one place.
              </p>

              <p>
                This platform is a way to collate and follow developments at the intersection of the art market and financial crime. It is designed for anyone interested in this space who wants a clearer, more efficient way to stay informed. You can also use the comment feature to add analysis, flag connections, and interact with others following this area.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation to Other Pages */}
        <section className="px-6 lg:px-8 py-24 lg:py-32 border-t border-border">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-8 lg:gap-12">
              <Link
                href="/feed"
                className="group border border-ochre p-6 hover:bg-oxblood transition-all"
              >
                <h3 className="font-serif text-lg mb-2 group-hover:underline group-hover:text-white">Browse Feed</h3>
                <p className="text-sm text-muted-foreground">Real-time aggregated reporting on art market financial crime.</p>
              </Link>
              <Link
                href="/sources"
                className="group border border-ochre p-6 hover:bg-oxblood transition-all"
              >
                <h3 className="font-serif text-lg mb-2 group-hover:underline group-hover:text-white">Sources</h3>
                <p className="text-sm text-muted-foreground">Trusted publications, regulatory bodies, and investigative outlets.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
