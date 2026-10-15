import { NewsletterTokenAction } from "@/components/newsletter-token-action"

export const metadata = {
  title: "Confirm subscription | Dirty Paintbrushes",
  robots: { index: false },
}

export default function NewsletterConfirmPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <NewsletterTokenAction
      token={searchParams.token}
      title="Confirm your subscription"
      text="Press the button below to start receiving the monthly digest."
      action="/api/newsletter/confirm"
      buttonLabel="Confirm subscription"
    />
  )
}
