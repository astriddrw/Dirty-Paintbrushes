interface FadeInHeadingProps {
  className?: string
  children: React.ReactNode
}

// Same fade-in-up treatment as the homepage hero, reused for every page
// title. CSS-driven (see .animate-fade-in-up in globals.css) rather than
// mount-gated on React state, so the title still renders if hydration fails.
export function FadeInHeading({ className, children }: FadeInHeadingProps) {
  return (
    <h1 className={`animate-fade-in-up ${className ?? ""}`}>
      {children}
    </h1>
  )
}
