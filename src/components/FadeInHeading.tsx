"use client"

import { useEffect, useState } from "react"

interface FadeInHeadingProps {
  className?: string
  children: React.ReactNode
}

// Same fade-in-up-on-mount treatment as the homepage hero, reused for
// every page title so they all "float in" the same way.
export function FadeInHeading({ className, children }: FadeInHeadingProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <h1
      className={`transition-all duration-1000 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className ?? ""}`}
    >
      {children}
    </h1>
  )
}
