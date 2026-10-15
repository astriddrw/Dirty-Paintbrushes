import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FadeInHeading } from "@/components/FadeInHeading"

// Shared layout for /newsletter/confirm and /newsletter/unsubscribe: the
// email link lands here and nothing changes until the reader presses the
// button (which posts to the API) — see src/lib/newsletter-tokens.ts.
// Same layout as /newsletter/confirmed so the before/after pages match.
export function NewsletterTokenAction({
  token,
  title,
  text,
  action,
  buttonLabel,
}: {
  token: string | undefined
  title: string
  text: string
  action: string
  buttonLabel: string
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-oxblood mb-6 font-headline">
            {token ? title : "Link expired"}
          </FadeInHeading>
          {token ? (
            <>
              <p className="text-base leading-relaxed text-foreground mb-8">{text}</p>
              <form method="post" action={action}>
                <input type="hidden" name="token" value={token} />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo text-background text-sm font-serif italic hover:opacity-80 transition-opacity"
                >
                  {buttonLabel}
                </button>
              </form>
            </>
          ) : (
            <p className="text-base leading-relaxed text-foreground">
              This link is missing its code. Use the link from your email again.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
