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

export function TypologiesModule({ selected, onSelect, children }: TypologiesModuleProps) {
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
            on every typology switch. */}
        <div
          className="absolute overflow-y-auto"
          style={{ left: "22.5%", right: "24.5%", top: "8.2%", bottom: "7.5%" }}
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
