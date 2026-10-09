import Link from "next/link"
import { crimeTypeLabels, articleTypeLabels } from "@/lib/data"
import { formatDateShort } from "@/lib/utils"
import type { Article } from "@/lib/types"

interface HomeArticleRowProps {
  article: Article
}

// Distinct from ArticleRow (Feed page's binder-paper rows, which carry
// bookmark/external-link actions and a bottom divider): this is the
// homepage's own "Latest Intelligence" treatment — title in Instrument
// Serif italic, a single tag+date pill at the top right, and generous
// vertical space between entries instead of a ruled line.
export function HomeArticleRow({ article }: HomeArticleRowProps) {
  const tagLabels = [
    ...(article.crime_types ?? []).map((ct) => crimeTypeLabels[ct] ?? ct.replace(/_/g, " ")),
    ...(article.article_type ? [articleTypeLabels[article.article_type] ?? article.article_type] : []),
  ]
  const meta = [tagLabels.join(", "), article.published_date ? formatDateShort(article.published_date) : null]
    .filter(Boolean)
    .join(" · ")

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6">
        <Link
          href={`/articles/${article.id}`}
          className="font-serif italic text-xl lg:text-2xl text-indigo leading-snug hover:opacity-70 transition-opacity text-pretty"
        >
          {article.title}
        </Link>

        {meta && (
          // bg-indigo-pale sat right on top of this section's own
          // bg-light-blue — the two are close enough in lightness that the
          // chip barely registered as a separate shape. An alpha-blended
          // indigo reads as a deliberately deeper tint against that same
          // page background instead.
          <span className="shrink-0 self-start px-3 py-1 bg-indigo/15 text-indigo text-sm whitespace-nowrap">
            {meta}
          </span>
        )}
      </div>

      {article.summary && (
        <p className="mt-10 text-sm text-foreground/80 leading-relaxed max-w-2xl">
          {article.summary}
        </p>
      )}
    </div>
  )
}
