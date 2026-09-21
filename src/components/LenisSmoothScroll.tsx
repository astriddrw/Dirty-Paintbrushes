"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    Lenis?: new (options?: Record<string, unknown>) => unknown
  }
}

const LENIS_VERSION = "1.3.26"

// Loaded via a plain <script> tag (not next/script's onLoad) because this
// lives in the root layout, a Server Component — a function prop like
// onLoad can't cross that boundary. Injecting and initializing from a
// client-only effect sidesteps that entirely.
export function LenisSmoothScroll() {
  useEffect(() => {
    if (window.Lenis) return

    const script = document.createElement("script")
    script.src = `https://unpkg.com/lenis@${LENIS_VERSION}/dist/lenis.min.js`
    script.onload = () => {
      if (window.Lenis) {
        new window.Lenis({
          autoRaf: true,
          autoToggle: true,
          anchors: true,
          allowNestedScroll: true,
          naiveDimensions: true,
          stopInertiaOnNavigate: true,
        })
      }
    }
    document.body.appendChild(script)
  }, [])

  return (
    <link
      rel="stylesheet"
      href={`https://unpkg.com/lenis@${LENIS_VERSION}/dist/lenis.css`}
    />
  )
}
