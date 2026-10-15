import type { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FadeInHeading } from "@/components/FadeInHeading"
import { CONTACT_EMAIL } from "@/lib/contact"

export const metadata: Metadata = {
  title: "Privacy | Dirty Paintbrushes",
  description: "What personal information Dirty Paintbrushes collects, why, and your rights over it.",
}

// Written from what the code actually does (newsletter + double opt-in,
// magic-link accounts for saved articles, moderated comments, anonymous
// feedback, localStorage keys, third-party processors). If a feature
// changes what it collects, update this page in the same change.

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground font-headline">{title}</h2>
      {children}
    </section>
  )
}

export default function PrivacyPage() {
  const mail = (
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-oxblood">
      {CONTACT_EMAIL}
    </a>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          <FadeInHeading className="text-4xl lg:text-5xl font-semibold tracking-tight text-oxblood mb-4 font-headline">
            Privacy notice
          </FadeInHeading>
          <p className="text-sm text-muted-foreground mb-10">Last updated 15 October 2026</p>

          <div className="space-y-10 text-base leading-relaxed text-foreground">
            <Section title="Who we are">
              <p>
                Dirty Paintbrushes (dirtypaintbrushes.com) is an independent platform and is responsible for the
                personal information described here. For any privacy question or request, email {mail}.
              </p>
            </Section>

            <Section title="What we collect and why">
              <p>
                <strong>Newsletter.</strong> If you subscribe, we store your email address, whether you have
                confirmed or unsubscribed, and when. We use it only to send the monthly newsletter and the
                emails needed to confirm or end your subscription. We rely on your consent, which you give by
                confirming your subscription and can withdraw at any time using the unsubscribe link in every
                issue.
              </p>
              <p>
                <strong>Accounts.</strong> If you log in to save articles, we store your email address and the
                list of articles you have saved. We use it only to log you in and show your saved articles.
              </p>
              <p>
                <strong>Comments.</strong> If you comment on an article, we store the display name you choose
                and your comment. Comments are reviewed before they appear, and published comments are visible
                to everyone. Please don&apos;t include personal details you don&apos;t want made public.
              </p>
              <p>
                <strong>Feedback.</strong> The feedback form is anonymous: we store only the message you write.
              </p>
              <p>
                <strong>Emails to us.</strong> If you email {mail}, we use your message and address only to
                reply.
              </p>
              <p>
                <strong>Technical data.</strong> Like any website, our hosting provider records technical
                information such as IP addresses and browser type, to keep the site running and secure.
              </p>
              <p>
                For accounts, comments, emails and technical data, we rely on our legitimate interest in running
                the site and providing the features you choose to use.
              </p>
            </Section>

            <Section title="Cookies and browser storage">
              <p>
                We don&apos;t use advertising or analytics cookies. If you log in, a cookie keeps you logged in.
                Your browser&apos;s local storage also remembers articles you saved before logging in, and when we
                last showed you the newsletter pop-up, so it doesn&apos;t keep reappearing. These are needed for
                the site to work as you&apos;d expect, so we don&apos;t ask for consent for them.
              </p>
            </Section>

            <Section title="Who else handles your information">
              <p>We don&apos;t sell your information or use it for advertising. We use these services to run the site:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Supabase: database and log-ins</li>
                <li>Vercel: website hosting</li>
                <li>Resend: sending the newsletter and confirmation emails</li>
                <li>Cloudflare: domain and email forwarding</li>
                <li>Google (Gmail): the inbox that receives emails sent to {CONTACT_EMAIL}</li>
                <li>unpkg: delivers a small piece of code for smooth scrolling, so it sees your IP address</li>
              </ul>
              <p>
                Some of these providers store or process data outside the UK, including in the United States.
                Where they do, they use safeguards recognised under UK data protection law.
              </p>
            </Section>

            <Section title="How long we keep it">
              <p>
                We keep your newsletter subscription until you unsubscribe. After that we keep your address
                marked as unsubscribed so we don&apos;t email you again by mistake; ask us if you&apos;d like it
                deleted entirely. We keep account details and saved articles until you ask us to delete them,
                and comments and feedback for as long as they&apos;re relevant to the site.
              </p>
            </Section>

            <Section title="Your rights">
              <p>
                You can ask to see the information we hold about you, correct it, delete it, or object to how we
                use it, and you can withdraw consent at any time. Email {mail} and we&apos;ll respond within one
                month. If you&apos;re unhappy with how we handle your information, you can complain to the
                Information Commissioner&apos;s Office at{" "}
                <a
                  href="https://ico.org.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-oxblood"
                >
                  ico.org.uk
                </a>
                .
              </p>
            </Section>

            <Section title="Changes">
              <p>If we change how we use your information, we&apos;ll update this page and the date above.</p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
