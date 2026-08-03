import { createAdminClient } from "@/lib/supabase/admin";
import { IngestButton } from "@/components/ingest-button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

// Queries live data with the service-role client on every request — Next
// otherwise tries to prerender this at build time, when that env var isn't
// necessarily available, and fails the whole build.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    { data: publishedRows },
    { data: reviewQueueRows },
    { data: sourceRows },
    { data: caseRows },
    { data: recent },
  ] = await Promise.all([
    supabase.from("articles").select("id").eq("status", "published"),
    supabase.from("articles").select("id").eq("status", "review_queue"),
    supabase.from("rss_sources").select("id").eq("active", true),
    supabase.from("cases").select("id"),
    supabase.from("articles").select("title, source_name, published_date, status, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  const published = publishedRows?.length ?? 0;
  const reviewQueue = reviewQueueRows?.length ?? 0;
  const sources = sourceRows?.length ?? 0;
  const cases = caseRows?.length ?? 0;

  const stats = [
    { label: "Published",    value: published,   href: "/feed" },
    { label: "Review Queue", value: reviewQueue,  href: "/admin/review" },
    { label: "Active Sources", value: sources,   href: "/sources" },
    { label: "Cases",        value: cases,        href: "/admin/cases" },
  ];

  const quickLinks = [
    { href: "/admin/submit",  label: "Submit Article",   desc: "Manually add an article" },
    { href: "/admin/review",  label: "Review Queue",     desc: `${reviewQueue} awaiting review` },
    { href: "/admin/cases",   label: "Manage Cases",     desc: "Create and edit case files" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-serif mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Dirty Paintbrushes admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="border border-border p-5 hover:border-foreground hover:bg-secondary transition-all"
          >
            <p className="text-2xl font-serif mb-1">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-12">
        {/* Ingestion */}
        <div>
          <h2 className="text-sm font-medium text-foreground mb-1">Feed Ingestion</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Pulls RSS feeds from all active sources. Runs automatically every 6 hours via Vercel cron.
          </p>
          <IngestButton />
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-medium text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickLinks.map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 border border-border hover:border-foreground hover:bg-secondary transition-all group"
              >
                <span className="text-sm group-hover:underline">{label}</span>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent articles */}
      {recent && recent.length > 0 && (
        <div className="mt-14">
          <h2 className="text-sm font-medium text-foreground mb-4">Recently Added</h2>
          <div className="divide-y divide-border border-t border-border">
            {recent.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-3 gap-4">
                <p className="text-sm text-foreground truncate flex-1">{a.title}</p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 ${
                    a.status === "published" ? "bg-green-50 text-green-700" :
                    a.status === "review_queue" ? "bg-amber-50 text-amber-700" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {a.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{a.source_name}</span>
                  {a.published_date && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatDate(a.published_date)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
