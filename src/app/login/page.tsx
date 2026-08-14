"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/saved"

  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get("error"))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    setSent(true)
    setSubmitting(false)
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 lg:px-8 py-16">
      <div className="w-full max-w-sm border border-border p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Log in</h1>

        {sent ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Check your inbox — we sent a login link to <span className="text-foreground">{email}</span>.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              We&apos;ll email you a link — no password needed. Logging in syncs your saved articles
              across devices.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="input"
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                {submitting ? "Sending…" : "Send login link"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <Footer />
    </div>
  )
}
