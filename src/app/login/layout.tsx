import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log in | Dirty Paintbrushes",
  description: "Log in to save articles for later on Dirty Paintbrushes.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
