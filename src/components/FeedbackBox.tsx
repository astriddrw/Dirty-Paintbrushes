"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_MS = 30_000;
const MESSAGE_MAX = 2000;

export function FeedbackBox() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (lastSubmitted && Date.now() - lastSubmitted < COOLDOWN_MS) {
      const secs = Math.ceil((COOLDOWN_MS - (Date.now() - lastSubmitted)) / 1000);
      setError(`Please wait ${secs}s before submitting again.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("feedback")
      .insert({ message: message.trim() });

    if (insertError) {
      setError("Failed to submit. Please try again.");
    } else {
      setMessage("");
      setLastSubmitted(Date.now());
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-16 bg-indigo p-6 lg:p-8">
      <h2 className="text-sm font-semibold text-white mb-1">Have feedback?</h2>
      <p className="text-xs text-aged-vellum mb-5 leading-relaxed">
        Submit anonymously — no name or account required.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            maxLength={MESSAGE_MAX}
            required
            className="w-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-aged-vellum/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
          />
          <p className="text-xs text-aged-vellum/50 text-right mt-1">
            {message.length}/{MESSAGE_MAX}
          </p>
        </div>
        {error && <p className="text-xs text-aged-vellum">{error}</p>}
        <div className="flex items-center gap-3 min-h-8">
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="px-5 py-2 bg-white text-indigo text-sm font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? "Sending..." : "Send anonymously"}
          </button>
          {submitted && (
            <span
              role="status"
              className="flex items-center gap-1.5 text-xs text-aged-vellum animate-fade-in-up"
            >
              <Check className="h-3.5 w-3.5 text-ochre-on-dark" aria-hidden="true" />
              Thank you — I read every one of these.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
