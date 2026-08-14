import { ImageResponse } from "next/og";
import { loadGoogleFont } from "@/lib/og";

export const runtime = "edge";
export const alt = "Dirty Paintbrushes — Art Market Financial Crime Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Instrument Serif italic is DESIGN.md's Display font, scoped to the
  // wordmark/hero only — reused here so the share card carries the same
  // rare, deliberate signal rather than a generic sans wordmark. Roboto
  // (the Body font) has to be embedded explicitly too — satori has no
  // real system-font fallback once any custom font is registered, so an
  // un-embedded "sans-serif" silently renders in the italic serif instead.
  const [instrumentSerifItalic, roboto] = await Promise.all([
    loadGoogleFont("Instrument Serif", 400, true),
    loadGoogleFont("Roboto", 400, false),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FFEDBB",
          fontFamily: roboto ? "Roboto" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#354A89",
            padding: "44px 64px",
          }}
        >
          <div
            style={{
              fontFamily: instrumentSerifItalic ? "Instrument Serif" : "serif",
              fontStyle: "italic",
              fontSize: 64,
              color: "#E6E2C5",
            }}
          >
            Dirty Paintbrushes
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            padding: "0 64px",
          }}
        >
          <div style={{ display: "flex", width: 120, height: 4, backgroundColor: "#BB9549", marginBottom: 28 }} />
          <div style={{ display: "flex", fontSize: 36, color: "#1A1A1A", maxWidth: 920, lineHeight: 1.4 }}>
            Curated intelligence and news tracking art market financial crime.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 64px 44px" }}>
          <div style={{ display: "flex", fontSize: 22, color: "#5C5C5C" }}>dirtypaintbrushes.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(instrumentSerifItalic
          ? [{ name: "Instrument Serif", data: instrumentSerifItalic, style: "italic" as const, weight: 400 as const }]
          : []),
        ...(roboto ? [{ name: "Roboto", data: roboto, style: "normal" as const, weight: 400 as const }] : []),
      ],
    }
  );
}
