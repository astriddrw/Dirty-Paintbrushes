import { TIER_GROUP_LABELS } from "@/lib/data"
import { formatTag } from "@/lib/utils"
import type { RssSource } from "@/lib/types"

// No "use client" — the open/close interaction is a plain checkbox+label
// pair (#sources-open, styled in globals.css), so it needs zero JS to
// function. The CSS transitions there are a progressive-enhancement
// layer on top, not a requirement.

interface TierLayout {
  key: string
  img: string
  align: "center" | "left"
  x: string
  y: string
  w: string
  inset: { t: string; r: string; b: string; l: string }
  accent: string
  // Pop-in start offset, in units of the note's OWN width/height (so a
  // plain CSS % translate works) — each note starts centered on the
  // board (where the folder sat) and animates to translate(0,0), i.e.
  // its real x/y, so they all appear to spill outward from the middle
  // as the folder opens rather than fading in already in place.
  // Computed from this note's own center ((x+w/2), (y+w/2), treating
  // height ≈ width since only width is known as a board percentage)
  // vs. the board's center (50%, 50%), then expressed as a percentage
  // of the note's own box via (boardDelta / w) * 100.
  tx: string
  ty: string
}

// Position/size (x, y, w as % of the board) and each shape/accent are
// taken directly from the reference mockup's own layout, not a
// reflowing grid — see the shape crops in public/sources/.
const TIER_LAYOUT: TierLayout[] = [
  {
    key: "tier1",
    img: "/sources/note-invest.png",
    align: "center",
    x: "64.0%",
    y: "6.3%",
    w: "22.3%",
    inset: { t: "22%", r: "9%", b: "9%", l: "9%" },
    accent: "#354A89",
    tx: "-112.8%",
    ty: "146.0%",
  },
  {
    key: "tier2",
    img: "/sources/note-art.png",
    align: "left",
    x: "0%",
    y: "43.5%",
    w: "27.4%",
    inset: { t: "44%", r: "10%", b: "4%", l: "10%" },
    accent: "#2E6E86",
    tx: "132.5%",
    ty: "-26.3%",
  },
  {
    key: "tier3",
    img: "/sources/note-news.png",
    align: "left",
    x: "34.8%",
    y: "64.8%",
    w: "31.6%",
    inset: { t: "10%", r: "9%", b: "9%", l: "10%" },
    accent: "#65322C",
    tx: "-1.9%",
    ty: "-96.8%",
  },
  {
    key: "tier4",
    img: "/sources/note-legal.png",
    align: "center",
    x: "29.3%",
    y: "0%",
    w: "29.6%",
    inset: { t: "8%", r: "8%", b: "7%", l: "20%" },
    accent: "#1F5A6E",
    tx: "19.9%",
    ty: "118.9%",
  },
  {
    key: "tier5",
    img: "/sources/note-google.png",
    align: "center",
    x: "72.2%",
    y: "50.5%",
    w: "27.8%",
    inset: { t: "9%", r: "9%", b: "9%", l: "9%" },
    accent: "#3B6B85",
    tx: "-129.9%",
    ty: "-51.8%",
  },
]

interface SourcesFolderCoverProps {
  groupedSources: Record<string, RssSource[]>
}

export function SourcesFolderCover({ groupedSources }: SourcesFolderCoverProps) {
  return (
    <div className="relative w-full max-w-[620px] sources-cover-stage">
      <input type="checkbox" id="sources-open" className="sr-only" />

      <div className="sources-cover-slot">
        <label
          htmlFor="sources-open"
          className="sources-cover-folder block relative w-full cursor-pointer"
        >
          <img
            src="/sources-folder.png"
            alt="Sources — click to open"
            className="block w-full h-auto"
          />
          <span
            className="absolute flex items-center justify-center text-center"
            style={{ left: "19%", top: "13%", width: "22%", height: "15%" }}
          >
            <span
              className="font-body text-indigo inline-block whitespace-nowrap uppercase tracking-wide"
              style={{ fontSize: "clamp(12px, 2.1vw, 18px)", fontWeight: 800, transform: "rotate(-6deg)" }}
            >
              Sources
            </span>
          </span>
        </label>
      </div>

      <div className="sources-cover-reveal">
        <div className="pt-2 pb-10">
          <div className="text-center mb-6">
            <label
              htmlFor="sources-open"
              className="sources-cover-close relative inline-flex items-center justify-center cursor-pointer px-8 py-3.5"
            >
              <svg viewBox="0 0 200 90" aria-hidden="true" className="absolute inset-0 w-full h-full">
                <path
                  d="M22,48 C20,24 58,7 101,6 C148,5 182,16 183,39 C184,58 151,78 100,81 C56,83 20,70 21,49"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M17,52 C16,27 54,10 97,9 C142,8 178,19 181,41 C183,60 149,79 96,81"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="relative font-body text-sm">close folder</span>
            </label>
          </div>

          <div className="sources-cover-board relative w-full max-w-[1100px] mx-auto">
            {TIER_LAYOUT.map((tier, i) => {
              const sources = groupedSources[tier.key] ?? []
              if (sources.length === 0) return null
              return (
                <div
                  key={tier.key}
                  className="sources-cover-note absolute"
                  style={{
                    left: tier.x,
                    top: tier.y,
                    width: tier.w,
                    "--i": i,
                    "--tx": tier.tx,
                    "--ty": tier.ty,
                  } as React.CSSProperties}
                >
                  <img src={tier.img} alt="" className="block w-full h-auto" />
                  <div
                    className="absolute flex flex-col"
                    style={{
                      top: tier.inset.t,
                      right: tier.inset.r,
                      bottom: tier.inset.b,
                      left: tier.inset.l,
                      textAlign: tier.align,
                    }}
                  >
                    <h2
                      className="font-body font-bold mb-2 leading-tight"
                      style={{ color: tier.accent, fontSize: 12, letterSpacing: "0.03em" }}
                    >
                      {TIER_GROUP_LABELS[tier.key]}
                    </h2>
                    <p
                      className="font-body text-foreground text-left"
                      style={{ fontSize: 10.5, lineHeight: 1.45 }}
                    >
                      {sources.map((source, idx) => (
                        <span key={source.id}>
                          <a
                            href={source.site_url || source.feed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {tier.key === "tier5" ? formatTag(source.name) : source.name}
                          </a>
                          {idx < sources.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
