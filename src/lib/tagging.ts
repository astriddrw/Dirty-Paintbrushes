// Keyword-based tagging — no external API calls, no cost.
//
// The vocabulary here is deliberately a superset of GROUP_B's admission
// terms (see relevance-filter.ts) mapped onto the 4 crime types the UI
// actually exposes, so an article that gets admitted (e.g. because its text
// contains "seized" or "shell company") doesn't fall through to an empty
// crime_types array purely because the tagger's vocabulary was narrower than
// the filter's.

export const CRIME_TYPE_VALUES = [
  "fraud",
  "money_laundering",
  "sanctions_evasion",
  "terror_financing",
] as const;

export const ARTICLE_TYPE_VALUES = [
  "news",
  "opinion",
  "regulation",
  "investigation",
  "ruling",
  "analysis",
] as const;

export type CrimeTypeValue = (typeof CRIME_TYPE_VALUES)[number];
export type ArticleTypeValue = (typeof ARTICLE_TYPE_VALUES)[number];

export interface ClassificationResult {
  crime_types: CrimeTypeValue[];
  article_type: ArticleTypeValue;
}

const REGULATORY_SOURCES = ["fatf", "hmrc", "ofac", "fincen", "ofsi", "financial crimes enforcement"];
const LAW_FIRM_SOURCES = ["norton rose", "complyadvantage", "financial crime academy"];

const FRAUD_PATTERN = /\bfraud\b|forgery|counterfeit|\bfake\b|provenance fraud/;
const MONEY_LAUNDERING_PATTERN =
  /launder|money.?launder|shell compan(?:y|ies)|beneficial owner|\baml\b|\bkyc\b|due diligence|proceeds of crime|forfeiture|confiscated|\bseized\b/;
const SANCTIONS_PATTERN = /\bsanctions?\b|\bofac\b|\bofsi\b/;
const TERROR_FINANCING_PATTERN = /terror(?:ist)?\s+financing/;

function detectCrimeTypes(text: string): CrimeTypeValue[] {
  const types: CrimeTypeValue[] = [];
  if (MONEY_LAUNDERING_PATTERN.test(text)) types.push("money_laundering");
  if (FRAUD_PATTERN.test(text)) types.push("fraud");
  if (SANCTIONS_PATTERN.test(text)) types.push("sanctions_evasion");
  if (TERROR_FINANCING_PATTERN.test(text)) types.push("terror_financing");
  return types;
}

function detectArticleType(title: string, summary: string, sourceName: string): ArticleTypeValue {
  const text = `${title} ${summary}`.toLowerCase();
  const src = sourceName.toLowerCase();

  if (REGULATORY_SOURCES.some((s) => src.includes(s))) return "regulation";
  if (LAW_FIRM_SOURCES.some((s) => src.includes(s))) return "analysis";

  if (/ruling|sentenced|verdict|\bcourt\b|judge|convicted/.test(text)) return "ruling";
  if (/investigation|probe|inquiry|revealed|uncovered/.test(text)) return "investigation";
  if (/\bopinion\b|commentary|editorial|op-ed/.test(text)) return "opinion";
  if (/regulation|regulatory|compliance|directive|guidance/.test(text)) return "regulation";

  return "news";
}

// Returns an empty crime_types array when nothing matches — never forces a tag.
export function classifyArticle(params: {
  sourceName: string;
  title: string;
  summary: string | null;
}): ClassificationResult {
  const { sourceName, title, summary } = params;
  const text = `${title} ${summary ?? ""}`.toLowerCase();

  return {
    crime_types: detectCrimeTypes(text),
    article_type: detectArticleType(title, summary ?? "", sourceName),
  };
}
