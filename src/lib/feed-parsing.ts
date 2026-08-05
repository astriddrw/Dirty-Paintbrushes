import he from "he";

export function decodeHtml(raw: string): string {
  if (!raw) return raw;
  const stripped = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return he.decode(stripped);
}

export function extractSummary(raw: string): string {
  const plain = decodeHtml(raw);
  const sentences = plain.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  return sentences.slice(0, 3).join(" ").trim().slice(0, 600);
}

export function cleanGoogleUrl(url: string): string {
  try {
    if (!url.includes("google.com/url")) return url;
    const parsed = new URL(url);
    const real = parsed.searchParams.get("url");
    return real ? decodeURIComponent(real) : url;
  } catch {
    return url;
  }
}

export function parsePublishedDate(item: { pubDate?: string; isoDate?: string }): string | null {
  const raw = item.isoDate ?? item.pubDate;
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}
