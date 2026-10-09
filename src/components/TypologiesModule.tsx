"use client"

import { useEffect, useRef } from "react"
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

interface TypologyTab {
  value: string
  label: string
}

const TABS: TypologyTab[] = [
  { value: "", label: "all" },
  ...TYPOLOGY_VALUES.map((value) => ({ value, label: crimeTypeLabels[value].toLowerCase() })),
]

// Bands measured directly off the photographed page's five die-cut tabs
// (top%, bottom%, of the binder image's own height) — not guessed, so the
// labels land on the actual flaps instead of floating over the page edge.
const TAB_BANDS: Array<[number, number]> = [
  [6.85, 24.09],
  [24.09, 41.33],
  [41.33, 58.57],
  [58.57, 75.8],
  [75.8, 93.04],
]

interface TypologiesModuleProps {
  // "" = none selected (the "All" tab). Mirrors the parent's
  // searchParams.get("crime") ?? "".
  selected: string
  // Reports the raw clicked value ("" for "All"); the parent decides
  // toggle-to-close when the same value is clicked again.
  onSelect: (value: string) => void
  // The panel's contents — article list, results count, pagination.
  // Rendered directly on the photographed page, inset to clear the ring
  // binder on the left and the tab column on the right.
  children: React.ReactNode
}

// The root LenisSmoothScroll instance (see src/components/LenisSmoothScroll.tsx)
// is created with allowNestedScroll: true, which tells *it* to leave overflow
// containers like this one on native scroll rather than fight over them — so
// without a Lenis instance of its own, this panel scrolls at native/instant
// speed while the rest of the page scrolls smoothed, a jarring mismatch.
// Giving it its own instance (same defaults as the root one, since neither
// sets an explicit duration/easing) makes the two feel identical.
// Re-runs whenever `selected` changes: the panel's content div is
// re-keyed on every typology switch (a new DOM node, for the fade-in), so
// a Lenis instance created against the old one would be measuring a
// detached element after the switch.
function useNestedLenis(ref: React.RefObject<HTMLDivElement>, selected: string) {
  useEffect(() => {
    const el = ref.current
    if (!el || !el.firstElementChild) return

    let lenis: { destroy: () => void } | undefined
    let cancelled = false
    let pollId: ReturnType<typeof setInterval> | undefined

    const init = () => {
      if (cancelled || !window.Lenis || !el.firstElementChild) return
      lenis = new window.Lenis({
        wrapper: el,
        content: el.firstElementChild as HTMLElement,
        autoRaf: true,
      }) as { destroy: () => void }
    }

    if (window.Lenis) {
      init()
    } else {
      pollId = setInterval(() => {
        if (window.Lenis) {
          clearInterval(pollId)
          init()
        }
      }, 50)
    }

    return () => {
      cancelled = true
      if (pollId) clearInterval(pollId)
      lenis?.destroy()
    }
  }, [ref, selected])
}

export function TypologiesModule({ selected, onSelect, children }: TypologiesModuleProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useNestedLenis(panelRef, selected)

  return (
    <div style={{ width: "min(1120px, 86vw)", maxWidth: "100%" }}>
      <div className="relative w-full" style={{ aspectRatio: "743 / 905" }}>
        <img
          src="/binder.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full select-none pointer-events-none"
        />

        {/* Article list, count, pagination — sits directly on the
            photographed page. Keyed by `selected` so the fade-in restarts
            on every typology switch. overflow-x-hidden is required, not
            decorative: per the CSS overflow spec, an axis left "visible"
            while the other is "auto" computes to "auto" too — without it,
            any content even 1px wider than the panel (a long unbroken
            token in a title, say) silently grows a horizontal scrollbar
            along the bottom that has no reason to be there. */}
        <div
          ref={panelRef}
          className="absolute overflow-y-auto overflow-x-hidden"
          style={{ left: "23.4%", right: "19.5%", top: "8.2%", bottom: "7.5%" }}
        >
          <div key={selected} className="animate-panel-fade">
            {children}
          </div>
        </div>

        <div role="group" aria-label="Filter by typology">
          {TABS.map(({ value, label }, i) => {
            const isActive = selected === value
            const [top, bottom] = TAB_BANDS[i]
            return (
              <button
                key={value || "all"}
                type="button"
                onClick={() => onSelect(value)}
                aria-pressed={isActive}
                className={`typology-tab absolute flex cursor-pointer items-center justify-center border-0 bg-transparent p-0${
                  isActive ? " active" : ""
                }`}
                style={{ left: "87.5%", right: "6.5%", top: `${top}%`, height: `${bottom - top}%` }}
              >
                <span
                  className="typology-tab-label font-title text-xs font-medium"
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: "92%" }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
