"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
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

export default function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
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
      .then(({ data }) => setComments((data ?? []) as Comment[]));
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({ article_id: articleId, display_name: displayName.trim(), body: body.trim() })
      .select()
      .single();

    if (insertError) {
      setError("Failed to post comment. Please try again.");
    } else if (data) {
      setComments((prev) => [...prev, data as Comment]);
      setBody("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-14 pt-10 border-t border-border">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">
          Discussion{comments.length > 0 ? ` (${comments.length})` : ""}
        </h2>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-8 max-w-md">
        Comments reflect individual views and do not constitute verified intelligence.
      </p>

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
          <label className="block text-xs text-muted-foreground mb-1.5">Comment</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add analysis, flag connections, or share context..."
            rows={4}
            maxLength={2000}
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
          {submitted && <span className="text-xs text-muted-foreground">Posted.</span>}
        </div>
      </form>
    </div>
  );
}
