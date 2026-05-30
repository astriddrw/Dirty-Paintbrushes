import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { createAdminClient } from "@/lib/supabase/admin";

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

function matchesGroup(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

function shouldExcludeTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return TITLE_EXCLUDE.some((phrase) => lower.includes(phrase));
}

function extractSummary(raw: string): string {
  const plain = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const sentences = plain.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  return sentences.slice(0, 3).join(" ").trim().slice(0, 600);
}

export async function GET() {
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

    // Batch dedup: fetch existing URLs for this batch
    const urls = items.map((i) => i.link).filter(Boolean) as string[];
    const { data: existing } = await supabase
      .from("articles")
      .select("url")
      .in("url", urls);
    const existingUrls = new Set(existing?.map((a) => a.url) ?? []);

    const toInsert: object[] = [];

    for (const item of items) {
      if (!item.link || !item.title) continue;
      stats.processed++;

      if (existingUrls.has(item.link)) { stats.skipped++; continue; }

      const rawText = `${item.title} ${item.contentSnippet ?? item.content ?? item.summary ?? ""}`;

      let status: string;

      if (source.tier === "tier1") {
        status = "published";
      } else {
        if (shouldExcludeTitle(item.title)) { stats.skipped++; continue; }
        const matchA = matchesGroup(rawText, GROUP_A);
        const matchB = matchesGroup(rawText, GROUP_B);
        if (matchA && matchB) { status = "published"; }
        else if (matchA || matchB) { status = "review_queue"; }
        else { stats.skipped++; continue; }
      }

      const summary = extractSummary(
        item.contentSnippet ?? item.content ?? item.summary ?? ""
      );

      toInsert.push({
        url: item.link,
        title: item.title.trim(),
        source_name: source.name,
        source_tier: source.tier,
        published_date: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
        summary: summary || null,
        status,
        crime_types: [],
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

    // Update last_fetched
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
