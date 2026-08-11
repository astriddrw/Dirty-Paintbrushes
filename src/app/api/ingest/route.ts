import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import he from "he";
import { classifyArticle } from "@/lib/tagging";
import { checkRelevance } from "@/lib/relevance-filter";
import { extractSummary, cleanGoogleUrl, parsePublishedDate } from "@/lib/feed-parsing";

// isAuthorized() reads request.cookies, which opts this route out of static
// rendering — declare it dynamic explicitly rather than relying on Next's
// (unreliable, in this version) automatic bailout.
export const dynamic = "force-dynamic";

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
  const stats = {
    sourcesChecked: 0,
    articlesSeen: 0,
    stored: 0,
    rejected: 0,
    errors: 0,
    rejectedTitles: [] as string[],
    errorDetails: [] as string[],
  };

  // Fetch all feeds concurrently
  const feedResults = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.feed_url);
      return { source, feed };
    })
  );

  for (let i = 0; i < feedResults.length; i++) {
    const result = feedResults[i];
    stats.sourcesChecked++;

    if (result.status === "rejected") {
      stats.errors++;
      stats.errorDetails.push(`${sources[i].feed_url}: ${result.reason}`);
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
      stats.articlesSeen++;

      const cleanUrl = cleanGoogleUrl(item.link);
      if (existingUrls.has(cleanUrl)) continue;

      const title = he.decode(item.title.trim());
      const rawSnippet = item.contentSnippet ?? item.content ?? item.summary ?? "";
      const summary = extractSummary(rawSnippet);

      // Applies to every source regardless of tier — a "trusted" tier1 source
      // publishing an off-topic or non-article page is still rejected.
      if (!checkRelevance(title, rawSnippet).relevant) {
        stats.rejected++;
        stats.rejectedTitles.push(title);
        continue;
      }

      candidates.push({ item, cleanUrl, title, summary });
    }

    // Every new article waits for manual approval in /admin/review, regardless
    // of source tier — tier1 sources are no longer auto-published.
    const status = "review_queue";

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
        stats.errors++;
        stats.errorDetails.push(`${source.name}: ${insertError.message}`);
      } else {
        stats.stored += toInsert.length;
      }
    }

    await supabase
      .from("rss_sources")
      .update({ last_fetched: new Date().toISOString() })
      .eq("id", source.id);
  }

  const { error: runError } = await supabase.from("ingestion_runs").insert({
    sources_checked: stats.sourcesChecked,
    articles_seen: stats.articlesSeen,
    articles_stored: stats.stored,
    articles_rejected: stats.rejected,
    errors: stats.errors,
    rejected_titles: stats.rejectedTitles.slice(0, 50),
    error_details: stats.errorDetails,
  });
  if (runError) {
    // Non-fatal: the ingestion_runs table doesn't exist yet in Supabase.
    // Add a migration for it if you want run history persisted.
    console.error("[INGEST] failed to log ingestion_runs:", runError.message);
  }

  const summary = {
    sourcesChecked: stats.sourcesChecked,
    articlesSeen: stats.articlesSeen,
    stored: stats.stored,
    rejected: stats.rejected,
    errors: stats.errors,
  };
  console.log("[INGEST SUMMARY]", summary);
  return NextResponse.json(summary);
}
