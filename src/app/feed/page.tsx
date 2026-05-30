import { createClient } from "@/lib/supabase/server"
import { BookmarksProvider } from "@/lib/bookmarks-context"
import { FeedContent } from "@/components/feed-content"
import type { Article } from "@/lib/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Feed | Dirty Paintbrushes",
  description:
    "Browse the latest articles tracking fraud, money laundering, sanctions, and financial crime across the global art market.",
}

export default async function FeedPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_date", { ascending: false })

  const articles: Article[] = (data ?? []) as Article[]

  return (
    <BookmarksProvider>
      <FeedContent articles={articles} />
    </BookmarksProvider>
  )
}
