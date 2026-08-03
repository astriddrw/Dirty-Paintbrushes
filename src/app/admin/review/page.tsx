"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types";

function formatDate(ds: string) {
  return new Date(ds).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function ReviewQueuePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/review");
    const { articles: data } = await res.json();
    setArticles((data ?? []) as Article[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const act = async (id: string, status: "published" | "dismissed") => {
    setActing(id);
    await fetch("/api/admin/review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setActing(null);
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-1">Review Queue</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${articles.length} article${articles.length !== 1 ? "s" : ""} awaiting review`}
        </p>
      </div>

      {!loading && articles.length === 0 && (
        <div className="border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">Queue is empty.</p>
        </div>
      )}

      <div className="divide-y divide-border border-t border-b border-border">
        {articles.map((article) => (
          <div key={article.id} className="py-5 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground hover:underline leading-snug inline-flex items-center gap-1.5"
              >
                {article.title}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                <span className="text-xs text-muted-foreground">{article.source_name}</span>
                {article.published_date && (
                  <span className="text-xs text-muted-foreground">{formatDate(article.published_date)}</span>
                )}
                <span className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground">
                  {article.source_tier}
                </span>
              </div>

              {article.summary && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2 max-w-2xl">
                  {article.summary}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
              <button
                onClick={() => act(article.id, "published")}
                disabled={acting === article.id}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 disabled:opacity-40 transition-colors"
                title="Approve"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </button>
              <button
                onClick={() => act(article.id, "dismissed")}
                disabled={acting === article.id}
                className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-muted-foreground text-xs font-medium hover:bg-muted hover:text-foreground disabled:opacity-40 transition-colors"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
