"use client"

import { useEffect, useState } from "react"

interface TypewriterHeadingProps {
  text: string
  className?: string
  msPerChar?: number
}

// Reveals the text one character at a time on a timer, so the blinking
// cursor is the last DOM node after only the currently-typed characters —
// it moves with the text instead of sitting fixed at the final line length.
export function TypewriterHeading({ text, className, msPerChar = 45 }: TypewriterHeadingProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) {
      setVisibleCount(text.length)
      return
    }

    setVisibleCount(0)
    let count = 0
    const id = setInterval(() => {
      count += 1
      setVisibleCount(count)
      if (count >= text.length) clearInterval(id)
    }, msPerChar)

    return () => clearInterval(id)
  }, [text, msPerChar])

  const done = visibleCount >= text.length

  return (
    <h1 className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.slice(0, visibleCount)}
        <span className={`typewriter-cursor${done ? " typewriter-cursor-done" : ""}`}>|</span>
      </span>
    </h1>
  )
}
