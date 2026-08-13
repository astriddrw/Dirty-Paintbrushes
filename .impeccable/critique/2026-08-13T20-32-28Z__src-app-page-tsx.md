---
target: Homepage (/)
total_score: 27
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-13T20-32-28Z
slug: src-app-page-tsx
---
Method: dual-agent (A: a97c32024334c9a39 · B: adca8b8892d59b7cf)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Bookmark toggle gives clear visual feedback, but nothing tells the user it's `localStorage`-only and won't survive a device switch or cleared cache |
| 2 | Match System / Real World | 4 | Real compliance/journalism taxonomy (Money Laundering, Sanctions, Ruling) and real cited sources (occrp.org, justice.gov) throughout |
| 3 | User Control and Freedom | 3 | External links correctly open in a new tab; no "back to top" after a long scroll, minimal mobile-menu escape affordance |
| 4 | Consistency and Standards | 4 | `ArticleRow` is the literal component shared with `/feed` — the homepage's promise is verifiably true, not a mockup |
| 5 | Error Prevention | 3 | `rel="noopener noreferrer"` correctly set on all external links; no forms on this surface to validate |
| 6 | Recognition Rather Than Recall | 3 | Tags/source/date visible inline on every row; the bottom CTA section repeats hero copy verbatim instead of adding new recognition cues |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode teaser page — no power-user/repeat-operation surface exists here (that's `/feed`'s job) |
| 8 | Aesthetic and Minimalist Design | 4 | The flat/square/hairline system renders exactly as DESIGN.md promises — no shadow leakage, no stray radius, confirmed live |
| 9 | Error Recovery | 3 | No error states exercised in normal browsing, but a failed/empty Supabase query silently drops the entire "Latest Intelligence" section with no fallback copy |
| 10 | Help and Documentation | n/a | No inline help affordances anywhere — appropriate to skip, not penalize, at marketing altitude |
| **Total** | | **27/32** | **Good (84%)** |

## Design Specificity Verdict

**LLM assessment (Assessment A):** Mostly grounded, with one real generic patch. The hero is unmistakably this product — ink-indigo full-bleed field, italic Instrument Serif wordmark, and copy ("Curated intelligence and news tracking art market financial crime") that couldn't be dropped into an unrelated SaaS page without a rewrite. The "Latest Intelligence" section is genuinely live: real Supabase-sourced articles with real crime-type tags and real cited sources (justice.gov, occrp.org, whitecase.com) — no placeholder content anywhere, which directly honors PRODUCT.md's sourcing-discipline constraint.

The patch: the bottom "Navigation to Other Pages" two-card section is boilerplate filler. Its copy is a **verbatim duplicate** of the hero subheading, and "Trusted publications, regulatory bodies, and investigative outlets" is generic enough to describe any news-aggregation product — a cybersecurity-intel site, a policy tracker, anything. It earns more vertical padding (`py-24 lg:py-32`) than the hero itself for the sake of a second CTA moment that adds nothing new.

**Deterministic scan (Assessment B):** CLI source scan on the five composing files came back clean (0 findings). The live-DOM browser scan (which evaluates actual computed styles and rendered box structure, not just source classes) found **9 findings**: 2× `gray-on-color`, 2× `line-length`, 5× `nested-cards`. The CLI/browser gap is expected — the browser pass catches things static class-reading can't, like resolved contrast values and actual DOM nesting shape.

**Where the two assessments converge:** Both independently flagged the same weak section. Assessment A calls out the bottom two-card block as content-redundant filler; Assessment B's `gray-on-color` hits land on those exact two paragraphs (`text-sm text-center text-muted-foreground`, one per card). Two different methods, same conclusion: this section is the page's weakest real estate.

**Likely false positive, flagged not dropped:** All 5 `nested-cards` hits point to the same selector — `ArticleRow`'s bordered list-row div (`border-b`, `rounded-sm`, hover fill). There is no actual `<Card>` component anywhere in this composition (confirmed by grep). DESIGN.md is explicit that this is a *"divided rows, not a grid of tiles"* system by deliberate choice — the detector's box-shape heuristic is reading a bordered-and-slightly-rounded list row as a nested card, which is a rule/product mismatch here rather than a real defect. Worth a second look only if the rule is *systematically* over-firing on this pattern elsewhere in the app.

The second `line-length` hit (~128 chars/line, plain `<p>`) wasn't fully pinned to a specific line by Assessment B beyond `p.mb-4`; the first is confirmed as the footer disclaimer paragraph (`footer.tsx:40-42`), a common, lower-stakes place for wide small-print legal text.

**Visual overlays:** Assessment B's injected browser detector ran successfully in a live tab (script injection confirmed, live server on port 8400, findings read from console) and was stopped cleanly afterward — no overlay tab was left open for you to inspect after the fact, since the live server and injected script were torn down at the end of the run per the critique protocol. The 9 findings above are the full transcript of what it reported.

## Overall Impression

The homepage's top half is genuinely strong — restrained, editorial, and honest (the article list you see is the literal feed, not a mockup). The bottom half undoes some of that work: three separate elements (the "View all →" link, the "Look for more" button, and the two-card CTA section) all route to the same one or two destinations with progressively less new information each time, ending on a note that's word-for-word what the visitor already read at the top. The single biggest opportunity is reclaiming that real estate — either cut it, or use it to do something the hero didn't: state the sourcing/credibility promise explicitly, since right now that promise is only ever *implied* by the real source names in the list, never *said*, and it's said latest and smallest (12px footer disclaimer) exactly where a first-time compliance or journalist visitor would want it stated loudest.

## What's Working

1. **The hero's text-link CTAs, not buttons.** Underline-only links (`HomeHero.tsx`) read as "publication," not "app" — exactly right for an audience of compliance officers and journalists who trust a masthead-style link more than a SaaS button. A deliberate, well-executed choice.
2. **`ArticleRow` reused verbatim between the homepage and `/feed`.** The homepage doesn't fake a preview — it *is* the feed, filtered to five items. That's a rare case of a marketing surface being structurally honest about the product underneath it, and it's exactly the kind of design-specificity a generic template couldn't produce.
3. **Zero placeholder content on the highest-traffic page.** Five real, classified, sourced articles greet every visitor. This does more for the "signal over noise" credibility PRODUCT.md calls for than any trust-badge copy could.

## Priority Issues

**[P1] Redundant CTA stacking dilutes the page's persuasive arc, and duplicates its own copy**
- **Why it matters:** Four separate elements (hero link, "View all →", "Look for more" button, "Browse Feed" card) all point to `/feed`, and the bottom card's description is a verbatim repeat of the hero subheading. The page's last, most memorable beat (peak-end rule) is spent restating information the visitor read 15 seconds earlier — a flat close instead of a strong one. Riley (the stress-tester persona) will read this as sloppy component reuse, which damages perceived engineering quality on a product whose entire pitch is credibility.
- **Fix:** Cut the "Navigation to Other Pages" two-card section entirely — the footer already links Feed and Sources. Replace it with something additive (a sources-tracked stat, an `/about` credibility pull-quote) or simply end on "Look for more."
- **Suggested command:** `/impeccable distill`

**[P1] No explicit trust/credibility signal above the fold**
- **Why it matters:** For a financial-crime intelligence product, "can I trust this enough to cite or act on" is the first real question a compliance officer or journalist asks — and the homepage only ever answers it *implicitly* (real source names appear per row), never states it. The one place that states it outright — the footer disclaimer — sits in 12px gray text below two full CTA sections, a spot most visitors won't reach.
- **Fix:** Add one explicit credibility line near the hero or "Latest Intelligence" heading — e.g. "Every article is filtered and classified before publication — see our sources," linking to `/sources` or `/about`.
- **Suggested command:** `/impeccable clarify`

**[P2] Silent empty state if the article query returns nothing**
- **Why it matters:** `page.tsx`'s `articles.length > 0` guard means an ingestion outage or empty result set makes the entire "Latest Intelligence" section vanish with zero explanation — a first-time visitor sees hero → nav cards → footer and no indication anything is missing.
- **Fix:** Add minimal fallback copy inside the conditional ("New intelligence is added daily — check back soon").
- **Suggested command:** `/impeccable harden`

**[P2] Five-item list edges past the 4-item chunking guideline inside an already CTA-dense lower half**
- **Why it matters:** Not severe alone, but it compounds the redundant-CTA problem above — three consecutive "please click something" zones (article list, "Look for more," nav cards) ask for attention in quick succession.
- **Fix:** Drop to 4 articles, or make the 5th visually distinct ("and 3 more this week") rather than an identical row.
- **Suggested command:** `/impeccable layout`

**[P3] Bookmark action gives no durability signal**
- **Why it matters:** Bookmarking is `localStorage`-only with no indication it won't survive a cleared cache or a different device — low stakes on the homepage specifically, but worth fixing at the component level since `ArticleRow` is shared with `/feed`, where users are more likely to actually rely on it.
- **Fix:** A small tooltip or one-time toast on first bookmark: "Saved on this device."
- **Suggested command:** `/impeccable clarify`

## Persona Red Flags

**Jordan (Confused First-Timer):** Reads the hero subheading, then hits the *identical sentence again* 15 seconds later in the "Browse Feed" card — may reasonably wonder if the page glitched or they scrolled back up by mistake. Never learns *why* the feed is trustworthy before being asked to click through a fourth time.

**Riley (Deliberate Stress Tester):** Immediately catalogs 4 separate links all pointing to `/feed` as either a content bug or lazy reuse — either read damages trust in engineering quality on a product whose credibility *is* the product. Also notes the bookmark icon offers no persistence guarantee before trusting it with a real research workflow.

**Casey (Distracted Mobile User):** The "Browse Feed / Sources" cards use a fixed `grid-cols-2` with no responsive collapse to one column (`page.tsx` line 66) — a code-level red flag for cramped card text at true phone widths, not fully verified live due to a browser-tooling resize limitation this session (see note below), but visible directly in the class list. Also hits three separate "go to Feed" moments within one thumb-scroll.

**Compliance Officer (project-specific persona — skimming for credibility signals before treating this as a monitoring source):** The sourcing-discipline promise from PRODUCT.md is *evidenced* (real source domains per row) but never *stated* anywhere above the footer. Also immediately wants to filter/click through by crime type from the homepage teaser and can't — a reasonable homepage limitation, but this persona will feel the gap right away.

## Minor Observations

- Footer disclaimer text references *comments* — a feature not present anywhere on the homepage itself, mildly confusing boilerplate carried over from a page that does have a comment surface.
- Mobile hamburger menu correctly applies the same active-route underline styling as desktop nav ("Home" bolded/underlined) — a nice consistency touch, confirmed live.
- `ArticleRow`'s bookmark/external-link buttons render at `p-3.5`, comfortably clearing the 44px tap-target minimum — good, confirmed adherence to DESIGN.md's own Do's list.
- The "Look for more" button correctly uses the documented "Label/Nav variant" (`bg-indigo`, uppercase Noto Sans) rather than a standard primary button — matches DESIGN.md's button taxonomy exactly.

**Tooling note:** Both sub-agents attempted a true 390×844 mobile viewport via `resize_window` and hit an apparent floor in this environment (effective widths landed between ~614–800px rather than 390px, across fresh tabs and repeated attempts). The `md` (768px) breakpoint was still crossed, so hamburger-nav behavior was verified live, but true phone-width text wrapping and the `grid-cols-2` card-cramping question above are code-level inferences, not confirmed pixel-for-pixel at 390px.

## Questions to Consider

- If the article list and the two-card CTA section both exist mainly to route people to `/feed` and `/sources`, what does the homepage look like with exactly *one* persuasive path to each — freeing the reclaimed space for something no other page offers, like a live "sources tracked" count?
- PRODUCT.md names four equally-weighted audiences, but the homepage's only differentiation lever is two tag colors. Is there room for a visitor to self-identify (compliance / press / dealer / reader) here, or should that stay entirely `/feed`'s job, keeping the homepage a pure teaser?
- The founder's real, credentialed background lives entirely on `/about`. Would surfacing one trust anchor from that bio near the hero — not the full bio, just a line — shorten the "is this legitimate" evaluation Jordan and the compliance-officer persona currently have to do by inference alone?
