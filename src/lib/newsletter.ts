import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewsletterArticle, NewsletterGroup } from "@/emails/NewsletterDigest";
import { crimeTypeLabels } from "@/lib/data";
import type { Article } from "@/lib/types";

export interface MonthlyDigestData {
  period: string; // e.g. '2026-08'
  periodLabel: string; // e.g. 'August 2026'
  groups: NewsletterGroup[];
  leadStory: NewsletterArticle | null;
  editionNumber: number | null;
  feedRange: { from: string; to: string };
  articleCount: number;
}

// October 2026 is Edition 1 (the first issue designed from the Canva
// template); every calendar month after it counts up by one.
const FIRST_EDITION = { year: 2026, month: 10 };

function editionFor(periodStart: Date): number | null {
  const n =
    (periodStart.getUTCFullYear() - FIRST_EDITION.year) * 12 +
    (periodStart.getUTCMonth() + 1 - FIRST_EDITION.month) +
    1;
  return n >= 1 ? n : null;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

// Shared by /api/newsletter/generate-draft (writes the draft) and
// /api/newsletter/preview (renders it without touching the DB) — both need
// the exact same "last calendar month, published, grouped by first
// crime_type" query, and drifting the two would mean the preview lies
// about what the cron actually generates.
export async function buildMonthlyDigest(
  supabase: SupabaseClient,
  referenceDate: Date = new Date(),
  // Only for the sample on /newsletter: if last month had no published
  // stories, fill the sample with this many of the most recent ones instead.
  { fallbackToLatest = 0 }: { fallbackToLatest?: number } = {}
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
    .select("id, title, source_name, published_date, crime_types, article_type, summary, relevance_score")
    .eq("status", "published")
    .gte("published_date", periodStart.toISOString())
    .lt("published_date", periodEnd.toISOString())
    .order("published_date", { ascending: false });

  if (error) throw new Error(error.message);

  let source = articles ?? [];
  if (source.length === 0 && fallbackToLatest > 0) {
    const { data: latest, error: latestError } = await supabase
      .from("articles")
      .select("id, title, source_name, published_date, crime_types, article_type, summary, relevance_score")
      .eq("status", "published")
      .order("published_date", { ascending: false, nullsFirst: false })
      .limit(fallbackToLatest);
    if (latestError) throw new Error(latestError.message);
    source = latest ?? [];
  }

  // Grouped by an article's first crime_type — a story with several tags
  // only needs to appear once, and this keeps the digest scannable rather
  // than repeating it under every tag it matched. Empty categories are
  // skipped entirely rather than printed with "no stories" (per the
  // founder's direction), so a quiet month doesn't pad the issue out.
  type Row = Pick<
    Article,
    | "id"
    | "title"
    | "source_name"
    | "published_date"
    | "crime_types"
    | "article_type"
    | "summary"
    | "relevance_score"
  >;
  const rows = source as Row[];
  const toNewsletterArticle = (article: Row): NewsletterArticle => ({
    id: article.id,
    title: article.title,
    source_name: article.source_name,
    published_date: article.published_date,
    article_type: article.article_type ?? null,
    summary: article.summary ?? null,
    crime_types: article.crime_types ?? null,
  });

  // The lead is the month's highest-relevance story (ties go to the most
  // recent, since rows arrive newest-first). It's pulled out of its group
  // so it doesn't appear twice.
  const lead = rows.reduce<Row | null>(
    (best, row) => ((row.relevance_score ?? 0) > (best?.relevance_score ?? -1) ? row : best),
    null
  );

  const grouped = new Map<string, NewsletterGroup["articles"]>();
  for (const article of rows) {
    if (article.id === lead?.id) continue;
    const key = article.crime_types?.[0] ?? "other";
    const list = grouped.get(key) ?? [];
    list.push(toNewsletterArticle(article));
    grouped.set(key, list);
  }

  // Biggest groups first, so the month's dominant theme leads the list.
  const groups: NewsletterGroup[] = Array.from(grouped.entries())
    .map(([key, items]) => ({ key, label: crimeTypeLabels[key] ?? "Other", articles: items }))
    .sort((a, b) => b.articles.length - a.articles.length);

  return {
    period,
    periodLabel,
    groups,
    leadStory: lead ? toNewsletterArticle(lead) : null,
    editionNumber: editionFor(periodStart),
    feedRange: { from: isoDay(periodStart), to: isoDay(periodEnd) },
    articleCount: rows.length,
  };
}
