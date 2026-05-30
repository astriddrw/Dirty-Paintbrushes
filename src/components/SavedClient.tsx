"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { crimeTypeColors, crimeTypeLabels } from "@/lib/placeholder-data";
import type { Article } from "@/lib/types";

const BOOKMARK_KEY = "dp_bookmarks";

function formatDate(ds: string) {
  return new Date(ds).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function SavedClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const saved = localStorage.getItem(BOOKMARK_KEY);
        const ids: string[] = saved ? JSON.parse(saved) : [];
        setBookmarked(new Set(ids));
        if (ids.length === 0) { setLoading(false); return; }

        const supabase = createClient();
        const { data } = await supabase
          .from("articles")
          .select("*")
          .in("id", ids)
          .order("published_date", { ascending: false });

        setArticles((data ?? []) as Article[]);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const removeBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.delete(id);
      try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-[14px] text-gray-300">
        Loading…
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
          <Bookmark size={18} className="text-gray-300" />
        </div>
        <p className="text-[15px] font-medium text-gray-700 mb-2">No saved articles</p>
        <p className="text-[14px] text-gray-400">
          Bookmark articles from the feed to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: "#f2f2f2" }}>
      {articles.map((article, i) => {
        const primaryCrime = article.crime_types?.[0];
        const crimeColor   = primaryCrime ? (crimeTypeColors[primaryCrime] ?? "bg-gray-100 text-gray-500 border border-gray-100") : null;
        const crimeLabel   = primaryCrime ? (crimeTypeLabels[primaryCrime] ?? primaryCrime.replace(/_/g, " ")) : null;
        const isSaved      = bookmarked.has(article.id);

        return (
          <div
            key={article.id}
            className="group flex items-start gap-5 py-5 -mx-2 px-2 rounded-xl hover:bg-gray-50/70 transition-colors duration-100"
          >
            <span className="flex-shrink-0 w-6 text-right text-[11px] text-gray-200 font-mono mt-[3px] select-none tabular-nums">
              {i + 1}
            </span>

            <div className="flex-1 min-w-0">
              <Link
                href={`/articles/${article.id}`}
                className="block text-[15px] font-medium text-gray-900 hover:text-blue-600 transition-colors leading-snug mb-2.5 tracking-[-0.01em]"
              >
                {article.title}
              </Link>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                {crimeLabel && crimeColor && (
                  <span className={`inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium leading-none ${crimeColor}`}>
                    {crimeLabel}
                  </span>
                )}
                <span className="text-[11px] text-gray-300 select-none">·</span>
                <span className="text-[12px] text-gray-400">{article.source_name}</span>
                {article.published_date && (
                  <>
                    <span className="text-[11px] text-gray-200 select-none">·</span>
                    <span className="text-[12px] text-gray-300">{formatDate(article.published_date)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5">
              <button
                onClick={() => removeBookmark(article.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSaved ? "text-blue-600 bg-blue-50" : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title="Remove bookmark"
              >
                <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
              </button>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Open original"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
