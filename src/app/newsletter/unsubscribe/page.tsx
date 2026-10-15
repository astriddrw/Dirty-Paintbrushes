import { NewsletterTokenAction } from "@/components/newsletter-token-action"

export const metadata = {
  title: "Unsubscribe | Dirty Paintbrushes",
  robots: { index: false },
}

export default function NewsletterUnsubscribePage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <NewsletterTokenAction
      token={searchParams.token}
      title="Unsubscribe"
      text="Press the button below to stop receiving the monthly digest."
      action="/api/newsletter/unsubscribe"
      buttonLabel="Unsubscribe"
    />
  )
}
