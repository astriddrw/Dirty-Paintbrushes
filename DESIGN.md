---
name: Dirty Paintbrushes
description: A financial broadsheet's front page for art-market crime — parchment, ink indigo, and dried-blood red, laid out flat and square like a dossier.
colors:
  aged-paper: "#FFEDBB"
  ink-black: "#1A1A1A"
  gallery-white: "#FFFFFF"
  muted-navy: "#253B59"
  broadsheet-cobalt: "#334EAC"
  ink-indigo: "#354A89"
  pale-indigo-wash: "#DCE1F0"
  worn-ochre: "#BB9549"
  ochre-on-dark: "#D8C297"
  ochre-on-light: "#775E2C"
  archive-blue: "#CFE6F0"
  dried-blood: "#65322C"
  paper-hover: "#F2F0EC"
  dust: "#E8E6E3"
  faded-ink: "#5C5C5C"
  alert-red: "#B83232"
  aged-vellum: "#E6E2C5"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.15
  title:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.35
  body:
    fontFamily: "Roboto, ui-sans-serif, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Noto Sans, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 300
    letterSpacing: "0.02em"
rounded:
  sm: "0px"
  md: "0px"
  lg: "0px"
  xl: "0px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.aged-paper}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.aged-paper}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-hover}"
    textColor: "{colors.ink-black}"
  pill:
    backgroundColor: "{colors.pale-indigo-wash}"
    textColor: "{colors.ink-indigo}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  input:
    backgroundColor: "{colors.aged-paper}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: Dirty Paintbrushes

## Overview

**Creative North Star: "The Broadsheet Front Page"**

Dirty Paintbrushes reads like the front page of a serious financial broadsheet that happens to cover the art world: parchment newsprint, ink-indigo mastheads, italic serif headlines, and a single dried-blood red held in reserve for what matters. It has to be visually impressive — worth lingering on — without ever tipping into decoration. Every choice answers to the same test: would this survive on the front page of something a compliance officer, a journalist, and a gallerist would all trust with their name.

The system is flat and square by construction, not by default neglect — corners, shadows, and gradients are absent because a dossier doesn't need them. Depth comes from ink density and hairline rule, the way it does on newsprint: solid color-block sections (the indigo hero, the pale-blue "Latest Intelligence" band) interrupt the parchment field the way a masthead interrupts a page. The three expressive hues (Ink Indigo, Worn Ochre, Dried Blood) run about 20% less saturated than their original values, per the founder's direction — a shade more archival, a shade less bright screen-color.

**Key Characteristics:**
- Parchment field, ink-black type, one indigo, one ochre, one oxblood — no other hues admitted without a reason.
- Instrument Serif italic is a rare, deliberate signal — the wordmark and the homepage hero, nowhere else — not a default headline treatment; Lora carries actual content titles, Roboto anything that has to be read fast.
- Flat by construction: zero border-radius on the standard scale, zero shadows, depth from borders and color blocks only.
- One unified pill style for every classification tag — indigo text on pale-indigo wash — never a rainbow of category colors.

## Colors

Fourteen colors total, and only three of them are doing expressive work — the rest are structural (paper, ink, hairline, hover).

### Primary
- **Ink Indigo** (`#354A89`): the signature color — wordmark, active-nav underline, CTA buttons, external-link icons, the hero section's solid fill. Carries the brand.
- **Muted Navy** (`#253B59`): the workhorse interactive color — body links, form focus rings, primary buttons on lighter surfaces. Sits one register quieter than Ink Indigo so the two never compete.
- **Broadsheet Cobalt** (`#334EAC`): reserved for page-level headings on utility surfaces (Sources, Dashboard). A third, closely related blue — deliberate, not an inconsistency, but easy to over-use; keep it to headings only. Not yet moved onto the muted track (see Named Rules).

### Secondary
- **Worn Ochre** (`#BB9549`): the one warm accent. Reserved for borders, underlines, and pill/button fills (hero CTA link decoration, homepage nav-card hover border). Its scarcity is what makes it read as "flagged" rather than decorative.
- **Ochre on Dark** (`#D8C297`): Worn Ochre fails contrast (3.01:1) as raw text on the indigo hero — this lightened variant (4.85:1, WCAG AA) is what the "Explore Feed" link actually renders in. Use it, never the base ochre, whenever ochre text sits on indigo or navy.
- **Ochre on Light** (`#775E2C`): Worn Ochre also fails contrast (2.41:1) as raw text on parchment — this darkened variant (5.28:1, WCAG AA) is what article-type labels and the homepage nav-card hover state actually render in. Use it, never the base ochre, whenever ochre text sits on parchment.
- **Dried Blood** (`#65322C`): the hover/emphasis color for editorial content — article titles turn this on hover, Sources page section labels use it at rest. Reads as ink bleeding through, not as a warning color (that's Alert Red's job).

### Neutral
- **Aged Paper** (`#FFEDBB`): the background on every page — the shared parchment field the whole system sits on.
- **Aged Vellum** (`#E6E2C5`): the cream/ivory text and surface color used on dark-indigo grounds (hero copy, footer, the feedback widget). Promoted to a real `--aged-vellum` custom property 2026-08-13 — use the token, not a literal.
- **Ink Black** (`#1A1A1A`): body text, primary-button fill.
- **Gallery White** (`#FFFFFF`): cards, search inputs — the one pure-white surface, used sparingly against the parchment field.
- **Pale Indigo Wash** (`#DCE1F0`): the pill background for every classification tag.
- **Archive Blue** (`#CFE6F0`): section-background alternation (home page's "Latest Intelligence" band).
- **Dust** (`#E8E6E3`) / **Paper Hover** (`#F2F0EC`): borders, dividers, and hover fills — the "barely there" warm neutrals that keep hairlines from reading as harsh on parchment.
- **Faded Ink** (`#5C5C5C`): muted/secondary text.
- **Alert Red** (`#B83232`): form and validation errors only.

### Named Rules
**The One Voice Rule.** Ochre appears on at most one or two elements per screen. Its rarity is what makes it read as a flag, not a decoration.

**The Muted Direction Rule.** The three expressive hues were desaturated ~20% from their original values (2026-08-13) at the founder's direction, and Broadsheet Cobalt has not been moved yet. New accent work — new tints, new tag colors, or finishing Cobalt's move — should continue desaturating toward this family, never brighten back past it.

**The Ochre-as-Text Rule.** Worn Ochre was tuned as a border/fill accent, not a text color — it fails WCAG AA contrast as raw text on both indigo (3.01:1) and parchment (2.41:1). Any new ochre *text* use must reach for Ochre on Dark or Ochre on Light, never the base token.

## Typography

**Display Font:** Instrument Serif (with Georgia, serif fallback) — the wordmark and homepage hero only.
**Title Font:** Lora (with Georgia, serif fallback) — article titles inside list rows.
**Body Font:** Roboto (with ui-sans-serif fallback)
**Label/Nav Font:** Noto Sans
**Unused asset:** a custom display face (BERKY) is loaded as `--font-brand` in the root layout but not applied anywhere yet — treat it as reserved for a future wordmark/masthead treatment, not as an active token.

**Character:** Instrument Serif's italic sets the voice — editorial, a little literary, never neutral — but it was showing up on nearly every headline on the site (wordmark, hero, section headings, article titles), which read as templated rather than considered. Lora now carries actual content titles: a quieter, moderate-contrast text serif with real editorial pedigree, distinct enough from Instrument Serif that the two don't compete. Roboto stays completely out of the way for anything that has to be scanned (filters, admin tables).

### Hierarchy
- **Display** (400, `clamp(3rem, 6vw, 4.5rem)`, italic, leading-tight): the homepage hero headline only.
- **Headline** (400, `text-4xl` → `text-5xl`, italic, tracking-tight): every other page's `<h1>` (Sources, Saved, About) via the shared `FadeInHeading` component, plus the "Latest Intelligence" section heading and the footer wordmark — still Instrument Serif, not yet moved to Lora (see Named Rules).
- **Title** (400, Lora, `text-base` → `text-lg`, not italic): article titles inside list rows (`ArticleRow`). Article detail `<h1>` still steps up to `text-3xl`/`text-4xl` in Instrument Serif at 400 weight, not italic — also not yet moved.
- **Body** (400, `text-sm`/`text-base`, leading-relaxed): article summaries, comment bodies, editorial copy.
- **Label** (300, `text-[15px]`, uppercase, Noto Sans): nav links and CTA buttons. A second, smaller label style (`text-xs`, uppercase, `tracking-wider`, Roboto) marks eyebrow text — "Editor's note," "Entities involved," source tier badges.

### Named Rules
**The Italic-Means-Editorial Rule.** Italic Instrument Serif marks anything the platform is asserting with a voice — headlines, the wordmark, hero copy. Non-italic serif marks something being *reported*, not *said*. Don't italicize data.

**The Serif Scarcity Rule.** Instrument Serif was overused — leaning on the same distinctive italic face for every headline is what made the site read as templated rather than authored. As of 2026-08-14 it's scoped to the wordmark and homepage hero only; article-row titles moved to Lora. `FadeInHeading` page titles, the "Latest Intelligence" heading, article detail titles, and the footer wordmark still use Instrument Serif and have **not** been moved yet — extend this rule to them before reaching for Instrument Serif on anything new, rather than treating it as the default headline face again.

## Layout

Three container widths, chosen by reading distance, not by page: `max-w-7xl` for chrome (nav, footer), `max-w-5xl` for scanning content (feed, home's article list), `max-w-3xl` for sustained reading (article detail). All are `mx-auto px-6 lg:px-8`.

Sections stack with generous, consistent vertical rhythm — `py-12 lg:py-16` for standard sections — separated by `border-t border-border` hairlines rather than background changes, except where a full-bleed color block (hero, "Latest Intelligence") is deliberately used to mark a shift in register.

**Hero (2026-08-14):** no longer a tall, centered, full-viewport color block — that composition read as a generic landing-page template. Now a compact single row (`py-8`, `bg-indigo`, `flex-wrap items-baseline justify-between`): wordmark-sized title on the left (Instrument Serif italic, `text-4xl`/`text-5xl`), the tagline inline to its right (plain body text, not serif), CTAs pushed to the far right (`ml-auto`) in the same italic-serif-link style as before. Real content starts almost immediately below it.

The feed and homepage list articles as divided rows (`divide-y`/`border-b`), not cards — this is a broadsheet, not a grid of tiles. Filters render as underlined text-links in italic serif (crime type in indigo, article type in Ochre on Light — see Named Rules), not chip buttons, keeping the controls visually part of the editorial voice rather than app chrome.

Responsive: a single `md` breakpoint collapses desktop nav into a hamburger; the mobile menu is a plain stacked list under a `border-t`, no overlay or animation.

## Elevation & Depth

Flat, no exceptions. There is no `box-shadow` anywhere in the live product. Depth is conveyed two ways: hairline borders (`border-border`, `#E8E6E3`) separating rows and sections, and solid color-block fills (the indigo hero, the archive-blue "Latest Intelligence" band) that read as a change in surface the way a masthead band does on a real newspaper page.

### Named Rules
**The No-Shadow Rule.** Never add `box-shadow`. If something needs to feel elevated, give it a solid fill or a border, not a shadow.

## Shapes

Square by default. The radius scale (`sm`/`md`/`lg`/`xl`) is hard-set to `0` at the token level — even components authored with `rounded-md` or `rounded-lg` classes render with sharp corners, because the underlying CSS variables are zeroed out. The only rounding in the system is `rounded-full`, reserved for perfect circles (icon badges like the empty-bookmark-state avatar).

`FeedbackBox` previously used `rounded-2xl`/`rounded-xl` on its card and controls — those specific scale steps (`2xl`, `3xl`) were never zeroed out like `sm`–`xl` were, so it rendered soft while everything else on the page was sharp. Flattened 2026-08-13; if a future addition reaches for `rounded-2xl`/`rounded-3xl` again, that's the same trap resurfacing, not a second valid corner language.

### Named Rules
**The Flat-Edge Rule.** No rounded corners on the standard scale. If a component needs one, it's either a perfect circle (`rounded-full`) or it's wrong.

## Components

### Buttons
- **Shape:** square, no radius, generous horizontal padding (`px-5`–`px-6`, `py-2`–`py-2.5`).
- **Primary:** solid fill — `bg-foreground text-background` (ink-on-parchment) is the default; `bg-indigo` is used for the one homepage CTA. Text is `text-sm font-medium`, no uppercase.
- **Label/Nav variant:** `bg-indigo text-background`, uppercase, `font-nav font-light` — used for the "Look for more" style CTA, visually distinct from the standard button (uppercase + label font marks it as navigational, not transactional).
- **Secondary/Ghost:** `border border-border`, transparent fill, `hover:bg-secondary`. Used for lower-emphasis actions (Bookmark, Run Data Cleanup).
- **Hover/Focus:** opacity fade (`hover:opacity-80`) on solid buttons; background fill on outlined ones. No transform, no shadow.

### Pills / Tags
- **Style:** one style for every classification tag — `bg-indigo-pale text-indigo`, `rounded-[2px]` (effectively square), `text-xs font-medium`, `px-2 py-0.5`. This unified pill (defined in `src/lib/data.ts`) is the canonical tag treatment.
- List-row tags (crime type, article type in `ArticleRow`/`feed-content`) render as plain italic text rather than filled pills — crime type uses Ink Indigo (passes contrast at 7.26:1), article type uses Ochre on Light (see Named Rules), never the base Worn Ochre.

### Cards / Containers
- **Corner Style:** square (see Shapes).
- **Background:** `bg-card`/white for search inputs and form surfaces; most "cards" are actually bordered blocks on the parchment field (`border border-border`), not filled panels.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Border:** `border-border`, hairline weight, the default way content blocks (editor's note, entities list, empty states) are set off from the page.
- **Internal Padding:** generous — `p-5` to `p-8`/`p-12` for empty states and callouts.

### Inputs / Fields
- **Style:** `border border-border`, flat background matching the surrounding surface, `text-sm`, square corners.
- **Focus:** `focus:ring-2 focus:ring-ring` (navy ring), no border-color shift.
- **Disabled:** `opacity-30`/`opacity-40` plus `cursor-not-allowed` on the button that would submit the field.

### Navigation
- Sticky top bar (`sticky top-0 z-50`), transparent onto the parchment background (no border, no shadow, just the field color).
- Wordmark: italic Instrument Serif, `text-indigo`.
- Links: Noto Sans, uppercase, `font-light`, `text-indigo`; the active route gets an underline (`decoration-2 decoration-indigo`) rather than a background or weight change alone.
- Mobile: hamburger toggle (Menu/X icons), stacked list under a top border, no animation.

## Do's and Don'ts

### Do:
- **Do** keep the palette to three expressive colors (ink indigo, worn ochre, dried blood) plus structural neutrals — resist adding a fourth accent hue.
- **Do** use the single unified pill style (`bg-indigo-pale text-indigo`, from `src/lib/data.ts`) for every new classification tag, badge, or filter chip.
- **Do** lean italic Instrument Serif for anything editorial/authoritative, and keep Roboto for anything that must be scanned quickly.
- **Do** trend new accent tints toward *more* muted/desaturated, per the founder's stated direction — not brighter or more saturated.
- **Do** convey depth with hairline borders and solid color-block sections, never shadows.
- **Do** use Ochre on Dark / Ochre on Light for any ochre text — the base Worn Ochre token is a border/fill color and fails contrast as text (see Named Rules).
- **Do** keep icon-only action buttons (bookmark, external-link, mobile nav toggle) at `p-3`/`p-3.5` or larger — a 44px minimum tap target, not `p-2`.
- **Do** use Lora for content titles (article rows) and reserve Instrument Serif for the wordmark and hero — see the Serif Scarcity Rule before adding a new Instrument Serif headline anywhere else.

### Don't:
- **Don't** add `box-shadow` anywhere, and don't round `sm`/`md`/`lg`/`xl`-scale corners — both break the flat, square broadsheet language (`rounded-full` for circles is the only exception).
- **Don't** treat `/cases` as more than a placeholder. It's a deliberate "coming soon" gate (`src/app/cases/page.tsx`) as of 2026-08-13, not a migrated feature — `/cases/[id]` redirects to it. Build the real case-file experience against live Supabase `cases` data (already used by `/admin/cases`) when that work is picked up, rather than resuming the old placeholder-data version.
- **Don't** reach for `text-ochre`/`decoration-ochre` directly — always the on-dark or on-light variant, per the Ochre-as-Text Rule.
