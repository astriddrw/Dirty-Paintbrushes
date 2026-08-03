// Admission filter shared by /api/ingest (new articles) and /api/backfill
// (auditing existing articles against the same rule). Requires BOTH an
// art-market term AND a financial-crime term — applies regardless of source
// tier, since "trusted" tier1 sources have proven to publish off-topic content.

export const ART_MARKET_TERMS = [
  "art", "artwork", "painting", "sculpture", "antiquities", "cultural property",
  "artefact", "artifact", "gallery", "auction", "collector", "dealer", "museum",
  "freeport", "free port", "nft", "digital art", "provenance", "art market",
  "art world", "art trade", "art dealer", "auction house", "christie's", "sotheby's",
  "phillips", "bonhams", "art fair",
];

export const FINANCIAL_CRIME_TERMS = [
  "money laundering", "laundering", "fraud", "forgery", "sanctions",
  "terror financing", "terrorist financing", "tax evasion", "tax fraud",
  "bribery", "corruption", "illicit", "trafficking", "smuggling", "looting",
  "stolen", "seized", "forfeiture", "confiscated", "indicted", "indictment",
  "convicted", "sentenced", "shell company", "beneficial owner", "due diligence",
  "aml", "kyc", "proceeds of crime", "fatf", "ofac", "ofsi", "fincen", "hmrc", "nca",
];

export const TITLE_EXCLUDE = [
  "exhibition review", "gallery opening", "studio visit", "art class",
  "art supplies", "tutorial", "collection highlight", "retrospective",
];

// Non-article content — donation pages, newsletter signups, etc. Rejected
// even if it happens to match both term groups above.
export const NON_ARTICLE_PATTERNS = [
  "donate now", "make a donation", "donate today", "support our work",
  "subscribe to our newsletter", "sign up for our newsletter",
  "newsletter sign-up", "newsletter signup", "join our mailing list",
  "become a member", "membership benefits", "subscribe now",
];

export function matchesGroup(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

export function shouldExcludeTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return TITLE_EXCLUDE.some((phrase) => lower.includes(phrase));
}

export function isNonArticleContent(text: string): boolean {
  const lower = text.toLowerCase();
  return NON_ARTICLE_PATTERNS.some((phrase) => lower.includes(phrase));
}

export interface RelevanceCheck {
  relevant: boolean;
  reason?: "title_excluded" | "non_article_content" | "no_art_market_term" | "no_financial_crime_term";
}

export function checkRelevance(title: string, bodyText: string): RelevanceCheck {
  const rawText = `${title} ${bodyText}`.toLowerCase();

  if (shouldExcludeTitle(title)) return { relevant: false, reason: "title_excluded" };
  if (isNonArticleContent(rawText)) return { relevant: false, reason: "non_article_content" };

  const matchesArtMarket = matchesGroup(rawText, ART_MARKET_TERMS);
  const matchesFinancialCrime = matchesGroup(rawText, FINANCIAL_CRIME_TERMS);

  if (!matchesArtMarket) return { relevant: false, reason: "no_art_market_term" };
  if (!matchesFinancialCrime) return { relevant: false, reason: "no_financial_crime_term" };

  return { relevant: true };
}
