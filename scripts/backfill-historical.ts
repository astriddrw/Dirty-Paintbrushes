// One-off backfill: uses Claude + real web search to find historical (2020-2026)
// art-market financial crime articles and queue them for review.
//
// Usage:
//   set -a; source .env.local; set +a
//   npx tsx scripts/backfill-historical.ts

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRIMARY_CATEGORY_VALUES, type PrimaryCategory } from "@/lib/haiku-classifier";
import { classifyArticle } from "@/lib/tagging";

const MODEL = "claude-sonnet-4-6";
const MAX_SEARCHES_PER_QUERY = 5;
const DELAY_BETWEEN_QUERIES_MS = 500;
const EFFORT = "medium";

const SYSTEM_PROMPT = `You are researching real historical art-market financial crime cases for Dirty Paintbrushes (dirtypaintbrushes.com), a platform tracking art market financial crime.

For the given search query:
1. Use the web_search tool to find real news articles, press releases, or court filings matching the query. The query may span multiple years — search broadly enough to surface distinct cases spread across the whole range, not just the single most prominent one.
2. Once you have searched, call the record_results tool exactly once with your findings as structured JSON. Each item must include: title, url, published_date (ISO 8601 date if known, otherwise null), summary (2 factual sentences focused on the crime/legal action), primary_category, key_actors (named individuals/companies involved), agencies_or_courts (law enforcement/courts/regulators named), and confidence_score.
3. CRITICAL: only include a URL if it was actually returned by the web_search tool in this same call — never construct, guess, or recall a URL from training data or prior knowledge. If you are unsure whether a URL came from an actual search result, exclude that item entirely.
4. If no genuinely relevant real results are found, call record_results with an empty results array. Do not fabricate results to avoid an empty array.
5. Only include results specifically about the art, antiquities, or collectibles market — general financial crime with no art-market angle does not belong here.`;

// 2020-2024 is fully covered by prior runs except "art sanctions evasion
// 2021-2024", which failed on a transient connection error and needs a
// retry. This pass also extends coverage through 2025-2026, one consolidated
// query per category.
const REMAINING_QUERIES = [
  "art sanctions evasion 2021-2024",
  "art dealer fraud sentenced 2025-2026",
  "art market money laundering case 2025-2026",
  "antiquities trafficking prosecution 2025-2026",
  "art sanctions evasion 2025-2026",
  "gallery forgery scheme 2025-2026",
];

interface BackfillResult {
  title: string;
  url: string;
  published_date: string | null;
  summary: string;
  primary_category: PrimaryCategory;
  key_actors: string[];
  agencies_or_courts: string[];
  confidence_score: number;
}

const RECORD_RESULTS_TOOL_NAME = "record_results";

const RECORD_RESULTS_TOOL = {
  name: RECORD_RESULTS_TOOL_NAME,
  description: "Record the verified real articles found for this search query.",
  input_schema: {
    type: "object" as const,
    properties: {
      results: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            title: { type: "string" as const },
            url: { type: "string" as const },
            published_date: { type: ["string", "null"] as unknown as "string" },
            summary: { type: "string" as const },
            primary_category: { type: "string" as const, enum: [...PRIMARY_CATEGORY_VALUES] },
            key_actors: { type: "array" as const, items: { type: "string" as const } },
            agencies_or_courts: { type: "array" as const, items: { type: "string" as const } },
            confidence_score: { type: "number" as const },
          },
          required: [
            "title",
            "url",
            "published_date",
            "summary",
            "primary_category",
            "key_actors",
            "agencies_or_courts",
            "confidence_score",
          ],
        },
      },
    },
    required: ["results"],
  },
};

const WEB_SEARCH_TOOL = {
  type: "web_search_20260209" as const,
  name: "web_search" as const,
  max_uses: MAX_SEARCHES_PER_QUERY,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Derived from the URL rather than asked of the model — deterministic, no
// hallucination risk. "historical_backfill" only lives in source_tier, which
// already distinguishes these rows from live-ingested ones.
function sourceNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

async function runQuery(client: Anthropic, query: string): Promise<BackfillResult[]> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [WEB_SEARCH_TOOL, RECORD_RESULTS_TOOL],
    output_config: { effort: EFFORT },
    messages: [{ role: "user", content: query }],
  });

  if (response.stop_reason === "pause_turn") {
    throw new Error("hit server-tool iteration limit (pause_turn) before recording results");
  }

  // Only URLs Anthropic's web_search tool actually returned are trusted —
  // anything the model claims outside this set is dropped, never inserted.
  const verifiedUrls = new Set<string>();
  for (const block of response.content) {
    if (block.type === "web_search_tool_result") {
      const content = block.content;
      if (Array.isArray(content)) {
        for (const result of content) {
          if (result.type === "web_search_result" && result.url) {
            verifiedUrls.add(result.url);
          }
        }
      }
    }
  }

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === "tool_use" && block.name === RECORD_RESULTS_TOOL_NAME
  );

  if (!toolUse) return [];

  const rawResults = (toolUse.input as { results?: BackfillResult[] }).results ?? [];

  return rawResults.filter((r) => {
    if (!verifiedUrls.has(r.url)) {
      console.log(`    ! dropped (unverified URL): ${r.title}`);
      return false;
    }
    return true;
  });
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ERROR: ANTHROPIC_API_KEY environment variable is not set.");
    process.exit(1);
  }

  const client = new Anthropic();
  const supabase = createAdminClient();

  const queries: string[] = REMAINING_QUERIES;

  const totals = {
    queriesRun: 0,
    found: 0,
    inserted: 0,
    errors: 0,
  };
  const rejectedTitles: string[] = [];
  const errorDetails: string[] = [];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    totals.queriesRun++;
    console.log(`\n[${i + 1}/${queries.length}] "${query}"`);

    let results: BackfillResult[];
    try {
      results = await runQuery(client, query);
    } catch (e) {
      totals.errors++;
      const message = e instanceof Error ? e.message : String(e);
      errorDetails.push(`${query}: ${message}`);
      console.log(`  ERROR: ${message}`);
      await sleep(DELAY_BETWEEN_QUERIES_MS);
      continue;
    }

    totals.found += results.length;

    let insertedThisQuery = 0;
    if (results.length > 0) {
      const urls = results.map((r) => r.url);
      const { data: existing } = await supabase.from("articles").select("url").in("url", urls);
      const existingUrls = new Set(existing?.map((a) => a.url) ?? []);

      const toInsert = results
        .filter((r) => {
          if (existingUrls.has(r.url)) {
            rejectedTitles.push(r.title);
            return false;
          }
          return true;
        })
        .map((r) => {
          const source_name = sourceNameFromUrl(r.url);
          const classification = classifyArticle({
            sourceName: source_name,
            title: r.title,
            summary: r.summary || null,
          });

          return {
            url: r.url,
            title: r.title,
            source_name,
            source_tier: "manual",
            published_date: r.published_date,
            summary: r.summary,
            status: "review_queue",
            article_type: classification.article_type,
            crime_types: classification.crime_types,
            regions: [],
            entity_types: [],
            relevance_score: r.confidence_score,
            key_actors: r.key_actors,
            agencies_or_courts: r.agencies_or_courts,
          };
        });

      if (toInsert.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("articles")
          .upsert(toInsert, { onConflict: "url", ignoreDuplicates: true })
          .select("id");
        if (insertError) {
          totals.errors++;
          errorDetails.push(`${query} (insert): ${insertError.message}`);
        } else {
          insertedThisQuery = inserted?.length ?? 0;
        }
      }
    }

    totals.inserted += insertedThisQuery;
    console.log(`  found ${results.length}, inserted ${insertedThisQuery}`);

    await sleep(DELAY_BETWEEN_QUERIES_MS);
  }

  const { error: runError } = await supabase.from("ingestion_runs").insert({
    sources_checked: totals.queriesRun,
    articles_seen: totals.found,
    articles_stored: totals.inserted,
    articles_rejected: totals.found - totals.inserted,
    errors: totals.errors,
    rejected_titles: rejectedTitles.slice(0, 50),
    error_details: errorDetails,
  });
  if (runError) {
    console.error("[BACKFILL] failed to log ingestion_runs:", runError.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("BACKFILL SUMMARY");
  console.log(`  queries run:  ${totals.queriesRun}`);
  console.log(`  found:        ${totals.found}`);
  console.log(`  inserted:     ${totals.inserted}`);
  console.log(`  errors:       ${totals.errors}`);
  console.log("=".repeat(60));
}

main();
