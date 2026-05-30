export type SourceTier = "tier1" | "tier2" | "tier3" | "tier4" | "manual";
export type ArticleStatus = "published" | "review_queue" | "draft" | "dismissed";
export type CaseStatus = "ongoing" | "resolved" | "under_investigation";

export type CrimeType =
  | "money_laundering"
  | "sanctions_evasion"
  | "fraud"
  | "forgery"
  | "tax_evasion"
  | "terror_financing"
  | "trafficking"
  | "bribery"
  | "corruption"
  | "looting";

export type EntityType =
  | "auction_house"
  | "gallery"
  | "shell_company"
  | "individual"
  | "museum"
  | "freeport"
  | "dealer"
  | "bank"
  | "government";

export type ArticleType = "regulation" | "investigation" | "ruling" | "opinion" | "news" | "analysis";

export interface Article {
  id: string;
  url: string;
  title: string;
  source_name: string;
  source_tier: SourceTier;
  published_date: string;
  fetched_date: string;
  summary: string;
  editor_note?: string | null;
  crime_types: CrimeType[];
  regions: string[];
  entity_types: EntityType[];
  status: ArticleStatus;
  relevance_score?: number | null;
  secondary_sources?: string[] | null;
  article_type?: ArticleType | null;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id?: string | null;
  display_name: string;
  body: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface Case {
  id: string;
  name: string;
  status: CaseStatus;
  date_range: string;
  summary: string;
  crime_types: CrimeType[];
  regions: string[];
  key_entities: string[];
  created_at: string;
  updated_at: string;
}

export interface RssSource {
  id: string;
  name: string;
  feed_url: string;
  tier: SourceTier;
  active: boolean;
  last_fetched?: string | null;
}
