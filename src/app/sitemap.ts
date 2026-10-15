import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { listSentIssues } from "@/lib/newsletter-archive"

const BASE_URL = "https://dirtypaintbrushes.com"

const STATIC_ROUTES = ["", "/feed", "/sources", "/about", "/newsletter", "/cases", "/privacy"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const { data } = await supabase
    .from("articles")
    .select("id, updated_at")
    .eq("status", "published")

  const articleEntries: MetadataRoute.Sitemap = (data ?? []).map((article) => ({
    url: `${BASE_URL}/articles/${article.id}`,
    lastModified: article.updated_at,
  }))

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
  }))

  const issueEntries: MetadataRoute.Sitemap = (await listSentIssues()).map((issue) => ({
    url: `${BASE_URL}/newsletter/issues/${issue.period}`,
    lastModified: issue.sent_at ?? undefined,
  }))

  return [...staticEntries, ...articleEntries, ...issueEntries]
}
