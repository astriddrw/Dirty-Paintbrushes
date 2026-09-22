"use client"

import { useId, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArticleRow } from "@/components/article-row"
import { FadeInHeading } from "@/components/FadeInHeading"
import { Search, X } from "lucide-react"
import { cn, FEED_PAGE_SIZE } from "@/lib/utils"
import { articleTypeLabels } from "@/lib/data"
import { TypologiesModule } from "@/components/TypologiesModule"
import type { Article } from "@/lib/types"

// DB article type values used for filtering
const articleFilterTypes = [
  "news",
  "opinion",
  "regulation",
  "investigation",
  "ruling",
  "analysis",
] as const

type SortOption = "newest" | "oldest"

interface FeedContentProps {
  // Already the correct page of already-filtered, already-sorted results —
  // filtering/sorting/pagination all happen server-side now (see
  // feed/page.tsx) so they compose correctly together. This component just
  // renders what it's given and writes filter/page state to the URL.
  articles: Article[]
  page: number
  totalPages: number
  totalCount: number
}

function parseSet(value: string | null): Set<string> {
  return new Set((value ?? "").split(",").filter(Boolean))
}

export function FeedContent({ articles, page, totalPages, totalCount }: FeedContentProps) {
  const searchId = useId()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // The URL query string is the source of truth for every filter, so a
  // filtered/searched view is shareable and survives refresh/back-button —
  // only the raw search text gets a local, debounced mirror so typing feels
  // instant instead of round-tripping through the router on every keystroke.
  const searchQuery = searchParams.get("q") ?? ""
  const sortBy = (searchParams.get("sort") as SortOption) || "newest"
  const selectedCrimeType = searchParams.get("crime") ?? ""
  const selectedArticleTypes = parseSet(searchParams.get("type"))
  const dateFrom = searchParams.get("from") ?? ""
  const dateTo = searchParams.get("to") ?? ""

  const [searchInput, setSearchInput] = useState(searchQuery)

  // Any filter/search/sort change resets to page 1 (a filter change can
  // easily make the page you were on no longer exist) — pass
  // resetPage: false only for actual page-to-page navigation.
  const updateParams = useCallback(
    (updates: Record<string, string | null>, options?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      if (options?.resetPage !== false) {
        params.delete("page")
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // Page navigation: router.push (not replace) so the back button steps
  // back through pages, and the default scroll-to-top behavior is kept
  // (unlike updateParams above) so a new page of results starts in view.
  const goToPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nextPage > 1) params.set("page", String(nextPage))
      else params.delete("page")
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [router, pathname, searchParams]
  )

  // Debounce the search box into the URL rather than pushing on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== searchQuery) updateParams({ q: searchInput || null })
    }, 400)
    return () => clearTimeout(handle)
  }, [searchInput, searchQuery, updateParams])

  // Keep the input in sync when the URL changes from outside typing (back/forward).
  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  const handleTypologySelect = (type: string) => {
    updateParams({ crime: type === selectedCrimeType ? null : type })
  }

  const toggleArticleType = (type: string) => {
    const next = new Set(selectedArticleTypes)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    updateParams({ type: Array.from(next).join(",") || null })
  }

  const clearFilters = () => {
    setSearchInput("")
    router.replace(pathname, { scroll: false })
  }

  const hasActiveFilters = Boolean(
    searchQuery || selectedCrimeType || selectedArticleTypes.size > 0 || dateFrom || dateTo
  )

  const rangeStart = totalCount > 0 ? (page - 1) * FEED_PAGE_SIZE + 1 : 0
  const rangeEnd = (page - 1) * FEED_PAGE_SIZE + articles.length

  return (
    <div className="min-h-screen flex flex-col bg-indigo">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-aged-vellum mb-12 font-headline">
            Latest News
          </FadeInHeading>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <label htmlFor={searchId} className="sr-only">
                Search articles
              </label>
              <input
                id={searchId}
                type="text"
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => updateParams({ sort: e.target.value === "newest" ? null : e.target.value })}
              aria-label="Sort articles by"
              className="px-4 py-2.5 bg-white border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Article Type + Clear Filters — the generic form controls, grouped
              with Search/Sort above Typologies rather than sitting between
              the tabs and the panel they're attached to. Date range is still
              filterable via the URL (see feed/page.tsx) — just not exposed
              as a control here anymore. */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-aged-vellum/80 uppercase tracking-wide mr-2">
                Article Type
              </span>
              {articleFilterTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArticleType(type)}
                  aria-pressed={selectedArticleTypes.has(type)}
                  className={cn(
                    "px-1 py-1 italic text-xs font-medium text-ochre-on-dark underline decoration-1 underline-offset-4 transition-all",
                    selectedArticleTypes.has(type)
                      ? "decoration-ochre-on-dark"
                      : "decoration-transparent hover:decoration-ochre-on-dark"
                  )}
                >
                  {articleTypeLabels[type]}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 py-2 text-xs text-aged-vellum/70 hover:text-aged-vellum transition-colors"
              >
                <X aria-hidden="true" className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Typologies tabs, fused with the article panel they filter — list,
            results count, and pagination all live inside it now. This sits
            outside the max-w-5xl/mx-auto column (not nested in it) and
            cancels only main's own side padding, so the binder photo
            bleeds flush to the page's actual left edge at any viewport
            width — nesting it inside the centered column would leave it
            offset by that column's own auto-centering margin instead. */}
        <div className="-mx-6 lg:-mx-8">
          <TypologiesModule selected={selectedCrimeType} onSelect={handleTypologySelect}>
            {articles.length > 0 ? (
              articles.map((article) => <ArticleRow key={article.id} article={article} />)
            ) : (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  No articles found matching your criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-2 py-2 text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {totalCount > 0 && (
              <p className="mt-8 text-sm text-muted-foreground">
                Showing {rangeStart}–{rangeEnd} of {totalCount} article
                {totalCount !== 1 ? "s" : ""}
              </p>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="px-5 py-2.5 border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-5 py-2.5 border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </TypologiesModule>
        </div>
      </main>

      <Footer />
    </div>
  )
}
