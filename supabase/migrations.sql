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


-- ── 10. NEWSLETTER ─────────────────────────────────────────────────────────
-- subscribers: pending/confirmed/unsubscribed rather than a boolean, so
-- "never confirmed" and "confirmed then left" stay distinguishable in the
-- audit trail. confirm_token and unsubscribe_token are separate columns
-- (not one reused token) so a leaked unsubscribe link — which ends up in
-- every sent email, is by design low-stakes to leak — can never be replayed
-- to (re)confirm a subscription.
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_token uuid DEFAULT uuid_generate_v4(),
  unsubscribe_token uuid DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

CREATE INDEX IF NOT EXISTS subscribers_status_idx ON subscribers (status);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- No public policy: subscribe/confirm/unsubscribe all go through API routes
-- using the service-role client (the routes need to read tokens back and
-- send email via Resend regardless), same shape as ingestion_runs below.
DROP POLICY IF EXISTS "Authenticated users can manage subscribers" ON subscribers;
CREATE POLICY "Authenticated users can manage subscribers"
  ON subscribers FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- newsletter_issues: draft/sent archive, edited in /admin/newsletter before
-- sending — mirrors the articles review_queue pattern (generate first,
-- human reviews, human triggers the irreversible step).
CREATE TABLE IF NOT EXISTS newsletter_issues (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  period text NOT NULL, -- e.g. '2026-08'
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  subject text,
  html_content text,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS newsletter_issues_period_idx ON newsletter_issues (period DESC);

ALTER TABLE newsletter_issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage newsletter_issues" ON newsletter_issues;
CREATE POLICY "Authenticated users can manage newsletter_issues"
  ON newsletter_issues FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── 11. ADMIN-ONLY ACCESS ──────────────────────────────────────────────────
-- Until now every policy above granted full access to auth.role() =
-- 'authenticated' — but the public /login magic link lets anyone create an
-- account (to save articles), so "logged in" included every reader: they
-- could read the subscriber list, edit articles, approve comments, etc.
-- This section limits all of that to accounts listed in admin_users.
-- src/lib/admin-auth.ts and src/middleware.ts call the same is_admin()
-- function, so the app and the database apply one rule.
--
-- HOW TO RUN: in step A, replace the placeholder with the email you sign in
-- to /admin with, then run this whole section in the Supabase SQL editor.
-- If that email doesn't match an account, the safety check stops the script
-- before any permission is changed. Safe to run more than once.

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
-- No policies on purpose: only the service role and is_admin() read it.
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Step A: add the admin account (edit the email).
INSERT INTO admin_users (user_id)
SELECT id FROM auth.users WHERE lower(email) = lower('YOUR-ADMIN-EMAIL@example.com')
ON CONFLICT DO NOTHING;

-- Safety check: never tighten permissions without at least one admin.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users) THEN
    RAISE EXCEPTION 'No admin account found. Put the email you use for /admin into step A and run again. No permissions were changed.';
  END IF;
END $$;

-- Remove every "any logged-in user" policy on these tables. Public read
-- policies (published articles, approved comments, sources, cases), the
-- public comment/feedback insert policies and "Users can manage own
-- bookmarks" don't mention 'authenticated' and are left untouched.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('articles', 'cases', 'case_articles', 'rss_sources', 'comments',
                        'ingestion_runs', 'subscribers', 'newsletter_issues')
      AND (coalesce(qual, '') ILIKE '%authenticated%' OR coalesce(with_check, '') ILIKE '%authenticated%')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- …and give the same access to admins only.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['articles', 'cases', 'case_articles', 'rss_sources', 'comments',
                           'ingestion_runs', 'subscribers', 'newsletter_issues']
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins can manage ' || t, t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())',
        'Admins can manage ' || t, t
      );
    END IF;
  END LOOP;
END $$;

-- ── 12. ABUSE LIMITS + SAFE NEWSLETTER SENDS ──────────────────────────────
-- Run after section 11. Safe to run more than once.

-- a) Newsletter sign-ups: remember when the last confirmation email went
--    out, so /api/newsletter/subscribe can refuse to re-send to the same
--    address more than once every 10 minutes (stops someone flooding a
--    stranger's inbox with confirmation emails from our domain).
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS last_confirmation_sent_at timestamptz;

-- b) Comments: the old rate-limit policy never worked — its unqualified
--    display_name compared each row with itself, and RLS hid pending
--    comments from the count anyway. This function runs with full
--    visibility (SECURITY DEFINER) and enforces: max 3 comments per display
--    name per hour, and max 30 new comments site-wide per hour (every
--    comment waits for moderation, so this caps how fast spam can pile up).
CREATE OR REPLACE FUNCTION public.comment_rate_ok(name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.comments
       WHERE lower(display_name) = lower(name) AND created_at > now() - interval '1 hour') < 3
    AND
    (SELECT count(*) FROM public.comments WHERE created_at > now() - interval '1 hour') < 30;
$$;
REVOKE ALL ON FUNCTION public.comment_rate_ok(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.comment_rate_ok(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Public can insert comments with rate limit" ON comments;
DROP POLICY IF EXISTS "Public can insert comments" ON comments;
CREATE POLICY "Public can insert comments with rate limit"
  ON comments FOR INSERT
  WITH CHECK (status = 'pending' AND public.comment_rate_ok(display_name));

-- Length limits (match the form: 80-character name, 2,000-character
-- comment). NOT VALID = only checked for new comments, existing ones are
-- left alone.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_body_length') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_body_length
      CHECK (char_length(body) BETWEEN 1 AND 2000) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_name_length') THEN
    ALTER TABLE comments ADD CONSTRAINT comments_name_length
      CHECK (char_length(display_name) BETWEEN 1 AND 80) NOT VALID;
  END IF;
END $$;

-- c) Newsletter sends: one row per subscriber who has been sent an issue,
--    so retrying a send that failed halfway only emails the people who
--    haven't had it yet. sending_started_at stops two sends of the same
--    issue running at once (e.g. a double-click).
CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  issue_id uuid NOT NULL REFERENCES newsletter_issues (id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES subscribers (id) ON DELETE CASCADE,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (issue_id, subscriber_id)
);
ALTER TABLE newsletter_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage newsletter_deliveries" ON newsletter_deliveries;
CREATE POLICY "Admins can manage newsletter_deliveries"
  ON newsletter_deliveries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE newsletter_issues ADD COLUMN IF NOT EXISTS sending_started_at timestamptz;
