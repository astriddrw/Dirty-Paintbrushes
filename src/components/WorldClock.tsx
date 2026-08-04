"use client"

import { useEffect, useState } from "react"

interface WorldClockProps {
  className?: string
}

function formatNow(date: Date): string {
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" })
  const month = date.toLocaleDateString(undefined, { month: "long" })
  const day = date.getDate()
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${weekday} ${day} ${month} ${year} ${hours}:${minutes}`
}

function handPoint(angleDeg: number, length: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: 20 + length * Math.cos(rad), y: 20 + length * Math.sin(rad) }
}

function AnalogClockFace({ date }: { date: Date }) {
  const hours = date.getHours() % 12
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  const hourAngle = hours * 30 + minutes * 0.5
  const minuteAngle = minutes * 6
  const secondAngle = seconds * 6

  const hourHand = handPoint(hourAngle, 9)
  const minuteHand = handPoint(minuteAngle, 13)
  const secondHand = handPoint(secondAngle, 15)

  return (
    <svg width="24" height="24" viewBox="0 0 40 40" className="flex-shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="20" x2={hourHand.x} y2={hourHand.y} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="20" x2={minuteHand.x} y2={minuteHand.y} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="20" x2={secondHand.x} y2={secondHand.y} stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
      <circle cx="20" cy="20" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function WorldClock({ className }: WorldClockProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <AnalogClockFace date={now} />
      <span className="font-mono uppercase text-xs tracking-wide">{formatNow(now)}</span>
    </div>
  )
}
