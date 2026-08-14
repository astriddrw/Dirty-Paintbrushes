// Fetches a Google Font as raw bytes so it can be embedded in a generated
// Open Graph image — ImageResponse (satori) has no access to system or
// next/font-optimized fonts, only fonts explicitly passed as binary data.
export async function loadGoogleFont(
  family: string,
  weight: number,
  italic = false
): Promise<ArrayBuffer | null> {
  try {
    const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${axis}&display=swap`,
      {
        // Google serves a .ttf (rather than .woff2) to older user agents —
        // satori can embed .ttf directly, so this avoids a format satori
        // can't reliably parse.
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.7 Safari/534.34",
        },
      }
    ).then((res) => res.text());

    const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
    if (!fontUrl) return null;

    const res = await fetch(fontUrl);
    return await res.arrayBuffer();
  } catch {
    // A generated card with the fallback font beats a broken share link.
    return null;
  }
}
