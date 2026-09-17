interface TypewriterHeadingProps {
  text: string
  className?: string
  msPerChar?: number
}

// Renders as complete text immediately (aria-label + SSR markup), then
// reveals character-by-character via CSS animation-delay — no JS, no
// width-based steps() trick to fight with text wrapping.
export function TypewriterHeading({ text, className, msPerChar = 45 }: TypewriterHeadingProps) {
  return (
    <h1 className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.split("").map((char, i) => (
          <span key={i} className="typewriter-char" style={{ animationDelay: `${i * msPerChar}ms` }}>
            {char}
          </span>
        ))}
        <span className="typewriter-cursor">|</span>
      </span>
    </h1>
  )
}
