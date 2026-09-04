import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { BookmarksProvider } from "@/lib/bookmarks-context"
import { FeedContent } from "@/components/feed-content"
import { FEED_PAGE_SIZE } from "@/lib/utils"
import type { Article } from "@/lib/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Feed | Dirty Paintbrushes",
  description:
    "Browse the latest articles tracking fraud, money laundering, sanctions, and financial crime across the global art market.",
}

// Escapes ilike wildcards so literal "%"/"_" in a search box don't act as
// patterns, then strips "," and "()" — structurally significant in
// PostgREST's raw .or() filter string — so user input can never break the
// filter syntax itself.
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%_]/g, "\\$&").replace(/[,()]/g, "")
}

function paramToString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : ""
}

interface FeedPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const supabase = createClient()

  const page = Math.max(1, Number(paramToString(searchParams.page)) || 1)
  const q = paramToString(searchParams.q)
  const sort = searchParams.sort === "oldest" ? "oldest" : "newest"
  const crimeTypes = paramToString(searchParams.crime).split(",").filter(Boolean)
  const articleTypes = paramToString(searchParams.type).split(",").filter(Boolean)
  const dateFrom = paramToString(searchParams.from)
  const dateTo = paramToString(searchParams.to)

  let query = supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")

  if (q) {
    const term = sanitizeSearchTerm(q)
    query = query.or(`title.ilike.%${term}%,source_name.ilike.%${term}%`)
  }
  // crime_types is a text[] column — overlaps (&&) is "shares at least one
  // element", matching the OR semantics the old client-side .some() had.
  if (crimeTypes.length > 0) {
    query = query.overlaps("crime_types", crimeTypes)
  }
  // article_type is a single text column — .in() is "value is one of these".
  if (articleTypes.length > 0) {
    query = query.in("article_type", articleTypes)
  }
  if (dateFrom) query = query.gte("published_date", dateFrom)
  if (dateTo) query = query.lte("published_date", dateTo)

  query = query.order("published_date", { ascending: sort === "oldest" })

  const rangeStart = (page - 1) * FEED_PAGE_SIZE
  const rangeEnd = rangeStart + FEED_PAGE_SIZE - 1
  const { data, count } = await query.range(rangeStart, rangeEnd)

  const articles: Article[] = (data ?? []) as Article[]
  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / FEED_PAGE_SIZE))

  return (
    <BookmarksProvider>
      <Suspense fallback={null}>
        <FeedContent
          articles={articles}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </Suspense>
    </BookmarksProvider>
  )
}
