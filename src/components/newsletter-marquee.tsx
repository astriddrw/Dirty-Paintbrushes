const REPEAT_COUNT = 8

function MarqueeTrack() {
  return (
    <span className="flex items-center whitespace-nowrap pr-4">
      {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
        <span key={i} className="flex items-center font-serif italic text-base lg:text-lg text-oxblood">
          <span className="mx-2">Monthly Digest</span>
          <span className="inline-block translate-y-[0.15em]">*</span>
          <span className="mx-2">Stay Briefed</span>
          <span className="inline-block translate-y-[0.15em]">*</span>
        </span>
      ))}
    </span>
  )
}

// Sits directly above the oxblood newsletter banner as a quiet, decorative
// lead-in — an endless-scrolling strip, not another CTA, so it stays
// aria-hidden and the real "Monthly digest / Stay briefed" copy in the
// banner below remains the one thing screen readers announce.
export function NewsletterMarquee() {
  return (
    <div className="overflow-hidden bg-background py-2" aria-hidden="true">
      <div className="flex w-max animate-marquee">
        <MarqueeTrack />
        <MarqueeTrack />
      </div>
    </div>
  )
}
