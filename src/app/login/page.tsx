"use client"

import { useId, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/saved"
  const emailId = useId()

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
    <main className="flex-1 flex flex-col items-center justify-center px-6 lg:px-8 py-16 lg:py-20 text-center">
      <p
        className="text-2xl lg:text-3xl font-body text-indigo leading-snug max-w-md mb-8 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        Want to save articles for later?
        <br />
        Log in to get started.
      </p>

      <img
        src="/archive-box.png"
        alt=""
        aria-hidden="true"
        className="w-44 lg:w-56 h-auto mb-10 animate-fade-in-up"
        style={{ animationDelay: "250ms" }}
      />

      <div
        className="w-full max-w-sm bg-indigo p-8 text-left animate-fade-in-up"
        style={{ animationDelay: "400ms" }}
      >
        <h1 className="text-2xl font-semibold text-aged-vellum mb-2">Log in</h1>

        {sent ? (
          <p className="text-sm text-aged-vellum leading-relaxed">
            Check your inbox. We sent a login link to <span className="text-white">{email}</span>.
          </p>
        ) : (
          <>
            <p className="text-sm text-aged-vellum mb-8 leading-relaxed">
              We&apos;ll email you a link, no password needed.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor={emailId} className="block text-xs text-aged-vellum mb-1.5">
                  Email
                </label>
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-aged-vellum/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </div>
              {error && <p className="text-xs text-aged-vellum">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full py-2.5 bg-white text-indigo text-sm font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
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
    <div className="min-h-screen flex flex-col bg-light-blue">
      <Navigation />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <Footer />
    </div>
  )
}
