"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArticleRow } from "@/components/article-row"
import { FadeInHeading } from "@/components/FadeInHeading"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { crimeTypeLabels, articleTypeLabels } from "@/lib/data"
import type { Article } from "@/lib/types"

// DB crime type values used for filtering
const crimeFilterTypes = [
  "fraud",
  "money_laundering",
  "sanctions_evasion",
  "terror_financing",
] as const

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
  articles: Article[]
}

function parseSet(value: string | null): Set<string> {
  return new Set((value ?? "").split(",").filter(Boolean))
}

export function FeedContent({ articles }: FeedContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // The URL query string is the source of truth for every filter, so a
  // filtered/searched view is shareable and survives refresh/back-button —
  // only the raw search text gets a local, debounced mirror so typing feels
  // instant instead of round-tripping through the router on every keystroke.
  const searchQuery = searchParams.get("q") ?? ""
  const sortBy = (searchParams.get("sort") as SortOption) || "newest"
  const selectedCrimeTypes = useMemo(() => parseSet(searchParams.get("crime")), [searchParams])
  const selectedArticleTypes = useMemo(() => parseSet(searchParams.get("type")), [searchParams])
  const dateFrom = searchParams.get("from") ?? ""
  const dateTo = searchParams.get("to") ?? ""

  const [searchInput, setSearchInput] = useState(searchQuery)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
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

  const toggleCrimeType = (type: string) => {
    const next = new Set(selectedCrimeTypes)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    updateParams({ crime: Array.from(next).join(",") || null })
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

  const filteredArticles = useMemo(() => {
    let result = [...articles]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.source_name.toLowerCase().includes(query)
      )
    }

    // Filter by crime type
    if (selectedCrimeTypes.size > 0) {
      result = result.filter((article) =>
        article.crime_types?.some((ct) => selectedCrimeTypes.has(ct))
      )
    }

    // Filter by article type
    if (selectedArticleTypes.size > 0) {
      result = result.filter((article) =>
        article.article_type != null && selectedArticleTypes.has(article.article_type)
      )
    }

    // Filter by date range
    if (dateFrom) {
      result = result.filter(
        (article) => article.published_date && new Date(article.published_date) >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      result = result.filter(
        (article) => article.published_date && new Date(article.published_date) <= new Date(dateTo)
      )
    }

    // Sort
    result.sort((a, b) => {
      const dateA = a.published_date ? new Date(a.published_date).getTime() : 0
      const dateB = b.published_date ? new Date(b.published_date).getTime() : 0
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })

    return result
  }, [articles, searchQuery, selectedCrimeTypes, selectedArticleTypes, dateFrom, dateTo, sortBy])

  const hasActiveFilters = Boolean(
    searchQuery || selectedCrimeTypes.size > 0 || selectedArticleTypes.size > 0 || dateFrom || dateTo
  )

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <FadeInHeading className="text-4xl lg:text-5xl italic font-normal tracking-tight text-oxblood mb-12 font-serif">
            Latest News
          </FadeInHeading>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
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
              className="px-4 py-2.5 bg-white border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-xs font-medium text-foreground uppercase tracking-wide mr-2">
              Date range
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => updateParams({ from: e.target.value || null })}
              className="px-3 py-1.5 bg-white border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="From date"
            />
            <span className="text-muted-foreground select-none">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => updateParams({ to: e.target.value || null })}
              className="px-3 py-1.5 bg-white border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="To date"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Crime Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-foreground uppercase tracking-wide mr-2">
                Crime Type
              </span>
              {crimeFilterTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleCrimeType(type)}
                  aria-pressed={selectedCrimeTypes.has(type)}
                  className={cn(
                    "px-1 py-1 italic text-xs font-medium text-indigo underline decoration-1 underline-offset-4 transition-all",
                    selectedCrimeTypes.has(type)
                      ? "decoration-indigo"
                      : "decoration-transparent hover:decoration-indigo"
                  )}
                >
                  {crimeTypeLabels[type]}
                </button>
              ))}
            </div>

            {/* Article Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-foreground uppercase tracking-wide mr-2">
                Article Type
              </span>
              {articleFilterTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArticleType(type)}
                  aria-pressed={selectedArticleTypes.has(type)}
                  className={cn(
                    "px-1 py-1 italic text-xs font-medium text-ochre-on-light underline decoration-1 underline-offset-4 transition-all",
                    selectedArticleTypes.has(type)
                      ? "decoration-ochre-on-light"
                      : "decoration-transparent hover:decoration-ochre-on-light"
                  )}
                >
                  {articleTypeLabels[type]}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>

          {/* Articles List */}
          <div className="border-t border-border">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <ArticleRow key={article.id} article={article} />
              ))
            ) : (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  No articles found matching your criteria.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Results count */}
          {filteredArticles.length > 0 && (
            <p className="mt-8 text-sm text-muted-foreground">
              Showing {filteredArticles.length} article
              {filteredArticles.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
