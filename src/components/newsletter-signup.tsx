"use client";

import { useId, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Off-screen field people never see or reach by keyboard; bots that fill
// every input fill this too, and the API quietly ignores those sign-ups.
function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Every form that collects an email links the privacy notice (UK GDPR).
function PrivacyLink({ className }: { className: string }) {
  return (
    <p className={`text-xs mt-2 ${className}`}>
      <a href="/privacy" className="underline underline-offset-4 hover:opacity-70 transition-opacity">
        Privacy notice
      </a>
    </p>
  );
}

type Status = "idle" | "submitting" | "sent" | "error";

interface NewsletterSignupProps {
  variant?: "compact" | "full" | "banner";
  onSubscribed?: () => void;
}

export function NewsletterSignup({ variant = "full", onSubscribed }: NewsletterSignupProps) {
  // Every variant relies on the placeholder as its only visual cue, but a
  // placeholder isn't an accessible name once the field has a value — this
  // id backs a visually-hidden real <label> in each variant below.
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // Honeypot — see Honeypot below and /api/newsletter/subscribe.
  const [company, setCompany] = useState("");

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
      body: JSON.stringify({ email, company }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error ?? "Something went wrong. Try again.");
      setStatus("error");
      return;
    }
    setStatus("sent");
    onSubscribed?.();
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
            <label htmlFor={emailId} className="sr-only">
              Email address
            </label>
            <Honeypot value={company} onChange={setCompany} />
            <input
              id={emailId}
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
        <PrivacyLink className="text-aged-vellum" />
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide font-nav font-light text-ochre-on-dark mb-2">
            Monthly digest
          </p>
          <h2 className="text-2xl lg:text-3xl font-serif italic text-aged-vellum">Stay briefed</h2>
        </div>

        {/* Form, error and privacy link stacked as one column so the link
            sits under the form instead of becoming a third flex item. */}
        <div className="w-full lg:w-auto">
          {doneMessage ? (
            <p className="text-sm text-aged-vellum" role="status">
              {doneMessage}
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto lg:min-w-[380px]"
            >
              <label htmlFor={emailId} className="sr-only">
                Email address
              </label>
              <Honeypot value={company} onChange={setCompany} />
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="min-w-0 flex-1 border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-aged-vellum/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="flex-shrink-0 px-5 py-2.5 bg-white text-indigo text-sm font-serif italic hover:opacity-80 disabled:opacity-30 transition-opacity"
              >
                {status === "submitting" ? "…" : "Subscribe"}
              </button>
            </form>
          )}
          {error && <p className="text-xs text-aged-vellum mt-1.5">{error}</p>}
          <PrivacyLink className="text-aged-vellum" />
        </div>
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
          <label htmlFor={emailId} className="sr-only">
            Email address
          </label>
          <Honeypot value={company} onChange={setCompany} />
          <input
            id={emailId}
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
            className="flex-shrink-0 px-5 py-2.5 bg-indigo text-background text-sm font-serif italic hover:opacity-80 disabled:opacity-30 transition-opacity"
          >
            {status === "submitting" ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      <PrivacyLink className="text-muted-foreground" />
    </div>
  );
}
