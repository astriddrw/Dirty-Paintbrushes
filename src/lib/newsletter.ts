import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewsletterGroup } from "@/emails/NewsletterDigest";
import { crimeTypeLabels } from "@/lib/data";
import type { Article } from "@/lib/types";

export interface MonthlyDigestData {
  period: string; // e.g. '2026-08'
  periodLabel: string; // e.g. 'August 2026'
  groups: NewsletterGroup[];
  articleCount: number;
}

// Shared by /api/newsletter/generate-draft (writes the draft) and
// /api/newsletter/preview (renders it without touching the DB) — both need
// the exact same "last calendar month, published, grouped by first
// crime_type" query, and drifting the two would mean the preview lies
// about what the cron actually generates.
export async function buildMonthlyDigest(
  supabase: SupabaseClient,
  referenceDate: Date = new Date()
): Promise<MonthlyDigestData> {
  const periodStart = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - 1, 1));
  const periodEnd = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1));
  const period = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, "0")}`;
  const periodLabel = periodStart.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, source_name, published_date, crime_types, article_type")
    .eq("status", "published")
    .gte("published_date", periodStart.toISOString())
    .lt("published_date", periodEnd.toISOString())
    .order("published_date", { ascending: false });

  if (error) throw new Error(error.message);

  // Grouped by an article's first crime_type — a story with several tags
  // only needs to appear once, and this keeps the digest scannable rather
  // than repeating it under every tag it matched. Empty categories are
  // skipped entirely rather than printed with "no stories" (per the
  // founder's direction), so a quiet month doesn't pad the issue out.
  const grouped = new Map<string, NewsletterGroup["articles"]>();
  for (const article of (articles ?? []) as Pick<
    Article,
    "id" | "title" | "source_name" | "published_date" | "crime_types" | "article_type"
  >[]) {
    const key = article.crime_types?.[0] ?? "other";
    const list = grouped.get(key) ?? [];
    list.push({
      id: article.id,
      title: article.title,
      source_name: article.source_name,
      published_date: article.published_date,
      article_type: article.article_type ?? null,
    });
    grouped.set(key, list);
  }

  const groups: NewsletterGroup[] = Array.from(grouped.entries()).map(([key, items]) => ({
    label: crimeTypeLabels[key] ?? "Other",
    articles: items,
  }));

  return { period, periodLabel, groups, articleCount: articles?.length ?? 0 };
}
