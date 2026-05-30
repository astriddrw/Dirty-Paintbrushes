-- Dirty Paintbrushes — Supabase Schema
-- Run this in the Supabase SQL editor to initialise the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ARTICLES
-- ============================================================
create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  url text unique not null,
  title text not null,
  source_name text not null,
  source_tier text not null check (source_tier in ('tier1', 'tier2', 'tier3', 'tier4', 'manual')),
  published_date timestamptz,
  fetched_date timestamptz default now(),
  summary text,
  editor_note text,
  crime_types text[] default '{}',
  regions text[] default '{}',
  entity_types text[] default '{}',
  status text not null default 'draft' check (status in ('published', 'review_queue', 'draft', 'dismissed')),
  relevance_score float,
  secondary_sources text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for feed queries
create index if not exists articles_published_date_idx on articles (published_date desc);
create index if not exists articles_status_idx on articles (status);
create index if not exists articles_crime_types_idx on articles using gin (crime_types);
create index if not exists articles_regions_idx on articles using gin (regions);

-- ============================================================
-- COMMENTS
-- ============================================================
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references articles (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  display_name text not null,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists comments_article_id_idx on comments (article_id);

-- ============================================================
-- BOOKMARKS
-- ============================================================
create table if not exists bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, article_id)
);

create index if not exists bookmarks_user_id_idx on bookmarks (user_id);

-- ============================================================
-- CASES
-- ============================================================
create table if not exists cases (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status text not null default 'ongoing' check (status in ('ongoing', 'resolved', 'under_investigation')),
  date_range text,
  summary text,
  crime_types text[] default '{}',
  regions text[] default '{}',
  key_entities text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CASE ARTICLES (join table)
-- ============================================================
create table if not exists case_articles (
  case_id uuid not null references cases (id) on delete cascade,
  article_id uuid not null references articles (id) on delete cascade,
  primary key (case_id, article_id)
);

-- ============================================================
-- RSS SOURCES
-- ============================================================
create table if not exists rss_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  feed_url text not null,
  tier text not null check (tier in ('tier1', 'tier2', 'tier3', 'tier4')),
  active boolean not null default true,
  last_fetched timestamptz
);

-- ============================================================
-- ADMIN USERS (role management)
-- ============================================================
create table if not exists admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Articles: public can read published articles only
alter table articles enable row level security;
create policy "Public can read published articles"
  on articles for select
  using (status = 'published');

-- Comments: public can read and insert
alter table comments enable row level security;
create policy "Public can read comments"
  on comments for select using (true);
create policy "Public can insert comments"
  on comments for insert with check (true);

-- Bookmarks: users can manage their own
alter table bookmarks enable row level security;
create policy "Users can manage own bookmarks"
  on bookmarks for all
  using (auth.uid() = user_id);

-- Cases: public can read
alter table cases enable row level security;
create policy "Public can read cases"
  on cases for select using (true);

-- Case articles: public can read
alter table case_articles enable row level security;
create policy "Public can read case articles"
  on case_articles for select using (true);

-- RSS sources: public can read
alter table rss_sources enable row level security;
create policy "Public can read rss sources"
  on rss_sources for select using (true);

-- ============================================================
-- SEED DATA — RSS SOURCES
-- ============================================================
insert into rss_sources (name, feed_url, tier) values
  -- Tier 1
  ('ARCA Blog', 'https://art-crime.blogspot.com/feeds/posts/default?alt=rss', 'tier1'),
  ('ICIJ', 'https://www.icij.org/feed/', 'tier1'),
  ('OCCRP', 'https://www.occrp.org/en/rss', 'tier1'),
  ('FATF', 'https://www.fatf-gafi.org/en/rss.xml', 'tier1'),
  ('Center for Art Law', 'https://itsartlaw.org/feed/', 'tier1'),
  ('Basel Institute on Governance', 'https://baselgovernance.org/feed', 'tier1'),
  ('Antiquities Coalition', 'https://theantiquitiescoalition.org/feed/', 'tier1'),
  ('Transparency International', 'https://www.transparency.org/en/feed', 'tier1'),
  -- Tier 2
  ('The Art Newspaper', 'https://www.theartnewspaper.com/rss', 'tier2'),
  ('Artnet News', 'https://news.artnet.com/feed', 'tier2'),
  ('ARTnews', 'https://www.artnews.com/feed/', 'tier2'),
  ('Apollo Magazine', 'https://www.apollo-magazine.com/feed/', 'tier2'),
  -- Tier 3
  ('Financial Times', 'https://www.ft.com/rss/home', 'tier3'),
  ('Reuters', 'https://www.reutersagency.com/feed/', 'tier3'),
  ('The Guardian', 'https://www.theguardian.com/uk/rss', 'tier3'),
  ('BBC News', 'https://feeds.bbci.co.uk/news/rss.xml', 'tier3'),
  ('Bellingcat', 'https://www.bellingcat.com/feed/', 'tier3'),
  -- Tier 4
  ('Norton Rose Fulbright', 'https://www.nortonrosefulbright.com/en/rss', 'tier4'),
  ('ComplyAdvantage', 'https://complyadvantage.com/feed/', 'tier4'),
  ('Financial Crime Academy', 'https://financialcrimeacademy.org/feed/', 'tier4')
on conflict do nothing;
