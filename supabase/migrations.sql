-- ============================================================
-- DIRTY PAINTBRUSHES — DATABASE MIGRATIONS
-- Run this in the Supabase SQL editor
-- ============================================================

-- ── 1. SOURCE TIER FIXES ──────────────────────────────────────────────────
-- Move broad sources from tier1 → tier3 (they publish too broadly for tier1)
UPDATE rss_sources SET tier = 'tier3'
WHERE name IN (
  'ICIJ',
  'OCCRP',
  'Transparency International',
  'Basel Institute on Governance',
  'Center for Art Law',
  'FATF'
);

-- Confirm ARCA and Antiquities Coalition remain tier1
UPDATE rss_sources SET tier = 'tier1'
WHERE name IN ('ARCA Blog', 'Antiquities Coalition');


-- ── 2. DELETE IRRELEVANT ARTICLES ────────────────────────────────────────
-- Remove articles clearly unrelated to art market financial crime
DELETE FROM articles
WHERE
  title ILIKE '%cancer%'
  OR title ILIKE '%chemotherapy%'
  OR title ILIKE '%bitcoin depot%'
  OR title ILIKE '%bitcoin atm%'
  OR title ILIKE '%crypto atm%'
  OR title ILIKE '%epstein%fidelity%'
  OR title ILIKE '%amaryllis fox%'
  OR title ILIKE '%digital reconstruction%'
  OR title ILIKE '%3d reconstruction%'
  OR title ILIKE '%film rights%'
  OR title ILIKE '%drug trial%'
  OR title ILIKE '%oncology%'
  OR (
    -- Crypto articles that aren't about art market crypto
    (title ILIKE '%crypto%' OR title ILIKE '%bitcoin%' OR title ILIKE '%blockchain%')
    AND title NOT ILIKE '%nft%'
    AND title NOT ILIKE '%art%'
    AND title NOT ILIKE '%museum%'
    AND title NOT ILIKE '%auction%'
  );


-- ── 3. RLS SECURITY POLICIES ─────────────────────────────────────────────

-- Articles: public read (published only), authenticated full access
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can manage articles" ON articles;

CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage articles"
  ON articles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Cases: public read, authenticated full access
DROP POLICY IF EXISTS "Public can read cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can manage cases" ON cases;

CREATE POLICY "Public can read cases"
  ON cases FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage cases"
  ON cases FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Case articles join table
DROP POLICY IF EXISTS "Public can read case articles" ON case_articles;
DROP POLICY IF EXISTS "Authenticated users can manage case_articles" ON case_articles;

CREATE POLICY "Public can read case articles"
  ON case_articles FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage case_articles"
  ON case_articles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RSS sources: public read, authenticated full access
DROP POLICY IF EXISTS "Public can read rss sources" ON rss_sources;
DROP POLICY IF EXISTS "Authenticated users can manage rss_sources" ON rss_sources;

CREATE POLICY "Public can read rss sources"
  ON rss_sources FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage rss_sources"
  ON rss_sources FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Comments: public read + insert (with rate limit), authenticated full access
DROP POLICY IF EXISTS "Public can read comments" ON comments;
DROP POLICY IF EXISTS "Public can insert comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can manage comments" ON comments;

CREATE POLICY "Public can read comments"
  ON comments FOR SELECT USING (true);

-- Rate-limited public comment insert: max 3 comments per display_name per hour
CREATE POLICY "Public can insert comments with rate limit"
  ON comments FOR INSERT
  WITH CHECK (
    (
      SELECT COUNT(*)
      FROM comments c2
      WHERE c2.display_name = display_name
        AND c2.created_at > NOW() - INTERVAL '1 hour'
    ) < 3
  );

CREATE POLICY "Authenticated users can manage comments"
  ON comments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ── 4. ADD article_type COLUMN IF MISSING ─────────────────────────────────
ALTER TABLE articles ADD COLUMN IF NOT EXISTS article_type text;


-- ── 5. ANONYMOUS FEEDBACK ─────────────────────────────────────────────────
-- Fully anonymous — no display_name, no user_id, no public read policy.
-- Only visible via the Supabase dashboard / service-role queries.
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit feedback" ON feedback;
CREATE POLICY "Public can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);


-- ── 6. INGESTION RUNS LOG ─────────────────────────────────────────────────
-- Tracks each /api/ingest run for observability. Written by the admin
-- (service-role) client, so no public policy is needed — only authenticated
-- users can read run history from the admin UI.
CREATE TABLE IF NOT EXISTS ingestion_runs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sources_checked integer NOT NULL DEFAULT 0,
  articles_seen integer NOT NULL DEFAULT 0,
  articles_stored integer NOT NULL DEFAULT 0,
  articles_rejected integer NOT NULL DEFAULT 0,
  errors integer NOT NULL DEFAULT 0,
  rejected_titles text[] DEFAULT '{}',
  error_details text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ingestion_runs_created_at_idx ON ingestion_runs (created_at DESC);

ALTER TABLE ingestion_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage ingestion_runs" ON ingestion_runs;
CREATE POLICY "Authenticated users can manage ingestion_runs"
  ON ingestion_runs FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ── 7. HAIKU CLASSIFIER OUTPUT COLUMNS ────────────────────────────────────
-- Named individuals/companies and law enforcement/courts/regulators
-- extracted by classifyWithHaiku() (haiku-classifier.ts), stored alongside
-- the confidence_score (which already had a home in relevance_score).
ALTER TABLE articles ADD COLUMN IF NOT EXISTS key_actors text[] DEFAULT '{}';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS agencies_or_courts text[] DEFAULT '{}';


-- ── 8. SOURCE HOMEPAGE URLS ────────────────────────────────────────────────
-- /sources previously linked every source to feed_url, which resolves to raw
-- RSS/Atom XML instead of the institution's actual site — exactly wrong for
-- a page whose job is letting a skeptical visitor verify provenance.
-- site_url is left NULL for tier5 (Google Alerts) rows on purpose: those
-- aren't institutions with a homepage, they're the founder's own search
-- queries, and the page now labels them as such rather than linking them
-- to somewhere that doesn't exist.
ALTER TABLE rss_sources ADD COLUMN IF NOT EXISTS site_url text;

UPDATE rss_sources SET site_url = 'https://theantiquitiescoalition.org' WHERE name = 'Antiquities Coalition';
UPDATE rss_sources SET site_url = 'https://www.artcrimeresearch.org' WHERE name = 'ARCA';
UPDATE rss_sources SET site_url = 'https://www.apollo-magazine.com' WHERE name = 'Apollo Magazine';
UPDATE rss_sources SET site_url = 'https://news.artnet.com' WHERE name = 'Artnet News';
UPDATE rss_sources SET site_url = 'https://www.artnews.com' WHERE name = 'ARTnews';
UPDATE rss_sources SET site_url = 'https://www.theartnewspaper.com' WHERE name = 'The Art Newspaper';
UPDATE rss_sources SET site_url = 'https://baselgovernance.org' WHERE name = 'Basel Institute on Governance';
UPDATE rss_sources SET site_url = 'https://www.bbc.co.uk/news' WHERE name = 'BBC News';
UPDATE rss_sources SET site_url = 'https://www.bellingcat.com' WHERE name = 'Bellingcat';
UPDATE rss_sources SET site_url = 'https://itsartlaw.org' WHERE name = 'Center for Art Law';
UPDATE rss_sources SET site_url = 'https://www.fatf-gafi.org' WHERE name = 'FATF';
UPDATE rss_sources SET site_url = 'https://www.icij.org' WHERE name = 'ICIJ';
UPDATE rss_sources SET site_url = 'https://www.occrp.org' WHERE name = 'OCCRP';
UPDATE rss_sources SET site_url = 'https://www.theguardian.com' WHERE name = 'The Guardian';
UPDATE rss_sources SET site_url = 'https://www.transparency.org' WHERE name = 'Transparency International';
UPDATE rss_sources SET site_url = 'https://complyadvantage.com' WHERE name = 'ComplyAdvantage';
UPDATE rss_sources SET site_url = 'https://www.judiciary.uk' WHERE name = 'Courts and Tribunals Judiciary — Judgments';
UPDATE rss_sources SET site_url = 'https://www.cps.gov.uk' WHERE name = 'Crown Prosecution Service (CPS)';
UPDATE rss_sources SET site_url = 'https://financialcrimeacademy.org' WHERE name = 'Financial Crime Academy';
UPDATE rss_sources SET site_url = 'https://www.gov.uk/government/organisations/hm-courts-and-tribunals-service' WHERE name = 'HM Courts & Tribunals Service (HMCTS)';
UPDATE rss_sources SET site_url = 'https://www.nationalcrimeagency.gov.uk' WHERE name = 'National Crime Agency (NCA)';


-- ── 9. COMMENT MODERATION ───────────────────────────────────────────────────
-- Comments previously published instantly with zero review, unlike every
-- article on the product (which waits in /admin/review). New comments now
-- default to 'pending' and are excluded from the public read policy until
-- approved. There's no admin approval UI yet — approve a comment by setting
-- its status to 'approved' directly in the Supabase table editor.
ALTER TABLE comments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Backfill: comments that already existed before this migration were
-- effectively pre-approved (they were already live under the old policy).
UPDATE comments SET status = 'approved' WHERE status = 'pending';

DROP POLICY IF EXISTS "Public can read comments" ON comments;
CREATE POLICY "Public can read approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');
