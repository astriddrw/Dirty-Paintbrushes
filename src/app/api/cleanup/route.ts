import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import he from "he";

// Keywords indicating articles are NOT about art market financial crime
const IRRELEVANT_PATTERNS = [
  "cancer", "chemotherapy", "drug trial", "oncology",
  "bitcoin depot", "bitcoin atm", "crypto atm",
  "epstein", "fidelity",
  "amaryllis fox",
  "hollywood", "film rights", "intellectual property rights", "ip rights",
  "digital reconstruction", "3d reconstruction",
  "cryptocurrency regulation", "crypto exchange", "defi",
  "nba", "nfl", "sports",
];

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

function decodeHtml(raw: string | null): string | null {
  if (!raw) return raw;
  const stripped = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return he.decode(stripped);
}

function isIrrelevant(title: string, summary: string | null): boolean {
  const text = `${title} ${summary ?? ""}`.toLowerCase();
  return IRRELEVANT_PATTERNS.some((p) => text.includes(p.toLowerCase()));
}

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

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const stats = { decoded: 0, urlsCleaned: 0, deleted: 0, errors: [] as string[] };

  // Fetch all articles in batches
  let page = 0;
  const pageSize = 200;

  while (true) {
    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, summary, url")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) { stats.errors.push(error.message); break; }
    if (!articles || articles.length === 0) break;

    for (const article of articles) {
      const updates: Record<string, string | null> = {};
      let needsUpdate = false;

      // Delete irrelevant articles
      if (isIrrelevant(article.title, article.summary)) {
        await supabase.from("articles").delete().eq("id", article.id);
        stats.deleted++;
        continue;
      }

      // Decode HTML entities in title
      const decodedTitle = decodeHtml(article.title);
      if (decodedTitle && decodedTitle !== article.title) {
        updates.title = decodedTitle;
        needsUpdate = true;
        stats.decoded++;
      }

      // Decode HTML entities in summary
      const decodedSummary = decodeHtml(article.summary);
      if (decodedSummary !== article.summary) {
        updates.summary = decodedSummary;
        needsUpdate = true;
      }

      // Clean Google redirect URLs
      const cleanUrl = cleanGoogleUrl(article.url);
      if (cleanUrl !== article.url) {
        updates.url = cleanUrl;
        needsUpdate = true;
        stats.urlsCleaned++;
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from("articles")
          .update(updates)
          .eq("id", article.id);
        if (updateError) stats.errors.push(updateError.message);
      }
    }

    if (articles.length < pageSize) break;
    page++;
  }

  return NextResponse.json({ ok: true, ...stats });
}
