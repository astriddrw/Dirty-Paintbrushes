---
target: Article detail page (/articles/[id])
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-13T22-41-22Z
slug: src-app-articles-id-page-tsx
---
Method: dual-agent (A: adbdcb02e79cf6647 · B: a251bfab651547529)

⚠️ **Tooling note (not a design finding):** the design-review sub-agent tested the comment form live and its test comment ("Test Reviewer") landed in the real production database. I found and deleted it before writing this report — it never should have been visible to a real visitor and isn't reflected in anything below.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | "Posting…"/"Posted." feedback exists but is whisper-quiet; no character-count on capped fields |
| 2 | Match System / Real World | 3 | Copy is audience-appropriate; "Tier 5" is exposed with zero explanation |
| 3 | User Control and Freedom | 2 | No edit/delete on a posted comment, no undo |
| 4 | Consistency and Standards | 2 | Off-palette tier badge colors (raw Tailwind defaults); comment section doesn't share the page's visual language |
| 5 | Error Prevention | 2 | Required-field checks work, but the 30s comment cooldown is client-state only — a refresh or new tab bypasses it entirely |
| 6 | Recognition Rather Than Recall | 4 | Single page, all actions visible, nothing to remember |
| 7 | Flexibility and Efficiency | 3 | Nothing power-user-specific, but nothing the page's job requires is missing |
| 8 | Aesthetic and Minimalist Design | 3 | Top two-thirds excellent; comment section and tier badges break the established restraint |
| 9 | Error Recovery | 4 | Cooldown/insert-failure messages are plain, specific, correctly colored |
| 10 | Help and Documentation | 2 | No link from the article to sourcing/tier methodology or comment moderation policy |
| **Total** | | **28/40** | **Good (70%)** |

## Design Specificity Verdict

**LLM assessment (Assessment A), addressing the "AI slop" reaction directly:** The top two-thirds of the page — non-italic serif title following DESIGN.md's "reported not said" rule, the `border-l-2` editor's-note pull-quote, the restrained one-primary/one-secondary action row — is genuinely bespoke, not template filler. Three concrete things produce the generic feeling, in order of confidence:

1. **The comment section's chrome.** A `MessageSquare` icon + "Discussion (n)" header + bordered name/timestamp/body cards + a plain "Post comment" button is indistinguishable from a default forum widget in any SaaS app — no other section on this page uses an icon label, and nothing here nods to the serif/hairline/parchment vocabulary the rest of the page commits to. This is almost certainly the specific thing that read as "AI slop."
2. **A dangling-ellipsis summary.** The rendered summary trails off mid-sentence ("*See what art market participants must ...*") — traced to `extractSummary()` in `feed-parsing.ts`, whose regex treats a source CMS's trailing "…" as a sentence terminator and stores it verbatim. A clean Haiku-generated summary already exists in the classification response but is discarded — `api/ingest/route.ts` never reads it. An unfinished sentence directly under the headline is a very literal "feels unedited" signal, on the one page meant to demonstrate the opposite.
3. **Off-palette badge colors.** `tierBadge()` hard-codes raw Tailwind `blue-100/700` and `purple-100/700` — colors absent from DESIGN.md's 14-color palette entirely, a concrete instance of default component-kit styling leaking into a system that otherwise polices color carefully.

**Explicitly not the problem:** the crime-type/article-type tags sharing one indigo pill is *correct per DESIGN.md's "one unified pill style ... never a rainbow" rule*, verified in `src/lib/data.ts` — disciplined restraint, not genericness.

**Deterministic scan:** CLI clean (0/3 files). Live-DOM scan found 3 findings: 1 `gray-on-color` (the comment-section disclaimer, `#5c5c5c` on `#ffedbb`) and 2 `line-length` — both computed against real rendered pixels, not false positives, just a different engine than the CLI.

**Where both converge:** Assessment B's `gray-on-color` hit lands squarely on the comment-section disclaimer — the exact line meant to warn readers "this isn't verified intelligence" is the lowest-contrast text on the page. Two methods, same under-weighted disclaimer.

**Live-verified:** 0 existing comments on this article; the cooldown genuinely works client-side (posted once, immediately retried, got "Please wait 17s" in Alert Red) but is trivially bypassed by a refresh or new tab, since it's React state, not a server-side rate limit.

## Overall Impression

The page mostly delivers "someone took care with this" in its first two-thirds, then chips away at that exact quality at three specific points, in sequence: the summary trails into an unfinished sentence right after the headline, an unexplained "Tier 5" badge leaks internal taxonomy onto a public-trust surface, and the register drops hard into generic forum chrome for Discussion right when a reader would otherwise be deciding whether to trust and act on what they just read. None of it is catastrophic alone; stacked in reading order, it's exactly the drift the founder's eye caught.

## What's Working

1. **Editor's-note pull-quote** — a genuinely bespoke editorial device, not an abstract illustration of DESIGN.md's hairline-depth ambition.
2. **Title typography** — non-italic serif, correctly following the "reported not said" rule, constrained for reading comfort. A considered choice, not a default.
3. **Restrained action row** — one solid primary, one bordered secondary, no icon soup, no competing CTAs.

## Priority Issues

**[P0] Comment section: keep it, but it needs real intervention — not removal.** Comments align with a real, named audience need (PRODUCT.md's "flag connections" is exactly compliance/journalist cross-referencing behavior), and cutting the feature loses a differentiator without fixing the actual problem. But as shipped it does two things that damage the product: its forum-widget chrome is the single largest concentration of off-brand visual language on the page, and it publishes instantly with **zero review** while every *article* on this same product goes through a mandatory human queue first — a direct contradiction of the "sourcing discipline is a hard constraint" principle. PRODUCT.md already flags comment moderation as undecided; this page is the evidence that decision can't stay open much longer. *Fix:* restyle to the page's own hairline/border/serif vocabulary (the "Entities involved" block is a better template than any generic comment-widget pattern), add at least a lightweight moderation gate, and give the disclaimer real visual weight instead of a whisper. → `/impeccable clarify` + a moderation-policy decision

**[P1] Off-palette badge colors** — `tierBadge()` hard-codes raw Tailwind defaults absent from DESIGN.md entirely. *Fix:* replace with palette tokens, consistent with the unified-pill treatment already applied elsewhere. → `/impeccable colorize`

**[P1] Dangling-ellipsis summaries** — raw scraped RSS snippets stored verbatim including trailing "…", while a clean Haiku-generated summary is silently discarded. *Fix:* persist and render the Haiku summary, or at minimum strip trailing ellipses/incomplete sentences before storage. → `/impeccable harden`

**[P2] Comment section chrome undifferentiated from a generic template** (distinct from the moderation question in P0) — icon + bordered cards + standard button share no typographic voice with the rest of the page. → `/impeccable typeset` or folded into the P0 fix

**[P3] No live character-limit feedback** — `maxLength` fields silently truncate with no counter, despite placeholder copy explicitly inviting substantive analysis. → `/impeccable clarify`

## Persona Red Flags

**Jordan (Confused First-Timer):** "Tier 5" has no legend anywhere on the page; the ellipsis-truncated summary reads as a broken page at the worst possible moment; nothing visually demarcates "sourced article" from "reader-submitted comment" beyond one small caption sentence.

**Riley (Deliberate Stress Tester):** empty/whitespace submission correctly blocked; long text silently truncated with no feedback; the cooldown is real but trivially bypassed by a refresh or new tab — Riley would find that in under 10 seconds, and there's no server-side rate limit behind the direct client-to-Supabase insert.

**Priya** (compliance/AML professional deciding whether to save this article to a case file, project-specific): the truncated summary means she can't get a clean synopsis without leaving the page — undermines the "structured, searchable record" pitch exactly when she'd rely on it most; no visible "date added to Dirty Paintbrushes" separate from the source's publish date for an audit trail; bookmark has no way to attach a note despite case files being the product's stated durable-memory layer; an unmoderated, unverified comment thread sits directly beneath sourced journalism on a product whose entire premise is sourcing discipline.

## Minor Observations

- Comment timestamp format (`13 Aug 2026, 23:33`) differs stylistically from the article's own date format (`12 August 2026`) — both `en-GB`, visually inconsistent.
- When `entity_types` is empty (true for ~97% of published articles), three closely-stacked hairline dividers in a row (actions → non-rendering entities → comments) can read slightly repetitive.
- Disabled "Post comment" button (30%-opacity ink on parchment) is correct per DESIGN.md's disabled-state spec, not a flaw.

**Tooling note:** narrower-than-desktop viewport again couldn't be pixel-verified live (same `resize_window` floor as prior critiques) — mobile-specific claims are code-level inference.

## Questions to Consider

- Every *article* goes through mandatory human review before publishing; comments currently don't. If sourcing discipline is genuinely non-negotiable, does that double standard survive contact with the product's own stated principle?
- The Haiku pass already produces a clean summary that's silently discarded in favor of a truncated raw scrape — was that deliberate (never let an LLM paraphrase a claim), or is a mid-sentence fragment actually a *worse* trust signal than a reviewed summary would be?
- Comments have no path to becoming useful downstream — no promotion into an editor's note, no flag-as-relevant, no link into case files. If nobody plans to actively moderate Discussion regularly, is it there because it serves a named audience, or because "articles have comments" is an inherited default? What would comments "earning their keep" look like concretely here?
