import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import he from "he";
import { classifyArticle } from "@/lib/tagging";
import { checkRelevance } from "@/lib/relevance-filter";

// ─── Helper functions ───────────────────────────────────────────────────────

function decodeHtml(raw: string): string {
  if (!raw) return raw;
  // Strip HTML tags first, then decode entities
  const stripped = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return he.decode(stripped);
}

function extractSummary(raw: string): string {
  const plain = decodeHtml(raw);
  const sentences = plain.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  return sentences.slice(0, 3).join(" ").trim().slice(0, 600);
}

function cleanGoogleUrl(url: string): string {
  try {
    if (!url.includes("google.com/url")) return url;
    const parsed = new URL(url);
    const real = parsed.searchParams.get("url");
    return real ? decodeURIComponent(real) : url;
  } catch {
    return url;
  }
}

function parsePublishedDate(item: { pubDate?: string; isoDate?: string }): string | null {
  const raw = item.isoDate ?? item.pubDate;
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

// ─── Auth check ─────────────────────────────────────────────────────────────

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;

  // Allow if CRON_SECRET matches (Vercel cron)
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }

  // Allow in development without a secret set
  if (!cronSecret && process.env.NODE_ENV !== "production") return true;

  // Allow if admin session cookie present
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: sources, error: sourcesError } = await supabase
    .from("rss_sources")
    .select("*")
    .eq("active", true);

  if (sourcesError || !sources?.length) {
    return NextResponse.json({ error: "No active sources found" }, { status: 500 });
  }

  const parser = new Parser({ timeout: 8000 });
  const stats = { processed: 0, saved: 0, skipped: 0, errors: [] as string[] };

  // Fetch all feeds concurrently
  const feedResults = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.feed_url);
      return { source, feed };
    })
  );

  for (const result of feedResults) {
    if (result.status === "rejected") {
      stats.errors.push(String(result.reason));
      continue;
    }

    const { source, feed } = result.value;
    const items = feed.items.slice(0, 25);

    // Batch dedup — clean Google URLs first, then check
    const rawUrls = items.map((i) => i.link).filter(Boolean) as string[];
    const cleanedUrlMap = new Map(rawUrls.map((u) => [u, cleanGoogleUrl(u)]));
    const cleanedUrls = Array.from(cleanedUrlMap.values());

    const { data: existing } = await supabase
      .from("articles")
      .select("url")
      .in("url", cleanedUrls);
    const existingUrls = new Set(existing?.map((a) => a.url) ?? []);

    // Candidates that pass the admission filter — classified concurrently below.
    const candidates: { item: (typeof items)[number]; cleanUrl: string; title: string; summary: string }[] = [];

    for (const item of items) {
      if (!item.link || !item.title) continue;
      stats.processed++;

      const cleanUrl = cleanGoogleUrl(item.link);
      if (existingUrls.has(cleanUrl)) { stats.skipped++; continue; }

      const title = he.decode(item.title.trim());
      const rawSnippet = item.contentSnippet ?? item.content ?? item.summary ?? "";
      const summary = extractSummary(rawSnippet);

      // Applies to every source regardless of tier — a "trusted" tier1 source
      // publishing an off-topic or non-article page is still rejected.
      if (!checkRelevance(title, rawSnippet).relevant) { stats.skipped++; continue; }

      candidates.push({ item, cleanUrl, title, summary });
    }

    const status = source.tier === "tier1" ? "published" : "review_queue";

    const toInsert = candidates.map((candidate) => {
      const classification = classifyArticle({
        sourceName: source.name,
        title: candidate.title,
        summary: candidate.summary || null,
      });

      return {
        url: candidate.cleanUrl,
        title: candidate.title,
        source_name: source.name,
        source_tier: source.tier,
        published_date: parsePublishedDate(candidate.item),
        summary: candidate.summary || null,
        status,
        article_type: classification.article_type,
        crime_types: classification.crime_types,
        regions: [],
        entity_types: [],
      };
    });

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("articles")
        .insert(toInsert);
      if (insertError) {
        stats.errors.push(`${source.name}: ${insertError.message}`);
      } else {
        stats.saved += toInsert.length;
      }
    }

    await supabase
      .from("rss_sources")
      .update({ last_fetched: new Date().toISOString() })
      .eq("id", source.id);
  }

  return NextResponse.json({
    ok: true,
    processed: stats.processed,
    saved: stats.saved,
    skipped: stats.skipped,
    errors: stats.errors,
  });
}
