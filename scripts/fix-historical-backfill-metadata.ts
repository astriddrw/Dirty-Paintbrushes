// One-off correction: the initial historical-backfill runs stored
// source_name: "historical_backfill" (clobbering the real publication) and
// never populated crime_types/article_type. Fixes both for every row already
// inserted by scripts/backfill-historical.ts, identified via source_tier
// "manual" (unique to backfill rows — no live-ingested article uses it).
//
// Usage:
//   set -a; source .env.local; set +a
//   npx tsx scripts/fix-historical-backfill-metadata.ts

import { createAdminClient } from "@/lib/supabase/admin";
import { classifyArticle } from "@/lib/tagging";

function sourceNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

async function main() {
  const supabase = createAdminClient();

  const { data: rows, error } = await supabase
    .from("articles")
    .select("id, url, title, summary")
    .eq("source_tier", "manual");

  if (error) {
    console.error("Failed to fetch rows:", error.message);
    process.exit(1);
  }

  console.log(`Found ${rows?.length ?? 0} historical_backfill rows to fix.`);

  let fixed = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    const source_name = sourceNameFromUrl(row.url);
    const classification = classifyArticle({
      sourceName: source_name,
      title: row.title,
      summary: row.summary,
    });

    const { error: updateError } = await supabase
      .from("articles")
      .update({
        source_name,
        article_type: classification.article_type,
        crime_types: classification.crime_types,
      })
      .eq("id", row.id);

    if (updateError) {
      failed++;
      console.log(`  ERROR (${row.id}): ${updateError.message}`);
    } else {
      fixed++;
    }
  }

  console.log(`\nDone. fixed: ${fixed}, failed: ${failed}`);
}

main();
