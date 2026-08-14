"use client"

import Link from "next/link"
import { Bookmark, ExternalLink } from "lucide-react"
import { cn, formatSource } from "@/lib/utils"
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

  return (
    <div className="group flex items-start gap-4 lg:gap-6 py-5 lg:py-6 border-b border-border hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-sm">
      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/articles/${article.id}`}
          className="block text-base lg:text-lg font-title font-normal text-foreground leading-snug mb-2 lg:mb-3 text-pretty group-hover:text-oxblood hover:text-oxblood/70! transition-colors"
        >
          {article.title}
        </Link>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {/* Crime Type Tags — every match, not just the first, so a row visibly
              justifies why it matched a crime-type filter */}
          {article.crime_types?.map((ct) => (
            <span key={ct} className="italic text-xs font-medium text-indigo">
              {crimeTypeLabels[ct] ?? ct.replace(/_/g, " ")}
            </span>
          ))}

          {/* Article Type Tag */}
          {article.article_type && (
            <span className="italic text-xs font-medium text-ochre-on-light">
              {articleTypeLabels[article.article_type] ?? article.article_type}
            </span>
          )}

          {/* Source */}
          <span className="text-xs text-muted-foreground">
            {formatSource(article)}
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
            "p-3.5 rounded-md transition-colors",
            bookmarked
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          title={bookmarked ? "Saved on this device (click to remove)" : "Save to this device"}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open article"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
