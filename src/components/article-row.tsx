"use client"

import Link from "next/link"
import { Bookmark, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { crimeTypeLabels, crimeTypeColors, articleTypeLabels, articleTypeColors } from "@/lib/data"
import { useBookmarks } from "@/lib/bookmarks-context"
import type { Article } from "@/lib/types"

interface ArticleRowProps {
  article: Article
  index: number
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ArticleRow({ article, index }: ArticleRowProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = isBookmarked(article.id)

  // Map DB fields to V0's expected shape
  const primaryCrimeType = article.crime_types?.[0] ?? ""
  const crimeColors = crimeTypeColors[primaryCrimeType] ?? { bg: "bg-neutral-100", text: "text-neutral-700" }
  const articleColors = article.article_type
    ? (articleTypeColors[article.article_type] ?? { bg: "bg-neutral-100", text: "text-neutral-700" })
    : null

  return (
    <div className="group flex items-start gap-4 lg:gap-6 py-5 lg:py-6 border-b border-border hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-sm">
      {/* Number */}
      <span className="text-sm font-medium text-ochre w-6 lg:w-8 flex-shrink-0 pt-0.5">
        {String(index + 1).padStart(2, "0")}
      </span>

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
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-[2px] text-xs font-medium",
              crimeColors.bg,
              crimeColors.text
            )}>
              {crimeTypeLabels[primaryCrimeType] ?? primaryCrimeType.replace(/_/g, " ")}
            </span>
          )}

          {/* Article Type Tag */}
          {article.article_type && articleColors && (
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-[2px] text-xs font-medium",
              articleColors.bg,
              articleColors.text
            )}>
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
