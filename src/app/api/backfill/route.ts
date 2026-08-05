import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { checkRelevance } from "@/lib/relevance-filter";
import { classifyArticle } from "@/lib/tagging";
import { decodeHtml, extractSummary } from "@/lib/feed-parsing";

// isAuthorized() reads request.cookies, which opts this route out of static
// rendering — declare it dynamic explicitly rather than relying on Next's
// (unreliable, in this version) automatic bailout.
export const dynamic = "force-dynamic";

// ─── Auth check (same pattern as /api/ingest and /api/cleanup) ──────────────

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }
  if (!cronSecret && process.env.NODE_ENV !== "production") return true;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

type ArticleRow = {
  id: string;
  title: string;
  summary: string | null;
  source_name: string;
  url: string;
  status: string;
  created_at: string;
  published_date: string | null;
};

async function fetchAllArticles(
  supabase: ReturnType<typeof createAdminClient>
): Promise<ArticleRow[]> {
  const pageSize = 200;
  let page = 0;
  const all: ArticleRow[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, summary, source_name, url, status, created_at, published_date")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  return all;
}

// mode=audit       — dry run: report articles that fail the current relevance
//                    filter. Does NOT change anything.
// mode=flag        — moves articles that fail the relevance filter into
//                    review_queue (only if currently published/review_queue) so
//                    they surface in /admin/review for manual approve/dismiss.
//                    Never deletes; dismiss just hides an article, it stays in
//                    the database and is reversible.
// mode=retag       — re-run the classifier on existing articles and persist
//                    crime_types / article_type. Does NOT touch status or content.
// mode=delete      — the only mode that removes rows, and only for the exact
//                    `ids` passed in the request body (never re-derived here).
// mode=investigate — read-only: status breakdown + full article list (for
//                    keyword search) + current rss_sources list.
// mode=search      — read-only: case-insensitive keyword search across
//                    title+summary of ALL articles regardless of status.
//                    body: { query: string }
// mode=dryrun      — read-only: fetches every active source's live RSS feed
//                    right now and classifies each item through the same
//                    checkRelevance() logic /api/ingest uses, WITHOUT
//                    inserting anything. Reports admitted vs rejected counts
//                    per source plus rejected examples (title/summary/reason).

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const mode = body.mode as "audit" | "flag" | "retag" | "delete" | "investigate" | "search" | "dryrun" | undefined;

  if (mode === "delete") {
    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
    if (ids.length === 0) {
      return NextResponse.json(
        { error: "mode=delete requires a non-empty `ids` array of article IDs to remove" },
        { status: 400 }
      );
    }
    const supabase = createAdminClient();
    const { error, count } = await supabase
      .from("articles")
      .delete({ count: "exact" })
      .in("id", ids);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, deleted: count ?? ids.length });
  }

  if (mode === "audit") {
    const supabase = createAdminClient();
    const articles = await fetchAllArticles(supabase);

    const junk = articles
      .map((article) => ({
        article,
        check: checkRelevance(article.title, article.summary ?? ""),
      }))
      .filter(({ check }) => !check.relevant)
      .map(({ article, check }) => ({
        id: article.id,
        title: article.title,
        source_name: article.source_name,
        url: article.url,
        reason: check.reason,
        status: article.status,
      }));

    const statusCounts = junk.reduce<Record<string, number>>((acc, j) => {
      acc[j.status] = (acc[j.status] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      ok: true,
      total: articles.length,
      junkCount: junk.length,
      junkByStatus: statusCounts,
      junk,
    });
  }

  if (mode === "flag") {
    const supabase = createAdminClient();
    const articles = await fetchAllArticles(supabase);

    const toFlag = articles.filter(
      (article) =>
        (article.status === "published" || article.status === "review_queue") &&
        !checkRelevance(article.title, article.summary ?? "").relevant
    );

    const stats = { total: articles.length, flagged: 0, errors: [] as string[] };

    for (const article of toFlag) {
      const { error } = await supabase
        .from("articles")
        .update({ status: "review_queue" })
        .eq("id", article.id);
      if (error) {
        stats.errors.push(`${article.id}: ${error.message}`);
      } else {
        stats.flagged++;
      }
    }

    return NextResponse.json({ ok: true, ...stats });
  }

  if (mode === "retag") {
    const supabase = createAdminClient();
    const articles = await fetchAllArticles(supabase);

    const stats = { total: articles.length, updated: 0, errors: [] as string[] };

    for (const article of articles) {
      const classification = classifyArticle({
        sourceName: article.source_name,
        title: article.title,
        summary: article.summary,
      });
      const { error } = await supabase
        .from("articles")
        .update({
          crime_types: classification.crime_types,
          article_type: classification.article_type,
        })
        .eq("id", article.id);
      if (error) {
        stats.errors.push(`${article.id}: ${error.message}`);
      } else {
        stats.updated++;
      }
    }

    return NextResponse.json({ ok: true, ...stats });
  }

  if (mode === "investigate") {
    const supabase = createAdminClient();
    const articles = await fetchAllArticles(supabase);

    const statusCounts = articles.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {});

    const { data: sources, error: sourcesError } = await supabase
      .from("rss_sources")
      .select("*")
      .order("name");

    if (sourcesError) {
      return NextResponse.json({ error: sourcesError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      totalArticles: articles.length,
      statusCounts,
      articles,
      sources: sources ?? [],
    });
  }

  if (mode === "search") {
    const query = typeof body.query === "string" ? body.query.trim().toLowerCase() : "";
    if (!query) {
      return NextResponse.json({ error: "mode=search requires a non-empty `query` string" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const articles = await fetchAllArticles(supabase);

    const matches = articles.filter((a) =>
      `${a.title} ${a.summary ?? ""}`.toLowerCase().includes(query)
    );

    return NextResponse.json({ ok: true, query, matchCount: matches.length, matches });
  }

  if (mode === "dryrun") {
    const supabase = createAdminClient();
    const { data: sources, error: sourcesError } = await supabase
      .from("rss_sources")
      .select("*")
      .eq("active", true);

    if (sourcesError || !sources?.length) {
      return NextResponse.json({ error: "No active sources found" }, { status: 500 });
    }

    const parser = new Parser({ timeout: 8000 });
    const perSource: Record<string, { admitted: number; rejected: number; error?: string }> = {};
    const rejectedExamples: {
      source_name: string;
      title: string;
      summary: string;
      reason: string | undefined;
    }[] = [];
    let totalItems = 0;
    let totalAdmitted = 0;
    let totalRejected = 0;

    const feedResults = await Promise.allSettled(
      sources.map(async (source) => {
        const feed = await parser.parseURL(source.feed_url);
        return { source, feed };
      })
    );

    feedResults.forEach((result, i) => {
      const sourceName = sources[i].name;
      if (result.status === "rejected") {
        perSource[sourceName] = { admitted: 0, rejected: 0, error: String(result.reason) };
        return;
      }

      const { source, feed } = result.value;
      const items = feed.items.slice(0, 25);
      let admitted = 0;
      let rejected = 0;

      for (const item of items) {
        if (!item.link || !item.title) continue;
        totalItems++;

        const title = item.title.trim();
        const rawSnippet = item.contentSnippet ?? item.content ?? item.summary ?? "";
        const summary = extractSummary(rawSnippet);
        const check = checkRelevance(title, rawSnippet);

        if (check.relevant) {
          admitted++;
          totalAdmitted++;
        } else {
          rejected++;
          totalRejected++;
          rejectedExamples.push({
            source_name: source.name,
            title: decodeHtml(title),
            summary,
            reason: check.reason,
          });
        }
      }

      perSource[sourceName] = { admitted, rejected };
    });

    return NextResponse.json({
      ok: true,
      totalItemsScanned: totalItems,
      totalAdmitted,
      totalRejected,
      perSource,
      // Cap the payload — still plenty for a representative sample.
      rejectedExamples: rejectedExamples.slice(0, 60),
    });
  }

  return NextResponse.json(
    { error: "Body must include mode: 'audit' | 'flag' | 'retag' | 'delete' | 'investigate' | 'search' | 'dryrun'" },
    { status: 400 }
  );
}
