"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_MS = 30_000;

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
      setTimeout(() => setSubmitted(false), 4000);
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
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          maxLength={2000}
          required
          className="w-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-aged-vellum/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
        />
        {error && <p className="text-xs text-aged-vellum">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="px-5 py-2 bg-white text-indigo text-sm font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? "Sending..." : "Send anonymously"}
          </button>
          {submitted && <span className="text-xs text-aged-vellum">Thanks — received.</span>}
        </div>
      </form>
    </div>
  );
}
