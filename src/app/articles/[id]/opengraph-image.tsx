import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { crimeTypeLabels } from "@/lib/data";
import { formatSource } from "@/lib/utils";
import { loadGoogleFont } from "@/lib/og";

export const runtime = "edge";
export const alt = "Dirty Paintbrushes article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { id: string };
}

export default async function Image({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, source_name, source_tier, url, crime_types")
    .eq("id", params.id)
    .single();

  const title = data?.title ?? "Dirty Paintbrushes";
  const displayTitle = title.length > 110 ? `${title.slice(0, 110).trimEnd()}…` : title;
  const primaryCrime = data?.crime_types?.[0];
  const crimeLabel = primaryCrime
    ? crimeTypeLabels[primaryCrime] ?? primaryCrime.replace(/_/g, " ")
    : null;
  const source = data ? formatSource(data) : null;

  // Instrument Serif italic (Display, wordmark) and Lora (Title, article
  // headlines) — the same two faces the live article page actually uses,
  // so the card matches what clicking through into it looks like. Roboto
  // (Body font) has to be embedded explicitly too — satori has no real
  // system-font fallback once any custom font is registered, so an
  // un-embedded "sans-serif" silently renders in the italic serif instead.
  const [instrumentSerifItalic, lora, roboto] = await Promise.all([
    loadGoogleFont("Instrument Serif", 400, true),
    loadGoogleFont("Lora", 500, false),
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
            padding: "28px 64px",
          }}
        >
          <div
            style={{
              fontFamily: instrumentSerifItalic ? "Instrument Serif" : "serif",
              fontStyle: "italic",
              fontSize: 32,
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
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            {crimeLabel && (
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#DCE1F0",
                  color: "#354A89",
                  fontSize: 20,
                  fontWeight: 600,
                  padding: "6px 14px",
                }}
              >
                {crimeLabel}
              </div>
            )}
            {source && <div style={{ display: "flex", fontSize: 20, color: "#5C5C5C" }}>{source}</div>}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: lora ? "Lora" : "serif",
              fontSize: 52,
              fontWeight: 500,
              color: "#1A1A1A",
              lineHeight: 1.25,
              maxWidth: 1010,
            }}
          >
            {displayTitle}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 64px 40px" }}>
          <div style={{ display: "flex", fontSize: 20, color: "#5C5C5C" }}>dirtypaintbrushes.com</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(instrumentSerifItalic
          ? [{ name: "Instrument Serif", data: instrumentSerifItalic, style: "italic" as const, weight: 400 as const }]
          : []),
        ...(lora ? [{ name: "Lora", data: lora, style: "normal" as const, weight: 500 as const }] : []),
        ...(roboto ? [{ name: "Roboto", data: roboto, style: "normal" as const, weight: 400 as const }] : []),
      ],
    }
  );
}
