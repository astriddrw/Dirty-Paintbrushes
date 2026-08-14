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
          backgroundColor: "#354A89",
          fontFamily: roboto ? "Roboto" : "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: instrumentSerifItalic ? "Instrument Serif" : "serif",
              fontStyle: "italic",
              fontSize: 84,
              color: "#E6E2C5",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Dirty Paintbrushes
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#E6E2C5", maxWidth: 820, lineHeight: 1.5 }}>
            Curated intelligence and news tracking art market financial crime.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 80px 44px" }}>
          <div style={{ display: "flex", fontSize: 22, color: "#E6E2C5", opacity: 0.7 }}>dirtypaintbrushes.com</div>
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
