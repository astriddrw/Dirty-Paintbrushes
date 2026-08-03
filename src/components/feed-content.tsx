"use client"

import { useState, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArticleRow } from "@/components/article-row"
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

export function FeedContent({ articles }: FeedContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState<Set<string>>(new Set())
  const [selectedArticleTypes, setSelectedArticleTypes] = useState<Set<string>>(new Set())

  const toggleCrimeType = (type: string) => {
    setSelectedCrimeTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const toggleArticleType = (type: string) => {
    setSelectedArticleTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCrimeTypes(new Set())
    setSelectedArticleTypes(new Set())
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

    // Sort
    result.sort((a, b) => {
      const dateA = a.published_date ? new Date(a.published_date).getTime() : 0
      const dateB = b.published_date ? new Date(b.published_date).getTime() : 0
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })

    return result
  }, [articles, searchQuery, selectedCrimeTypes, selectedArticleTypes, sortBy])

  const hasActiveFilters =
    searchQuery || selectedCrimeTypes.size > 0 || selectedArticleTypes.size > 0

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl lg:text-5xl italic font-normal tracking-tight text-indigo mb-12 font-serif">
            Latest News
          </h1>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Crime Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2">
                Crime Type
              </span>
              {crimeFilterTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleCrimeType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors",
                    selectedCrimeTypes.has(type)
                      ? "bg-indigo text-indigo-pale"
                      : "bg-indigo-pale text-indigo hover:opacity-80"
                  )}
                >
                  {crimeTypeLabels[type]}
                </button>
              ))}
            </div>

            {/* Article Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2">
                Article Type
              </span>
              {articleFilterTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArticleType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors",
                    selectedArticleTypes.has(type)
                      ? "bg-indigo text-indigo-pale"
                      : "bg-indigo-pale text-indigo hover:opacity-80"
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
              filteredArticles.map((article, index) => (
                <ArticleRow key={article.id} article={article} index={index} />
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
