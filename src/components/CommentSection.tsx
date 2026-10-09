"use client";

import { useId, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Comment } from "@/lib/types";

interface CommentSectionProps {
  articleId: string;
}

function formatCommentDate(ds: string): string {
  return new Date(ds).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const COOLDOWN_MS = 30_000; // 30 seconds between submissions
const BODY_MAX = 2000;

export default function CommentSection({ articleId }: CommentSectionProps) {
  const displayNameId = useId();
  const bodyId = useId();
  const [comments, setComments] = useState<Comment[]>([]);
  const [lastSubmitted, setLastSubmitted] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        // status is undefined until the moderation migration runs — treat
        // that as "visible" so existing behavior doesn't regress, and only
        // hide comments explicitly marked pending/rejected once it has.
        const visible = ((data ?? []) as Comment[]).filter(
          (c) => c.status !== "pending" && c.status !== "rejected"
        );
        setComments(visible);
      });
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !body.trim()) return;

    // Client-side cooldown
    if (lastSubmitted && Date.now() - lastSubmitted < COOLDOWN_MS) {
      const secs = Math.ceil((COOLDOWN_MS - (Date.now() - lastSubmitted)) / 1000);
      setError(`Please wait ${secs}s before posting again.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("comments")
      .insert({ article_id: articleId, display_name: displayName.trim(), body: body.trim() });

    if (insertError) {
      setError("Failed to post comment. Please try again.");
    } else {
      // Not appended to the visible list — new comments are pending review
      // once the moderation migration is live, so an optimistic add would
      // show something to the submitter that no one else can see yet.
      setDisplayName("");
      setBody("");
      setLastSubmitted(Date.now());
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
    setSubmitting(false);
  };

  return (
    // Breaks out of the article page's max-w-3xl column to the full
    // viewport width — the same indigo field the homepage hero uses —
    // via the single-property full-bleed trick (width: 100vw anchored by
    // a negative margin-left computed against the viewport, not the
    // parent), then re-centers a max-w-3xl column of content inside it.
    // -mb-12 lg:-mb-16 cancels the parent <main>'s own bottom padding
    // (py-12 lg:py-16), which would otherwise leave a strip of parchment
    // showing between this indigo block and the footer below it.
    <div
      className="relative mt-14 -mb-12 lg:-mb-16 bg-indigo text-aged-vellum animate-fade-in-up"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", animationDelay: "300ms" }}
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-10 lg:py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-aged-vellum/70 mb-4">
        Discussion{comments.length > 0 ? ` (${comments.length})` : ""}
      </p>

      <div className="border border-white/20 bg-white/10 px-4 py-3 mb-8 max-w-md">
        <p className="text-xs text-aged-vellum leading-relaxed">
          Comments reflect individual views and do not constitute verified intelligence. New
          comments are reviewed before they appear publicly.
        </p>
      </div>

      {comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-white/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-aged-vellum">{comment.display_name}</span>
                <span className="text-xs text-aged-vellum/60">{formatCommentDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-aged-vellum/80 leading-relaxed">{comment.body}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={displayNameId} className="block text-xs text-aged-vellum mb-1.5">
            Display name
          </label>
          <input
            id={displayNameId}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Anonymous researcher"
            maxLength={80}
            required
            className="w-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-aged-vellum/60 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={bodyId} className="block text-xs text-aged-vellum">
              Comment
            </label>
            <span className="text-xs text-aged-vellum/60">
              {body.length}/{BODY_MAX}
            </span>
          </div>
          <textarea
            id={bodyId}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add analysis, flag connections, or share context..."
            rows={4}
            maxLength={BODY_MAX}
            required
            className="w-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-aged-vellum/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
          />
        </div>
        {error && <p className="text-xs text-aged-vellum">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !displayName.trim() || !body.trim()}
            className="px-6 py-2.5 bg-white text-indigo text-sm font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
          {submitted && (
            <span className="text-xs text-aged-vellum/80">
              Thanks. Your comment is awaiting review and will appear once approved.
            </span>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}
