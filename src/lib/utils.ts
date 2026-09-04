import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SourceTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared between feed/page.tsx (server query .range()) and feed-content.tsx
// (client display range "X–Y of Z") so the two can never drift apart.
export const FEED_PAGE_SIZE = 25;

export function tierBadge(tier: SourceTier): { label: string; className: string } {
  switch (tier) {
    case "tier1":
      return { label: "Tier 1", className: "bg-indigo-pale text-indigo border border-indigo-pale" };
    case "tier2":
      return { label: "Tier 2", className: "bg-secondary text-secondary-foreground border border-border" };
    case "tier3":
      return { label: "Tier 3", className: "bg-secondary text-muted-foreground border border-border" };
    case "tier4":
      return { label: "Tier 4", className: "bg-secondary text-muted-foreground border border-border" };
    case "tier5":
      return { label: "Tier 5", className: "bg-secondary text-muted-foreground border border-border" };
    case "manual":
      return { label: "Manual", className: "bg-secondary text-oxblood border border-border" };
  }
}

// Strips automated-ingestion prefixes (e.g. "GA - " or "Google Alert - "
// from Google Alerts source names) and cleans up the remainder for display
// — "GA - Painting + heist" -> "Painting & Heist". Source names with no
// such prefix pass through unchanged.
const GA_PREFIX = /^\s*(GA|Google Alert)\s*-\s*/i;

export function formatTag(tag: string): string {
  if (!GA_PREFIX.test(tag)) return tag;

  const stripped = tag.replace(GA_PREFIX, "").trim();
  const withAmpersands = stripped.replace(/\s*\+\s*/g, " & ");
  return withAmpersands
    .split(" ")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

// Tier 5 (Google Alerts) source_name is the alert's search-query label
// (e.g. "Art Market & Crime Fraud"), not the article's real publisher —
// fall back to the article URL's hostname, which is the true source, for
// that tier only. Other tiers already carry a real publication name.
export function formatSource(article: { source_name: string; source_tier: SourceTier; url: string }): string {
  if (article.source_tier === "tier5") {
    try {
      const hostname = new URL(article.url).hostname.replace(/^www\./, "");
      if (hostname) return hostname;
    } catch {
      // fall through to the default below
    }
  }
  return formatTag(article.source_name);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const HEADER_TIMESTAMP_MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

// "SEP 4 2026 · 14:32" — masthead-style dateline. Built manually rather than
// via toLocaleDateString/toLocaleString so the format (uppercase month,
// 24-hour time, the "·" separator) is exact and locale-independent, since
// this is read as part of the page furniture, not localized article data.
export function formatHeaderTimestamp(date: Date): string {
  const month = HEADER_TIMESTAMP_MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month} ${day} ${year} · ${hours}:${minutes}`;
}
