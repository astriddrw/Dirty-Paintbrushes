# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Four audiences, roughly equal priority:
- Compliance/AML professionals — financial crime, sanctions, and due-diligence practitioners who need reliable, well-tagged case intelligence.
- Journalists and researchers — investigating or writing about art-market crime, need a searchable archive and citable sourcing.
- People working in the art sector — dealers, auction houses, galleries, museums who want to track risk and reputational exposure in their market.
- General interested public — art-world followers with no professional stake, drawn in by the subject matter itself.

## Product Purpose

Dirty Paintbrushes aggregates and curates news about financial crime in the art market (money laundering, sanctions evasion, fraud, forgery, tax evasion, terror financing, trafficking, bribery, corruption, looting) and organizes it into a structured, searchable record — a published feed of classified articles plus case files that tie related coverage of the same matter together over time. Success means being the place all four audiences check for reliable, current signal on this niche instead of piecing it together from scattered RSS feeds and search.

## Positioning

The mechanism is the curated, classified feed: RSS ingestion runs articles through a relevance filter and Haiku-based classifier that tags crime type, region, and entity type, and routes uncertain items to a manual review queue before publish. This turns noisy multi-source RSS into a signal-only feed a reader can trust and filter — something raw RSS or ad hoc search cannot do. Case files are a secondary structure built on top of the same classified article pool.

## Operating Context

- Ingestion pipeline: RSS sources (tiered `tier1`–`tier5` plus `manual`) are pulled, deduped, run through a relevance filter and Haiku classifier, and land in `review_queue` or `published` status (`draft`/`dismissed` also exist). Ingestion runs are logged (`ingestion_runs`).
- Admin panel (`/admin`) is where the operator (currently just the founder) monitors published/review-queue/source/case counts, submits articles manually, works the review queue, and manages case files.
- Public surfaces: home (`/`), feed (`/feed`) with filters (crime type, region, entity type, date, search), article detail with crime/region tags and an editor's note, case list/detail (`/cases`), sources (`/sources`) listing all active RSS sources grouped by tier, saved/bookmarked articles (`/saved`), about (`/about`).
- Comment feature lets readers add analysis or flag connections on articles.
- Backed by Supabase (Postgres + auth); classification uses the Anthropic API (Haiku).

## Capabilities and Constraints

- Sourcing discipline is a hard constraint: every published claim must trace back to a cited news source. No editorializing or presenting unverified allegations as fact — this applies to editor's notes, case summaries, and any future AI-assisted copy.
- Comment moderation policy is not yet decided — record as open rather than inventing a rule.
- Article/case data model (source of truth in `src/lib/types.ts` and `supabase/schema.sql`): `CrimeType`, `EntityType`, `SourceTier`, `ArticleStatus`, `CaseStatus`, `ArticleType` enums drive tagging and filtering throughout the product — treat these as fixed vocabulary, not free text.
- Real Supabase data is live in production surfaces (sources, admin, feed); `src/lib/placeholder-data.ts` still exists as legacy fallback/dev data and should not be treated as current product content.

## Brand Commitments

- Name "Dirty Paintbrushes" comes directly from the founder's academic paper ("Dirty Paintbrushes: The Use of the Art Market in Financing Terrorist Activity," written at Georgetown) — this origin is stated on `/about` and is binding, not just historical trivia.
- Founder bio and motivation on `/about` (KCL/Georgetown IR background, financial-crime compliance career) is real, confirmed content — do not fabricate or embellish it.
- Established visual identity already in place (an "FT-meets-broadsheet" palette, serif/broadsheet typographic system) — treated as incumbent design authority for `/impeccable document` or refinement work, not decided here.

## Evidence on Hand

- Supabase schema (`supabase/schema.sql`) and live tables are the real data model — no placeholder metrics or fabricated case studies should be introduced.
- `/about` page text is the founder's real, first-person account — preserve as-is unless the founder changes it.
- Sources page enumerates real, named RSS sources with tier classifications — this is factual content, not sample data.

## Product Principles

1. Signal over noise — every article that reaches "published" earned its place through relevance filtering and classification; the feed's credibility is the product.
2. Sourcing is non-negotiable — claims about crime, fraud, or wrongdoing must be traceable to a cited source at all times.
3. Serve four audiences without diluting for any one — compliance rigor, journalistic citability, sector relevance, and general readability all have to coexist in the same surfaces.
4. Cases are the long memory — the feed is current-events; case files are where scattered coverage of the same matter accumulates into a durable record.

## Accessibility & Inclusion

No product-specific accessibility requirement established yet — record as open.
