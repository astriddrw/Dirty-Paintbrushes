"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { ArticleRow } from "@/components/article-row"
import { useBookmarks } from "@/lib/bookmarks-context"
import { createClient } from "@/lib/supabase/client"
import { Bookmark, ArrowRight } from "lucide-react"
import type { Article } from "@/lib/types"

export function SavedContent() {
  const { bookmarkedIds } = useBookmarks()
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch bookmarked articles from Supabase when bookmarkedIds change
  useEffect(() => {
    const ids = Array.from(bookmarkedIds)
    if (ids.length === 0) {
      setAllArticles([])
      setLoading(false)
      return
    }

    const supabase = createClient()
    supabase
      .from("articles")
      .select("*")
      .in("id", ids)
      .order("published_date", { ascending: false })
      .then(({ data }) => {
        setAllArticles((data ?? []) as Article[])
        setLoading(false)
      })
  }, [bookmarkedIds])

  const savedArticles = useMemo(() => {
    return allArticles.filter((article) => bookmarkedIds.has(article.id))
  }, [allArticles, bookmarkedIds])

  return (
    <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl lg:text-5xl font-normal tracking-tight text-foreground mb-4 font-serif">
          Saved Articles
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Your bookmarked articles for easy reference.
        </p>

        {/* Articles List */}
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground text-sm">Loading…</p>
          </div>
        ) : savedArticles.length > 0 ? (
          <>
            <div className="border-t border-border">
              {savedArticles.map((article, index) => (
                <ArticleRow key={article.id} article={article} index={index} />
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              {savedArticles.length} saved article
              {savedArticles.length !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          /* Empty State */
          <div className="border border-border rounded-lg p-12 lg:p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Bookmark className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              No saved articles yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Browse the feed and click the bookmark icon on any article to save
              it here for later.
            </p>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium text-sm rounded-md hover:bg-primary/90 transition-colors"
            >
              Browse the Feed
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
