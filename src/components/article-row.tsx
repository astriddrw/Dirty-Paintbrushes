"use client"

import Link from "next/link"
import { Bookmark, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { crimeTypeLabels, articleTypeLabels } from "@/lib/data"
import { useBookmarks } from "@/lib/bookmarks-context"
import type { Article } from "@/lib/types"

interface ArticleRowProps {
  article: Article
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ArticleRow({ article }: ArticleRowProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = isBookmarked(article.id)

  const primaryCrimeType = article.crime_types?.[0] ?? ""

  return (
    <div className="group flex items-start gap-4 lg:gap-6 py-5 lg:py-6 border-b border-border hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-sm">
      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/articles/${article.id}`}
          className="block text-lg lg:text-xl font-serif font-medium text-foreground leading-snug mb-2 lg:mb-3 text-pretty hover:text-primary transition-colors"
        >
          {article.title}
        </Link>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {/* Crime Type Tag */}
          {primaryCrimeType && (
            <span className="italic text-xs font-medium text-indigo">
              {crimeTypeLabels[primaryCrimeType] ?? primaryCrimeType.replace(/_/g, " ")}
            </span>
          )}

          {/* Article Type Tag */}
          {article.article_type && (
            <span className="italic text-xs font-medium text-ochre">
              {articleTypeLabels[article.article_type] ?? article.article_type}
            </span>
          )}

          {/* Source */}
          <span className="text-xs text-muted-foreground">
            {article.source_name}
          </span>

          {/* Date */}
          {article.published_date && (
            <span className="text-xs text-muted-foreground">
              {formatDate(article.published_date)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
        <button
          onClick={() => toggleBookmark(article.id)}
          className={cn(
            "p-2 rounded-md transition-colors",
            bookmarked
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open article"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
