---
target: Sources page (/sources)
total_score: 18
max_score: 32
na_heuristics: 5,9
p0_count: 1
p1_count: 2
timestamp: 2026-08-13T21-59-10Z
slug: src-app-sources-page-tsx
---
Method: dual-agent (A: a4153ea984880491c · B: a464d28bff449877d)

⚠️ **Tooling note (not a design finding):** the same cross-tab contamination pattern from the last two critiques recurred — both sub-agents saw tabs with state neither created. Both caught it, worked only in their own freshly-created tab, and disclosed it rather than silently trusting first-pass evidence. Findings below are post-verification.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No count or freshness indicator ("23 active sources, last synced...") despite the product logging ingestion runs elsewhere |
| 2 | Match System / Real World | 3 | Plain-English tier labels read naturally; docked because Google Alerts rows are typeset identically to named outlets |
| 3 | User Control and Freedom | 3 | Read-only directory, no traps; external links correctly use `rel="noopener noreferrer"` |
| 4 | Consistency and Standards | 2 | Full-page background breaks the system's own parchment rule; row hover doesn't use the documented editorial-hover convention |
| 5 | Error Prevention | n/a | No inputs or destructive actions exist on a read-only directory |
| 6 | Recognition Rather Than Recall | 3 | Tier grouping helps; no on-page index shows scope before committing to scroll |
| 7 | Flexibility and Efficiency | 1 | No search, filter, or jump-to-tier across 31 sources in 5 groups — `/feed` has real filters, this page has none |
| 8 | Aesthetic and Minimalist Design | 2 | Clean per-row, but the page-level background break and five repeated header blocks (one for a 2-item group) read heavier than the content needs |
| 9 | Error Recovery | n/a | No error states observed on a static, read-only directory |
| 10 | Help and Documentation | 2 | Tier descriptions self-document lightly; nothing explains vetting/methodology on the one page a citation-minded visitor opens looking for exactly that |
| **Total** | | **18/32** | **Acceptable (56%)** |

## Design Specificity Verdict

**LLM assessment (Assessment A):** Split verdict. The *content* is genuinely specific — real, named niche institutions (ARCA, Antiquities Coalition, Center for Art Law, Basel Institute) inside a bespoke five-tier editorial taxonomy no generic template would ship with. That's real curation. But the *execution* actively undercuts it: the page wraps its entire body in Archive Blue (`bg-light-blue`, `#CFE6F0`) instead of the Aged Paper parchment DESIGN.md calls "the background on every page" — confirmed no other page uses `bg-light-blue` as a full-page field, only as a section-band accent. And every source link resolves to raw RSS/XML (`artcrimeresearch.org/feed/`) rather than the institution's actual site — the generic "here's the feed we ingest from" default, not a considered verification experience.

**Deterministic scan (Assessment B):** CLI clean (0 findings). Live-DOM scan found 7 findings: 2 `line-length`, and 5 `heading-rhythm` hits that are one structural pattern manifesting five times (each flagged heading is the *last* source in its tier group, immediately before the next tier's `<h2>` — a spacing artifact of the group-boundary layout, not five independent defects).

**Where both converge:** Assessment A's "five repeated header blocks" aesthetic note and Assessment B's five `heading-rhythm` hits are the same underlying pattern seen through two different methods — the tier-group boundary spacing is measurably inconsistent, not just subjectively "heavier than needed."

**Confirmed scale:** 31 total source links across 5 tiers (Investigative & Research: 2, Art Industry: 4, News & Investigations: 9, Google Alerts: 10, Legal & Regulatory: 6) — Google Alerts is the single largest tier at 32% of all rows, for what PRODUCT.md itself calls the least-curated tier.

## Overall Impression

This page's entire job is building trust in the product's rigor, and it mostly succeeds on a skim — recognizable institutions in a considered taxonomy — then loses ground exactly when its target audience (compliance officers, journalists) does what they're built to do: verify. Clicking through lands on raw XML, not the institution's site. The automated Google Alerts tier — 10 of 31 rows — is typeset identically to hand-picked outlets and sits *above* the Legal & Regulatory tier in display order, meaning a top-to-bottom reader meets the least-vetted tier before the most authoritative one. And the page's own background breaks the system's central rule (parchment everywhere) for no stated reason. None of this is dramatic alone, but it's the one page where under-disclosure and inconsistency cost the most.

## What's Working

1. **Real, checkable institution roster.** Every href resolves to a genuine domain — nothing fabricated, directly honoring PRODUCT.md's sourcing-discipline principle.
2. **Genuinely solid keyboard accessibility.** Verified by tabbing through: every row gets a clear focus outline, accessible names resolve correctly even though each row wraps an icon + heading rather than plain link text.
3. **`formatTag()`'s Google-Alert-prefix cleanup.** Turning `"GA - Painting + Heist"` into `"Painting & Heist"` is a small, genuine craft touch — not leaking internal DB conventions onto a public page.

## Priority Issues

**[P0] External links resolve to raw RSS/XML, not the source's actual site** — every row's `<a href={source.feed_url}>` opens a machine feed (confirmed for ARCA, Antiquities Coalition) instead of the institution's homepage. This is the one page whose entire purpose is letting a skeptical visitor verify provenance, and the verification path delivers unstyled XML instead of the site itself. *Fix:* link to the source's homepage/canonical URL if available (a `site_url` field), or change the affordance so it doesn't read as "visit this source." → `/impeccable clarify`

**[P1] Google Alerts rows are visually indistinguishable from hand-picked institutions** — tier5 rows (`Painting & Heist`, `Art Dealer`) render with identical styling to `BBC News` or `ICIJ`, disambiguated only by a group label read once per 10-item block. Given sourcing discipline is a hard constraint, this under-discloses on the page built to demonstrate rigor. *Fix:* a small per-row marker (a muted "search alert" tag) rather than relying solely on the section header. → `/impeccable clarify`

**[P1] Full-page background uses Archive Blue instead of the parchment field** — `bg-light-blue` on the page wrapper, confirmed as the only page in the app using it as a full-page background rather than a section-band accent, contradicting DESIGN.md's own stated rule. *Fix:* swap to the standard parchment background, or document the exception in DESIGN.md if it's a deliberate register shift. → `/impeccable document` (to resolve) or a direct fix

**[P2] Tier display order buries Legal & Regulatory beneath Google Alerts** — `tierOrder` places the automated, least-vetted tier ahead of the most institutionally authoritative one. For a trust-building page read top-to-bottom, this works against the page's own credibility goal. *Fix:* reorder to `tier1, tier2, tier3, tier4, tier5`. → `/impeccable layout`

**[P3] No count, freshness signal, or jump navigation for 31 items across 5 groups** — no "N active sources" line, no anchor/jump links. Compounds P1/P2: a citation-minded visitor has to manually count and cross-check by hand. *Fix:* a summary line under the intro paragraph, possibly a lightweight tier index. → `/impeccable clarify`

## Persona Red Flags

**Sam (Accessibility-Dependent User):** mostly clean — focus order and accessible names verified correct — but `target="_blank"` links carry no indication (visible or screen-reader-only) that they open a new tab to raw XML rather than a webpage; a screen reader user gets only the link name, then lands somewhere structurally hostile to assistive tech with no warning.

**Riley (Deliberate Stress Tester, verifying sources are real):** runs straight into the P0 issue — clicking ARCA doesn't open its homepage, it opens a wall of XML, replacing the intended "yes, this checks out" moment with "wait, is this broken?" friction. Also clocks `Art Market & UBO` sitting in the same visual register as `The Guardian` and, on inspecting the tier label, concludes a meaningful chunk of the "source" list is search queries, not outlets — exactly the kind of thing Riley flags as inflating the source count.

**Priya** (investigative journalist deciding whether to cite Dirty Paintbrushes as a source, project-specific persona per PRODUCT.md): opens `/sources` to write a methodology line. Reassured by ICIJ, OCCRP, Bellingcat, FATF appearing by name — then clicking through lands on a raw feed URL that doesn't read as "curated." Notices `Painting & Heist` and has to reread the tiny tier label to realize it's a search-term construction. Can't cite "N sources" without a caveat she has to derive herself, and can't find a total count or "as of [date]" line for a footnote — she'd have to count rows by hand.

## Minor Observations

- `TIER_DESCRIPTIONS` mixes singular/plural phrasing across entries ("Core investigative and regulatory source" vs. "Automated search alerts") — small copy inconsistency worth normalizing.
- The `ExternalLink` icon has its own independent hover alongside the row's `group-hover`, redundant since the whole row is already the click target — harmless but inconsistent code pattern.
- The 44px tap-target rule isn't actually violated here despite small icons — the entire row is the anchor, so the effective target is large. Noted so it isn't mistakenly flagged later.
- The quiet `/admin` entry point sits directly beneath the credibility-building source list rather than only in the footer — low visual weight, but an odd juxtaposition on the specific page most likely to be closely read by this audience.

**Tooling note:** narrower-than-desktop viewport could not be verified live in this environment (the same `resize_window` floor from prior critiques reproduced here) — responsive claims below ~700-1000px CSS width are code-level inference from the Tailwind classes, not pixel-verified.

## Questions to Consider

- Was reusing `feed_url` as the click-through target a deliberate "this is literally what we ingest" transparency choice, or just the field that was already on hand?
- Given sourcing discipline is a stated Product Principle, shouldn't `/sources` apply the *strictest* disclosure standard in the product — should Google Alerts rows carry a per-item marker rather than a once-per-section label a fast scanner can miss?
- Was the full-page Archive Blue background a deliberate "utility page" register choice, or a token substitution that should be corrected back to parchment — and if deliberate, should DESIGN.md say so explicitly?
