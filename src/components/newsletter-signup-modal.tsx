"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { NewsletterSignup } from "@/components/newsletter-signup";

// Tune the delay here — 5-10s was the requested range, 7s is the default.
export const NEWSLETTER_MODAL_DELAY_MS = 7_000;

// How long, in hours, a shown (or closed, or ignored) modal stays suppressed
// before it's eligible to appear again. 24h is a starting recommendation,
// not a settled decision — flagged for the founder to confirm.
export const NEWSLETTER_MODAL_SUPPRESS_HOURS = 24;

const LAST_SHOWN_KEY = "dpb_newsletter_modal_last_shown";
const SUBSCRIBED_KEY = "dpb_newsletter_subscribed";

export function NewsletterSignupModal() {
  const [open, setOpen] = useState(false);

  // Runs once on mount. Suppression is keyed to when the modal was last
  // *shown*, not to whether it was closed vs. ignored vs. left to time out —
  // so closing it only holds it back for the rest of this window, never
  // permanently, matching the "closing isn't a no" requirement.
  useEffect(() => {
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;

    const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
    if (lastShown) {
      const hoursSince = (Date.now() - Number(lastShown)) / (1000 * 60 * 60);
      if (hoursSince < NEWSLETTER_MODAL_SUPPRESS_HOURS) return;
    }

    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
    }, NEWSLETTER_MODAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 px-6 animate-fade-in-up"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-modal-heading"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md border border-border bg-background p-8"
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-2 right-2 p-3.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs uppercase tracking-wide font-nav font-light text-ochre-on-light mb-2">
          Monthly digest
        </p>
        <h2
          id="newsletter-modal-heading"
          className="text-2xl font-headline font-semibold tracking-tight text-oxblood mb-3"
        >
          Stay briefed
        </h2>
        <p className="text-sm text-foreground leading-relaxed mb-6">
          A monthly roundup of art market financial crime, reviewed by hand before it goes out.
          No spam, unsubscribe any time.
        </p>

        <NewsletterSignup
          variant="full"
          onSubscribed={() => localStorage.setItem(SUBSCRIBED_KEY, "1")}
        />
      </div>
    </div>
  );
}
