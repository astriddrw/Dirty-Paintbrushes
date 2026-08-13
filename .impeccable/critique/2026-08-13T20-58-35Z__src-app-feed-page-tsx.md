---
target: Feed page (/feed)
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-13T20-58-35Z
slug: src-app-feed-page-tsx
---
Method: dual-agent (A: ab4d197d6d96b16de · B: a4a6388e77f88241d)

⚠️ **Tooling note (not a design finding):** both sub-agents independently reported unexplained state appearing mid-session in their supposedly-fresh browser tabs (a search query and active filters neither of them had entered). This points to some cross-talk between the two parallel browser-automation sessions in this environment, not a bug in the feed page itself. Both agents caught it, cleared state, and re-verified their own findings on a clean tab before reporting — the findings below are what survived that re-check, but it's disclosed here in the interest of not silently trusting first-pass browser evidence.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | The only result count ("Showing N articles") renders *after* the full list — no live count sits next to the filter controls where the decision is made |
| 2 | Match System / Real World | 2 | Source tag sometimes shows the Google-Alert ingestion query ("Art Market & Crime Fraud") instead of the actual publication — wrong information exactly where sourcing credibility matters most |
| 3 | User Control and Freedom | 2 | Filter/search/sort state lives only in local `useState` — refresh, back-button, or a shared link all silently discard the view a user built |
| 4 | Consistency and Standards | 3 | Filter-pill colors match row-tag colors 1:1; one inconsistency — two visually different "Clear filters" controls for the same action |
| 5 | Error Prevention | 3 | Nothing destructive on this surface; the one real edge case (zero results) is handled gracefully |
| 6 | Recognition Rather Than Recall | 4 | All filter options always visible, nothing hidden behind menus or codes |
| 7 | Flexibility and Efficiency | 1 | No URL-shareable filtered views, no keyboard shortcuts, no relevance sort, unpaginated list back to 2020 with no date-jump |
| 8 | Aesthetic and Minimalist Design | 4 | Clean, restrained, text-link filters keep the control cluster from competing with the list |
| 9 | Error Recovery | 3 | The no-matches state uses plain language and an actionable one-click reset |
| 10 | Help and Documentation | 1 | Crime-type filters OR within a category but AND across categories — confirmed live — and this is explained nowhere on the page |
| **Total** | | **25/40** | **Acceptable (63%)** |

## Design Specificity Verdict

**LLM assessment (Assessment A):** Mostly grounded. The filter treatment is the clearest evidence of real product thinking — crime-type and article-type filters render as underlined italic-serif text links, not generic chip buttons, exactly matching DESIGN.md's documented "controls as part of the editorial voice" rule, and the color-coding matches each row's own tags 1:1. Crime-type vocabulary (Fraud & Forgery, Terror Financing, Sanctions) is real domain taxonomy, not invented UX-speak.

Where it slips into generic territory: the search box + sort dropdown pattern is a stock listing-page control with no signal of this product's actual differentiator. Nothing on the page communicates "these results were filtered through relevance-scoring and classification" — the entire value proposition per PRODUCT.md. A stock news aggregator could ship an identical control cluster.

**Deterministic scan (Assessment B):** CLI source scan came back clean (0 findings) across all three files. The live-DOM browser scan found 2 findings, both `line-length` (~203 chars/line on two `<p>` elements at the tested viewport) — flagged by Assessment B itself as a prose-readability heuristic rather than a structural defect, worth a lower-confidence read. No new console errors or React warnings appeared after live search/filter interaction — the filtering logic itself doesn't throw or misbehave at runtime.

**Where both assessments converge:** neither found anything alarming in the mechanics — the page works. The real issues both surfaced are about *missing signal*, not *broken code*: no visible cue that results are classified/trustworthy, no explanation of how filters combine, no persisted state. This is a "solid engineering, under-communicated trust and control" pattern, not a "buggy" one.

## Overall Impression

The feed does its one job — list, search, filter — competently and without drama, and the editorial-text-link filter styling is a genuine, correct expression of this product's voice. But it under-delivers on what PRODUCT.md actually promises: the filters documented there (crime type, region, entity type, date, search) are only half-shipped (crime type and search exist; region, entity type, and date don't), and the filter combination logic that does exist (OR within a category, AND across categories) is invisible and was flagged as confusing by live testing. The single biggest opportunity is closing the gap between what the product claims to offer a compliance/journalist user and what the feed page actually lets them do — right now the page is tuned for a general-public skim-read more than for the precision search PRODUCT.md's core audiences need.

## What's Working

1. **Filters-as-editorial-text-links.** Underlined italic-serif links instead of boxed chips keep the controls visually part of the page's voice, and the color-coding matches each row's own tags exactly — controls and content read as one language, verified live.
2. **Honest, local bookmark affordance.** The bookmark button's tooltip ("Saved on this device — click to remove") correctly sets expectations rather than implying account-level sync.
3. **Graceful empty state.** A nonsense query plus multiple filters resolves to a clear, jargon-free "No articles found" with a one-click reset — verified live, no dead end.

## Priority Issues

**[P1] Filter/search/sort state isn't persisted to the URL** — refresh, back-button, or a shared link all silently discard a built view. For the "searchable archive" PRODUCT.md promises compliance/journalist users, an unshareable filtered view is a real gap. *Fix:* lift state into the URL query string (`useSearchParams`/`router.replace`). → `/impeccable harden`

**[P1] Filters documented in PRODUCT.md are only half-shipped** — PRODUCT.md explicitly lists "crime type, region, entity type, date, search" as the feed's filters; the live page has crime type, article type, search, and a 2-option sort only. No region, no entity type, no date range. This specifically shortchanges the compliance/AML persona who most needs to bound results by jurisdiction or entity. *Fix:* either implement the documented filters or update PRODUCT.md to match current scope — right now the doc overpromises what's actually there. → `/impeccable harden` (or a product-scope conversation first)

**[P2] Source label sometimes shows the ingestion query, not the publisher** — `formatTag()` strips a "GA - " prefix but the underlying value can still be the Google Alert search term ("Art Market & Crime Fraud") rather than the true outlet. In a sourcing-discipline product, this is exactly the field a reader checks for credibility. *Fix:* fall back to a parsed publication/domain name whenever available, only showing the raw alert label as a last resort. → `/impeccable clarify`

**[P2] A filtered row doesn't visibly show why it matched** — `ArticleRow` only ever displays `crime_types[0]`, while filtering matches against the full array. Live-confirmed: filtering by "Sanctions" surfaced a row whose only visible tag was "Money Laundering" — reads as a filtering bug even though the logic is correct. *Fix:* show all matching crime-type tags on a row, or at minimum surface the one that caused the current filter match. → `/impeccable clarify`

**[P3] Filter toggle buttons expose no active state to assistive technology** — active/inactive state is a pure Tailwind class swap (`decoration-transparent` ↔ `decoration-indigo`) with no `aria-pressed`. A screen reader announces "Sanctions, button" identically whether selected or not. *Fix:* add `aria-pressed={selected}` to both filter button groups. → `/impeccable adapt`

## Persona Red Flags

**Alex (Impatient Power User):** can't bookmark a recurring filter combo (no URL state) and has to manually rebuild it every visit; no keyboard shortcuts; sort tops out at newest/oldest with no relevance ranking on a keyword search; the list is unpaginated back to 2020 with no jump-to-date.

**Sam (Accessibility-Dependent User):** filter buttons give no non-visual signal of active state (no `aria-pressed`); keyboard tab order is correct and logical, and focus is visible, but the focus ring on filter buttons is a plain browser default rather than the bolder custom ring the search box and sort dropdown get — inconsistent affordance strength across the same control cluster.

**Riley (Deliberate Stress Tester):** combining two crime-type filters broadens results instead of narrowing them (OR within category), which reads as unexpected behavior with nothing on the page explaining the logic. Rapid toggling and combined search+filter+garbage-query all resolved cleanly to "No articles found" with zero console errors — nothing actually breaks, but the undocumented combination logic is exactly what a deliberate tester flags as a trust problem.

**Priya (project-specific — compliance/AML analyst doing a daily read-through, per PRODUCT.md):** can't filter by region or entity type despite PRODUCT.md promising both, so she can't isolate "UK sanctions" or "auction-house entities" without reading every row. When she finds something relevant, the source tag may show the search term instead of the outlet, forcing a click-through just to verify citability. No date-range filter means her daily read-through means re-scanning from the top every time rather than picking up where she left off yesterday.

## Minor Observations

- `Navigation`/`Footer` aren't provided by a shared root layout — `feed-content.tsx` imports and renders both itself. Works correctly today, but it's a consistency risk: every new page has to remember to include chrome rather than inheriting it once.
- Two visually distinct "Clear filters" controls exist for the same action — pick one treatment.
- Search only matches `title` and `source_name` — a free-text search for a crime-type term won't match unless that word happens to be in the headline, which may surprise users expecting full-text or tag search.
- No ochre-as-text regression found — article-type tags correctly use the `ochre-on-light` token, not the base `ochre`, in both files checked.

**Tooling note:** narrower-than-desktop viewport could not be verified live in this environment (the same `resize_window` floor from prior sessions reproduced here) — responsive claims below ~700px CSS width are code-level inference, not pixel-verified.

## Questions to Consider

- If the feed's core promise is "signal over noise" via classification, why does the filter UI hide that machinery entirely — would surfacing even one classification signal do more for trust than any visual polish could?
- Is `/feed` currently tuned for a general-public/journalist skim-read at the compliance persona's expense, and was that a deliberate tradeoff or a gap nobody decided on?
- Is OR-within-category/AND-across-category the intended filter model, or just what fell out of two independent `Set` filters — and either way, should a repeat-use compliance tool ship combination logic that's never explained on the page?
