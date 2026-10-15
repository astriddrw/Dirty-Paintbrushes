"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// Shows a newsletter's email HTML on the site. An iframe keeps the email's
// own styles apart from the site's (and vice versa). The sandbox allows no
// scripts; allow-same-origin only lets this component read the content's
// height so the frame fits it; links open in a new tab.
export function EmailFrame({
  html,
  title,
  maxHeight,
}: {
  html: string
  title: string
  // Crop to this height (with a fade) for previews; full height otherwise.
  maxHeight?: number
}) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(900)

  const fit = useCallback(() => {
    const doc = ref.current?.contentDocument
    if (doc?.body) setHeight(doc.documentElement.scrollHeight)
  }, [])

  // srcDoc content can finish loading before React attaches onLoad, so also
  // measure once mounted — and again on resize, since the email reflows
  // (and gets taller) on narrow screens.
  useEffect(() => {
    if (ref.current?.contentDocument?.readyState === "complete") fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [html, fit])

  const cropped = maxHeight !== undefined && height > maxHeight

  return (
    <div className="relative overflow-hidden" style={{ height: cropped ? maxHeight : height }}>
      <iframe
        ref={ref}
        title={title}
        srcDoc={html}
        onLoad={fit}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        className="block w-full border-0"
        style={{ height }}
        scrolling="no"
      />
      {cropped && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background"
        />
      )}
    </div>
  )
}
