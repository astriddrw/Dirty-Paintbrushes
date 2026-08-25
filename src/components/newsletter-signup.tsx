"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "sent" | "error";

interface NewsletterSignupProps {
  variant?: "compact" | "full";
}

export function NewsletterSignup({ variant = "full" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setError(null);

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error ?? "Something went wrong. Try again.");
      setStatus("error");
      return;
    }
    setStatus("sent");
  };

  const doneMessage = status === "sent" ? "Check your inbox to confirm." : null;

  if (variant === "compact") {
    return (
      <div>
        <p className="text-sm font-serif font-semibold text-aged-vellum mb-2">Monthly digest</p>
        {doneMessage ? (
          <p className="text-xs text-aged-vellum">{doneMessage}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-stretch gap-2 max-w-xs">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="min-w-0 flex-1 border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-aged-vellum/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="flex-shrink-0 px-3 py-2 bg-white text-indigo text-xs font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
            >
              {status === "submitting" ? "…" : "Subscribe"}
            </button>
          </form>
        )}
        {error && <p className="text-xs text-aged-vellum mt-1.5">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      {doneMessage ? (
        <p className="text-sm text-foreground" role="status">
          {doneMessage}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 max-w-md">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="min-w-0 flex-1 border border-border px-3.5 py-2.5 text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="flex-shrink-0 px-5 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
          >
            {status === "submitting" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
