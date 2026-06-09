import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import he from "he";

// ─── Keyword filter lists ───────────────────────────────────────────────────

const GROUP_A = [
  "art", "artwork", "painting", "sculpture", "antiquities", "cultural property",
  "artefact", "artifact", "gallery", "auction", "collector", "dealer", "museum",
  "freeport", "free port", "nft", "digital art", "provenance", "art market",
  "art world", "art trade", "art dealer", "auction house", "christie's", "sotheby's",
  "phillips", "bonhams", "art fair",
];

const GROUP_B = [
  "money laundering", "laundering", "fraud", "forgery", "sanctions",
  "terror financing", "terrorist financing", "tax evasion", "tax fraud",
  "bribery", "corruption", "illicit", "trafficking", "smuggling", "looting",
  "stolen", "seized", "forfeiture", "confiscated", "indicted", "indictment",
  "convicted", "sentenced", "shell company", "beneficial owner", "due diligence",
  "aml", "kyc", "proceeds of crime", "fatf", "ofac", "ofsi", "fincen", "hmrc", "nca",
];

const TITLE_EXCLUDE = [
  "exhibition review", "gallery opening", "studio visit", "art class",
  "art supplies", "tutorial", "collection highlight", "retrospective",
];

// Sources that publish too broadly — must pass keyword filter
const BROAD_SOURCES = [
  "icij", "occrp", "transparency international", "basel institute",
  "center for art law", "fatf",
];

// Regulatory source names → auto-tag as Regulation article type
const REGULATORY_SOURCES = ["fatf", "hmrc", "ofac", "fincen", "ofsi", "financial crimes enforcement"];
const LAW_FIRM_SOURCES = ["norton rose", "complyadvanage", "financial crime academy"];

// ─── Helper functions ───────────────────────────────────────────────────────

function matchesGroup(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

function shouldExcludeTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return TITLE_EXCLUDE.some((phrase) => lower.includes(phrase));
}

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

function detectArticleType(
  title: string,
  summary: string,
  sourceName: string
): string {
  const text = `${title} ${summary}`.toLowerCase();
  const src = sourceName.toLowerCase();

  if (REGULATORY_SOURCES.some((s) => src.includes(s))) return "regulation";
  if (LAW_FIRM_SOURCES.some((s) => src.includes(s))) return "analysis";

  if (/ruling|sentenced|verdict|\bcourt\b|judge|convicted/.test(text)) return "ruling";
  if (/investigation|probe|inquiry|revealed|uncovered/.test(text)) return "investigation";
  if (/\bopinion\b|commentary|editorial|op-ed/.test(text)) return "opinion";
  if (/regulation|regulatory|compliance|directive|guidance/.test(text)) return "regulation";

  return "news";
}

function detectCrimeTypes(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase();
  const types: string[] = [];

  if (/launder|money.?launder/.test(text)) types.push("money_laundering");
  if (/\bfraud\b|forgery|counterfeit|\bfake\b/.test(text)) types.push("fraud");
  if (/sanction/.test(text)) types.push("sanctions_evasion");
  if (/terror|terrorist financing/.test(text)) types.push("terror_financing");
  if (/tax.?evasion|tax.?fraud/.test(text)) types.push("tax_evasion");
  if (/trafficking|smuggling|looting|looted/.test(text)) types.push("trafficking");
  if (/corruption|bribery|\bbribe\b/.test(text)) {
    if (/corruption/.test(text)) types.push("corruption");
    if (/bribery|\bbribe\b/.test(text)) types.push("bribery");
  }

  return types;
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

    // Determine if this source behaves like a broad source (needs keyword filter)
    const sourceLower = source.name.toLowerCase();
    const isBroadSource = BROAD_SOURCES.some((s) => sourceLower.includes(s));
    const effectiveTier = isBroadSource ? "tier2" : source.tier;

    // Batch dedup — clean Google URLs first, then check
    const rawUrls = items.map((i) => i.link).filter(Boolean) as string[];
    const cleanedUrlMap = new Map(rawUrls.map((u) => [u, cleanGoogleUrl(u)]));
    const cleanedUrls = Array.from(cleanedUrlMap.values());

    const { data: existing } = await supabase
      .from("articles")
      .select("url")
      .in("url", cleanedUrls);
    const existingUrls = new Set(existing?.map((a) => a.url) ?? []);

    const toInsert: object[] = [];

    for (const item of items) {
      if (!item.link || !item.title) continue;
      stats.processed++;

      const cleanUrl = cleanGoogleUrl(item.link);
      if (existingUrls.has(cleanUrl)) { stats.skipped++; continue; }

      const title = he.decode(item.title.trim());
      const rawSnippet = item.contentSnippet ?? item.content ?? item.summary ?? "";
      const summary = extractSummary(rawSnippet);
      const rawText = `${title} ${rawSnippet}`.toLowerCase();

      let status: string;

      if (effectiveTier === "tier1") {
        status = "published";
      } else {
        if (shouldExcludeTitle(title)) { stats.skipped++; continue; }
        const matchA = matchesGroup(rawText, GROUP_A);
        const matchB = matchesGroup(rawText, GROUP_B);
        if (matchA && matchB) { status = "published"; }
        else if (matchA || matchB) { status = "review_queue"; }
        else { stats.skipped++; continue; }
      }

      const article_type = detectArticleType(title, summary, source.name);
      const crime_types = detectCrimeTypes(title, summary);

      toInsert.push({
        url: cleanUrl,
        title,
        source_name: source.name,
        source_tier: source.tier,
        published_date: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
        summary: summary || null,
        status,
        article_type,
        crime_types,
        regions: [],
        entity_types: [],
      });
    }

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
