import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl lg:text-5xl font-normal tracking-tight text-foreground mb-12 font-serif">
            Why Dirty Paintbrushes?
          </h1>

          {/* Content */}
          <div className="space-y-6 text-base leading-relaxed text-foreground">
            <p>
              The art market is a sector that has long been overlooked from a regulatory perspective. It is highly opaque and inherently cross-border, which makes it particularly vulnerable to fraud, tax evasion, sanctions circumvention, and in some cases, the financing of criminal networks.
            </p>

            <p>
              Dirty Paintbrushes started as a research question. How can something as cultural and subjective as art be used to move and obscure illicit finance?
            </p>

            <p>
              While studying International Relations at King&apos;s College London, I focused on financial crime and non-traditional assets. During my exchange at Georgetown University, I developed a research paper titled &ldquo;Dirty Paintbrushes: The Use of the Art Market in Financing Terrorist Activity&rdquo;, looking at recent case studies in the UK and US, from NFTs to antiquities.
            </p>

            <p>
              That work led me to focus more closely on the art market as a financial crime risk area, and made it clear how fragmented this space is. Information is difficult to track, often reactive, and rarely brought together in one place.
            </p>

            <p>
              This platform is a way to collate and follow developments at the intersection of the art market and financial crime. It is designed for anyone interested in this space who wants a clearer, more efficient way to stay informed. You can also use the comment feature to add analysis, flag connections, and interact with others following this area.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
