"use client"

import { useState } from "react"
import { crimeTypeLabels } from "@/lib/data"

// Same four values the old Crime Type pill row exposed, same order, same
// canonical labels — this module replaces that control, it doesn't
// introduce a new taxonomy.
const TYPOLOGY_VALUES = [
  "fraud",
  "money_laundering",
  "sanctions_evasion",
  "terror_financing",
] as const

interface TypologyCategory {
  value: (typeof TYPOLOGY_VALUES)[number]
  label: string
}

const TYPOLOGY_CATEGORIES: TypologyCategory[] = TYPOLOGY_VALUES.map((value) => ({
  value,
  label: crimeTypeLabels[value],
}))

// The panel is a single fixed color (PANEL_BG) — not a per-category tint —
// specifically so "the active tab matches the panel exactly" is a
// well-defined statement with one answer, not five. Matches the "1A: Manila
// — flush merge" option: panel never changes color (that's option 1C); the
// selected tab bleeds to the panel's color instead.
const PANEL_BG = "#FFEDBB" // --background (parchment)
const PANEL_BG_TEXT = "#1A1A1A" // --foreground (ink)
const INK_RGB = "26, 26, 26" // --foreground, for veil/shadow rgba()

// Money Laundering's light-blue fill (#CFE6F0) sits at ~1.1:1 contrast
// against the parchment panel/page (#FFEDBB) — both pale, WCAG non-text
// minimum is 3:1 — so its silhouette all but disappears at rest, even with
// the veil darkening it (still only ~1.6:1). No other category has this
// problem: indigo/oxblood/grey all clear 5.7:1+ against parchment on their
// own. rgba ink at 0.55 alpha clears 3:1 against both the light-blue fill
// and the parchment it sits on, so this tab alone gets a hairline outline
// the others don't need.
const OUTLINE_NEEDED: ReadonlySet<string> = new Set(["money_laundering"])
const OUTLINE_COLOR = `rgba(${INK_RGB}, 0.55)`

// One of the site's actual established colors per tab (light blue, oxblood,
// indigo, warm grey) rather than shades of a single manila tone — four
// distinct hues so every typology stays identifiable at a glance, unlike
// the source mock (which reuses one red for both Fraud and Terror
// Financing). Text color is contrast-checked per shade, not assumed —
// oxblood needs light text (dark ink there is ~1.7:1, a hard fail; aged
// vellum is 7.8:1), indigo needs light text too (~6.4:1, the site's own
// established pairing for text-on-indigo); light-blue takes dark ink fine.
// Terror Financing's grey is --muted-foreground, not --secondary (the "All"
// tab's fill) — --secondary is near-white and would read as the same tab.
const TYPOLOGY_STYLES: Record<(typeof TYPOLOGY_VALUES)[number], { fill: string; text: string }> = {
  fraud: { fill: "#354A89", text: "#E6E2C5" }, // indigo / aged-vellum
  money_laundering: { fill: "#CFE6F0", text: "#1A1A1A" }, // light-blue / ink
  sanctions_evasion: { fill: "#65322C", text: "#E6E2C5" }, // oxblood / aged-vellum
  terror_financing: { fill: "#5C5C5C", text: "#E6E2C5" }, // --muted-foreground / aged-vellum
}

// "All" gets the site's neutral hover-state token rather than parchment, so
// it doesn't visually collide with Terror Financing's resting color (both
// would otherwise render identically at rest).
const ALL_TAB_STYLE = { fill: "#F2F0EC", text: "#1A1A1A" } // --secondary / ink

interface TypologiesModuleProps {
  // "" = none selected (the "All" tab). Mirrors the parent's
  // searchParams.get("crime") ?? "".
  selected: string
  // Reports the raw clicked value ("" for "All"); the parent decides
  // toggle-to-close when the same value is clicked again.
  onSelect: (value: string) => void
  // The panel's contents — article list, results count, pagination. Owned
  // here (not rendered separately by the caller) so the tab row and its
  // panel can never drift apart into "menu + unrelated content below" again.
  children: React.ReactNode
}

export function TypologiesModule({ selected, onSelect, children }: TypologiesModuleProps) {
  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Typologies
      </span>
      <TypologiesTabBar selected={selected} onSelect={onSelect} />
      {/* Panel — fused to the tab row above with zero gap (no margin-top),
          same width as the tab row and left-aligned with it (both start at
          this component's own left edge) so the parchment reads as one
          sheet of paper exactly as wide as the tabs attached to it, not a
          wide card the tabs happen to sit near the edge of. */}
      <div
        className="relative z-10 p-6 lg:p-8"
        style={{ width: TAB_ROW_WIDTH, maxWidth: "100%", backgroundColor: PANEL_BG }}
      >
        {children}
      </div>
    </div>
  )
}

// ── Manila-folder tab bar, fused to the panel below (design option "1A") ──
// A deliberate, scoped exception to the site's flat/square rules. Shape is
// an SVG <clipPath> with clipPathUnits="objectBoundingBox" (coordinates
// normalized to 0–1, not the mock's literal 210×74 px path) so it rescales
// to whatever TAB_WIDTH/TAB_HEIGHT this site actually needs — a plain CSS
// clip-path: path() is authored in fixed px and won't scale to the element,
// and clip-path: polygon() supports percentages but can't round the
// shoulder where the diagonal edge meets the flat top.
const TAB_WIDTH = 176 // px
const TAB_HEIGHT = 62 // px — same ~2.84:1 ratio as the source mock's 210×74
const TAB_CLIP_ID = "typology-tab-clip"

// Shared by the invisible <clipPath> (shapes every tab) and the visible
// outline overlay (only rendered for OUTLINE_NEEDED tabs) — one geometry,
// so they can never drift apart into a clip that doesn't match its outline.
const TAB_PATH_D =
  "M0,1 L0,0.8243 Q0,0.6622 0.0476,0.5541 L0.1,0.1892 Q0.1238,0.027 0.181,0 L0.819,0 Q0.8762,0.027 0.9,0.1892 L0.9524,0.5541 Q1,0.6622 1,0.8243 L1,1 Z"

// Adjacent tabs overlap rather than sitting edge-to-edge — later tabs paint
// over the previous one's right edge (same DOM-order stacking the mock's
// option 1B fans out, just a lighter touch of it than a full 20px
// fanned-dossier stack).
const TAB_OVERLAP = 18 // px

// Resting tabs sink this many px below the row's un-transformed baseline
// (see the `lift` values below). Must match the largest of those values.
const TAB_MAX_LIFT = 5 // px

// "All" + the four typologies — derived from the same array the tab row
// maps over, so the panel's width computation can never drift out of sync
// with how many tabs actually render.
const TAB_COUNT = TYPOLOGY_CATEGORIES.length + 1
const TAB_ROW_WIDTH = TAB_COUNT * TAB_WIDTH - (TAB_COUNT - 1) * TAB_OVERLAP

function TypologiesTabBar({ selected, onSelect }: Omit<TypologiesModuleProps, "children">) {
  const [hoveredValue, setHoveredValue] = useState<string | null>(null)

  const tabs: Array<{ value: string; label: string }> = [
    { value: "", label: "All" },
    ...TYPOLOGY_CATEGORIES,
  ]

  return (
    // flex-nowrap + overflow-x-auto rather than flex-wrap: a folder of tabs
    // doesn't reflow into a grid, and wrapping would let a second row's
    // z-index collide with the panel below. Narrow viewports scroll the
    // row horizontally instead.
    //
    // overflow-x: auto forces overflow-y to compute to "auto" too (the CSS
    // rule: if one axis is visible and the other isn't, the visible one
    // becomes auto) — so the sunk/lifted tabs, which are meant to overlap
    // down into the panel below, were getting clipped off at the row's own
    // box edge instead, reading as disconnected/floating. paddingBottom
    // gives the box enough room to contain the full sink range so nothing
    // needs clipping; the equal negative marginBottom cancels that extra
    // space back out so the panel still sits flush, not pushed down.
    <div
      className="flex items-end flex-nowrap overflow-x-auto"
      role="group"
      aria-label="Filter by typology"
      style={{ paddingBottom: TAB_MAX_LIFT, marginBottom: -TAB_MAX_LIFT }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <clipPath id={TAB_CLIP_ID} clipPathUnits="objectBoundingBox">
          <path d={TAB_PATH_D} />
        </clipPath>
      </svg>
      {tabs.map(({ value, label }, index) => {
        const isActive = selected === value
        const isHovered = !isActive && hoveredValue === value
        const restStyle = value === "" ? ALL_TAB_STYLE : TYPOLOGY_STYLES[value as (typeof TYPOLOGY_VALUES)[number]]

        // Resting: sunk 5px behind the panel edge, veiled dark, own color.
        // Hovered (inactive only): lifts slightly, veil thins, and a
        // parchment-tinted "merge" layer partially crossfades in — a
        // preview of "becoming part of the panel" without committing to it.
        // Active: flush with the panel (1px lift matches the panel's own
        // shadow origin), veil gone, merge fully opaque — the tab *is*
        // panel-colored now — and text flips to ink.
        const lift = isActive ? 1 : isHovered ? 3 : 5
        const zIndex = isActive ? 20 : 1
        const veilOpacity = isActive ? 0 : isHovered ? 0.05 : 0.18
        const mergeOpacity = isActive ? 1 : isHovered ? 0.42 : 0
        const textColor = isActive ? PANEL_BG_TEXT : restStyle.text

        return (
          <button
            key={value || "all"}
            type="button"
            onClick={() => onSelect(value)}
            onMouseEnter={() => setHoveredValue(value)}
            onMouseLeave={() => setHoveredValue((v) => (v === value ? null : v))}
            aria-pressed={isActive}
            className="relative cursor-pointer border-0 p-0"
            style={{
              width: TAB_WIDTH,
              height: TAB_HEIGHT,
              flexShrink: 0,
              marginLeft: index === 0 ? 0 : -TAB_OVERLAP,
              clipPath: `url(#${TAB_CLIP_ID})`,
              transform: `translateY(${lift}px)`,
              zIndex,
              transition: "transform 200ms cubic-bezier(.2,.75,.3,1)",
            }}
          >
            {/* Base fill */}
            <span className="absolute inset-0" style={{ backgroundColor: restStyle.fill }} />
            {/* Veil — darkens resting/hovered tabs so they read as sunk behind the panel */}
            <span
              className="absolute inset-0"
              style={{
                backgroundColor: `rgba(${INK_RGB}, ${veilOpacity})`,
                transition: "background-color 260ms ease",
              }}
            />
            {/* Merge — crossfades the tab to panel color; opaque at full select */}
            <span
              className="absolute inset-0"
              style={{
                backgroundColor: PANEL_BG,
                opacity: mergeOpacity,
                transition: "opacity 260ms ease",
              }}
            />
            {/* Outline — only for tabs whose fill is too close in lightness
                to the parchment it sits on (see OUTLINE_NEEDED above).
                Fades out as the tab merges into the panel: once merged, the
                tab *is* parchment, and an outline would just draw a line
                around nothing. */}
            {OUTLINE_NEEDED.has(value) && (
              <svg
                className="absolute inset-0"
                viewBox="0 0 1 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={TAB_PATH_D}
                  fill="none"
                  stroke={OUTLINE_COLOR}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  style={{ opacity: 1 - mergeOpacity, transition: "opacity 260ms ease" }}
                />
              </svg>
            )}
            <span
              className="absolute left-0 right-0 bottom-3 text-center font-title uppercase tracking-wide text-xs font-medium"
              style={{ color: textColor, transition: "color 260ms ease" }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
