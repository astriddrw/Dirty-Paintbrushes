import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { FadeInHeading } from "@/components/FadeInHeading"
import { EmailFrame } from "@/components/email-frame"
import { render } from "@react-email/render"
import NewsletterDigest from "@/emails/NewsletterDigest"
import { buildMonthlyDigest } from "@/lib/newsletter"
import { createClient } from "@/lib/supabase/server"
import { getSentIssueHtml, listSentIssues, periodLabel } from "@/lib/newsletter-archive"

// The preview reads the latest sent issue (or builds a sample) per request.
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Newsletter | Dirty Paintbrushes",
  description: "A monthly digest of art market financial crime intelligence, once a month, curated not automated.",
}

// Preview of what subscribers get: the most recent sent issue, or — before
// the first one goes out — a sample built the same way the monthly draft is
// (last month's published stories, or the latest ones if that month was empty).
async function loadPreview() {
  const issues = await listSentIssues()
  if (issues.length > 0) {
    const latest = issues[0]
    const html = await getSentIssueHtml(latest.period)
    if (html) return { kind: "sent" as const, html, latest, past: issues.slice(1) }
  }
  try {
    const digest = await buildMonthlyDigest(createClient(), new Date(), { fallbackToLatest: 8 })
    if (digest.articleCount === 0) return null
    const html = await render(NewsletterDigest({ ...digest, period: undefined }))
    return { kind: "sample" as const, html }
  } catch {
    return null
  }
}

export default async function NewsletterPage() {
  const preview = await loadPreview()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-oxblood mb-6 font-headline">
            Monthly digest
          </FadeInHeading>

          <div className="space-y-4 text-base leading-relaxed text-foreground mb-10">
            <p>
              Once a month, a roundup of what mattered in art market financial crime, grouped by
              case type, reviewed by hand before it goes out.
            </p>
            <p className="text-sm text-muted-foreground">
              No spam, unsubscribe any time.
            </p>
          </div>

          <NewsletterSignup variant="full" />

          {preview && (
            <section className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground font-headline mb-2">
                {preview.kind === "sent" ? "Latest issue" : "Sample issue"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {preview.kind === "sent"
                  ? periodLabel(preview.latest.period)
                  : "Built from recent stories, the same way each monthly issue is."}
              </p>
              <div className="border border-border bg-white">
                <EmailFrame
                  html={preview.html}
                  title={preview.kind === "sent" ? "Latest newsletter issue" : "Sample newsletter issue"}
                  maxHeight={720}
                />
              </div>
              {preview.kind === "sent" && (
                <p className="mt-4 text-sm">
                  <a
                    href={`/newsletter/issues/${preview.latest.period}`}
                    className="underline underline-offset-4 hover:text-oxblood"
                  >
                    Read the full issue
                  </a>
                </p>
              )}
              {preview.kind === "sent" && preview.past.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Past issues</h3>
                  <ul className="space-y-1.5 text-sm">
                    {preview.past.map((issue) => (
                      <li key={issue.period}>
                        <a
                          href={`/newsletter/issues/${issue.period}`}
                          className="underline underline-offset-4 hover:text-oxblood"
                        >
                          {periodLabel(issue.period)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
