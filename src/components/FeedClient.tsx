"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Bookmark, ExternalLink, ChevronDown } from "lucide-react";
import {
  articleTypeLabels,
  crimeTypeColors,
  crimeTypeLabels,
  regionLabels,
} from "@/lib/placeholder-data";
import type { Article } from "@/lib/types";

const BOOKMARK_KEY = "dp_bookmarks";

interface FeedClientProps {
  articles: Article[];
}

type SortOrder = "newest" | "oldest";

const CRIME_FILTER_OPTIONS = [
  { value: "all",              label: "All" },
  { value: "fraud",            label: "Fraud" },
  { value: "terror_financing", label: "Terror Financing" },
  { value: "money_laundering", label: "Money Laundering" },
  { value: "sanctions_evasion",label: "Sanctions" },
];

const TYPE_FILTER_OPTIONS = [
  { value: "all",           label: "All" },
  { value: "regulation",    label: "Regulation" },
  { value: "investigation", label: "Investigation" },
  { value: "ruling",        label: "Ruling" },
  { value: "opinion",       label: "Opinion" },
  { value: "news",          label: "News" },
  { value: "analysis",      label: "Analysis" },
];

function formatDate(ds: string) {
  return new Date(ds).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-[5px] rounded-full text-[12px] font-medium transition-all duration-150 whitespace-nowrap leading-none ${
        active
          ? "bg-gray-950 text-white shadow-sm"
          : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function FeedClient({ articles }: FeedClientProps) {
  const [search, setSearch]           = useState("");
  const [crimeFilter, setCrimeFilter] = useState("all");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [sort, setSort]               = useState<SortOrder>("newest");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [bookmarked, setBookmarked]   = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BOOKMARK_KEY);
      if (saved) setBookmarked(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    let r = [...articles];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((a) => a.title.toLowerCase().includes(q) || (a.summary ?? "").toLowerCase().includes(q));
    }
    if (crimeFilter !== "all") r = r.filter((a) => a.crime_types.includes(crimeFilter as Article["crime_types"][number]));
    if (typeFilter !== "all")  r = r.filter((a) => a.article_type === typeFilter);
    if (dateFrom) r = r.filter((a) => a.published_date && new Date(a.published_date) >= new Date(dateFrom));
    if (dateTo)   r = r.filter((a) => a.published_date && new Date(a.published_date) <= new Date(dateTo));
    r.sort((a, b) => {
      const d = new Date(b.published_date ?? 0).getTime() - new Date(a.published_date ?? 0).getTime();
      return sort === "newest" ? d : -d;
    });
    return r;
  }, [articles, search, crimeFilter, typeFilter, dateFrom, dateTo, sort]);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      try {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  return (
    <div>

      {/* ── Controls row ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">

        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2 border border-gray-150 rounded-lg text-[14px] text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-300 transition-colors bg-white"
            style={{ borderColor: "#ebebeb" }}
          />
        </div>

        {/* Sort */}
        <div className="relative flex-shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className="appearance-none pl-3 pr-7 py-2 rounded-lg text-[13px] text-gray-500 bg-white focus:outline-none cursor-pointer border"
            style={{ borderColor: "#ebebeb" }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-2 rounded-lg text-[13px] text-gray-500 bg-white focus:outline-none border w-[130px]"
            style={{ borderColor: "#ebebeb" }}
          />
          <span className="text-gray-200 text-sm select-none">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-2 rounded-lg text-[13px] text-gray-500 bg-white focus:outline-none border w-[130px]"
            style={{ borderColor: "#ebebeb" }}
          />
        </div>
      </div>

      {/* ── Filter pills ───────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 mb-1.5">
        {CRIME_FILTER_OPTIONS.map(({ value, label }) => (
          <Pill key={value} active={crimeFilter === value} onClick={() => setCrimeFilter(value)}>
            {label}
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 mb-8">
        {TYPE_FILTER_OPTIONS.map(({ value, label }) => (
          <Pill key={value} active={typeFilter === value} onClick={() => setTypeFilter(value)}>
            {label}
          </Pill>
        ))}
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <p className="text-[12px] text-gray-300 mb-6">
        {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        {bookmarked.size > 0 && <> · {bookmarked.size} bookmarked</>}
      </p>

      {/* ── Article list ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-[14px] text-gray-300">
          No articles match the current filters.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "#f2f2f2" }}>
          {filtered.map((article, i) => {
            const primaryCrime  = article.crime_types?.[0];
            const crimeColor    = primaryCrime ? (crimeTypeColors[primaryCrime] ?? "bg-gray-100 text-gray-500 border border-gray-100") : null;
            const crimeLabel    = primaryCrime ? (crimeTypeLabels[primaryCrime] ?? primaryCrime.replace(/_/g, " ")) : null;
            const typeLabel     = article.article_type ? (articleTypeLabels[article.article_type as keyof typeof articleTypeLabels] ?? article.article_type) : null;
            const primaryRegion = article.regions?.[0];
            const regionLabel   = primaryRegion ? (regionLabels[primaryRegion] ?? primaryRegion.replace(/_/g, " ")) : null;
            const isBookmarked  = bookmarked.has(article.id);

            return (
              <div
                key={article.id}
                className="group flex items-start gap-5 py-5 -mx-2 px-2 rounded-xl hover:bg-gray-50/70 transition-colors duration-100"
              >
                {/* Row number */}
                <span className="flex-shrink-0 w-6 text-right text-[11px] text-gray-200 font-mono mt-[3px] select-none tabular-nums">
                  {i + 1}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/articles/${article.id}`}
                    className="block text-[15px] font-medium text-gray-900 hover:text-blue-600 transition-colors leading-snug mb-2.5 tracking-[-0.01em]"
                  >
                    {article.title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    {/* Crime tag */}
                    {crimeLabel && crimeColor && (
                      <span className={`inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium leading-none ${crimeColor}`}>
                        {crimeLabel}
                      </span>
                    )}
                    {/* Article type */}
                    {typeLabel && (
                      <span className="inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium leading-none bg-gray-100 text-gray-400">
                        {typeLabel}
                      </span>
                    )}
                    {/* Region */}
                    {regionLabel && (
                      <span className="inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium leading-none bg-gray-100 text-gray-400">
                        {regionLabel}
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

                {/* Actions — visible on hover */}
                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5">
                  <button
                    onClick={() => toggleBookmark(article.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isBookmarked
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-300 hover:text-gray-600 hover:bg-gray-100"
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
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
      )}
    </div>
  );
}
