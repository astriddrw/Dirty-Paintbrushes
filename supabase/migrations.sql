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
