import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FeedbackBox } from "@/components/FeedbackBox"
import { TypewriterHeading } from "@/components/TypewriterHeading"

const paragraphs = [
  "The art market is a sector that has long been overlooked from a regulatory perspective. It is highly opaque and inherently cross-border, which makes it particularly vulnerable to fraud, tax evasion, sanctions circumvention, and in some cases, the financing of criminal networks.",
  "Dirty Paintbrushes started as a research question. How can something as cultural and subjective as art be used to move and obscure illicit finance?",
  "While studying International Relations at King's College London, I focused on financial crime and non-traditional assets. During my exchange at Georgetown University, I developed a research paper titled “Dirty Paintbrushes: The Use of the Art Market in Financing Terrorist Activity”, looking at recent case studies in the UK and US, from NFTs to antiquities.",
  "That work led me to focus more closely on the art market as a financial crime risk area, and made it clear how fragmented this space is. Information is difficult to track, often reactive, and rarely brought together in one place.",
  "This platform is a way to collate and follow developments at the intersection of the art market and financial crime. It is designed for anyone interested in this space who wants a clearer, more efficient way to stay informed. You can also use the comment feature to add analysis, flag connections, and interact with others following this area.",
]

// Title types in over ~1s (23 chars * 45ms); paragraphs start fading
// in right after so the page doesn't feel like it's waiting on the
// heading to finish before anything else happens.
const TITLE_MS_PER_CHAR = 70
const TITLE_DURATION_MS = "Why Dirty Paintbrushes?".length * TITLE_MS_PER_CHAR

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="mx-auto" style={{ maxWidth: 1040 }}>
          {/* Sized big enough that the existing copy, at its existing
              font sizes, reads comfortably — not shrunk to fit a small
              prop. */}
          <div>
            {/* The cream strip is sized/positioned to match the
                photographed paper's own width within the image below —
                measured directly off the image's top row (67.0%, inset
                19.0% left / 14.0% right), not guessed from the photo's
                overall bounding box, which is wider lower down near the
                rollers — so its edges land exactly on the photo's paper
                edges instead of the machine's shoulders. */}
            <div
              className="bg-secondary"
              style={{
                marginLeft: "19.0%",
                marginRight: "14.0%",
                padding: "48px 6% 28px",
              }}
            >
              <TypewriterHeading
                text="Why Dirty Paintbrushes?"
                msPerChar={TITLE_MS_PER_CHAR}
                className="text-4xl lg:text-5xl font-semibold tracking-tight text-oxblood mb-10 font-headline"
              />

              <div className="space-y-6 leading-relaxed text-foreground" style={{ fontSize: 15 }}>
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${TITLE_DURATION_MS + i * 150}ms` }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <img
              src="/about/typewriter.png"
              alt=""
              aria-hidden="true"
              className="block w-full h-auto"
            />
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-foreground mt-8">
              <a
                href="https://www.linkedin.com/in/astrid-de-rohan-willner/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-1 underline-offset-4 hover:text-indigo hover:decoration-indigo transition-colors"
              >
                Astrid de Rohan Willner
              </a>
            </p>

            <FeedbackBox />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
