import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SourceTier } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tierBadge(tier: SourceTier): { label: string; className: string } {
  switch (tier) {
    case "tier1":
      return { label: "Tier 1", className: "bg-blue-100 text-blue-700 border border-blue-200" };
    case "tier2":
      return { label: "Tier 2", className: "bg-secondary text-secondary-foreground border border-border" };
    case "tier3":
      return { label: "Tier 3", className: "bg-secondary text-muted-foreground border border-border" };
    case "tier4":
      return { label: "Tier 4", className: "bg-secondary text-muted-foreground border border-border" };
    case "tier5":
      return { label: "Tier 5", className: "bg-secondary text-muted-foreground border border-border" };
    case "manual":
      return { label: "Manual", className: "bg-purple-100 text-purple-700 border border-purple-200" };
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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
