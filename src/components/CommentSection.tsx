"use client";

import { useState, useEffect } from "react";
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
    <div className="mt-14 pt-10 border-t border-border">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Discussion{comments.length > 0 ? ` (${comments.length})` : ""}
      </p>

      <div className="border border-border bg-secondary px-4 py-3 mb-8 max-w-md">
        <p className="text-xs text-foreground leading-relaxed">
          Comments reflect individual views and do not constitute verified intelligence. New
          comments are reviewed before they appear publicly.
        </p>
      </div>

      {comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">{comment.display_name}</span>
                <span className="text-xs text-muted-foreground">{formatCommentDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{comment.body}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Anonymous researcher"
            maxLength={80}
            required
            className="w-full border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs text-muted-foreground">Comment</label>
            <span className="text-xs text-muted-foreground">
              {body.length}/{BODY_MAX}
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add analysis, flag connections, or share context..."
            rows={4}
            maxLength={BODY_MAX}
            required
            className="w-full border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !displayName.trim() || !body.trim()}
            className="px-6 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
          {submitted && (
            <span className="text-xs text-muted-foreground">
              Thanks — your comment is awaiting review and will appear once approved.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
