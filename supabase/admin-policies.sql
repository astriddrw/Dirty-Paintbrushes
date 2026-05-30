-- Admin RLS policies — run this in the Supabase SQL editor
-- Allows all authenticated users full CRUD access.
-- Scope this to specific admin UIDs once the admin user is created.

-- Articles
CREATE POLICY "Authenticated users can manage articles"
  ON articles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Cases
CREATE POLICY "Authenticated users can manage cases"
  ON cases FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Case articles join table
CREATE POLICY "Authenticated users can manage case_articles"
  ON case_articles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RSS sources
CREATE POLICY "Authenticated users can manage rss_sources"
  ON rss_sources FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Comments
CREATE POLICY "Authenticated users can manage comments"
  ON comments FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
