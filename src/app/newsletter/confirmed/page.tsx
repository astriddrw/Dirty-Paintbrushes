import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FadeInHeading } from "@/components/FadeInHeading"

export const metadata = {
  title: "Subscribed | Dirty Paintbrushes",
}

export default function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const failed = searchParams.error === "1"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-oxblood mb-6 font-headline">
            {failed ? "Link expired" : "Subscribed"}
          </FadeInHeading>
          <p className="text-base leading-relaxed text-foreground">
            {failed
              ? "That confirmation link is no longer valid. Try subscribing again from the newsletter page."
              : "You're confirmed for the monthly digest. It lands once a month, and you can unsubscribe any time from the link in each issue."}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
