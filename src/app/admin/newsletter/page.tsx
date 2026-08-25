"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Send, Save } from "lucide-react";

interface NewsletterIssue {
  id: string;
  period: string;
  status: "draft" | "sent";
  subject: string | null;
  html_content: string | null;
  created_at: string;
  sent_at: string | null;
}

function periodLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function NewsletterAdminPage() {
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsletterIssue | null>(null);
  const [draftHtml, setDraftHtml] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [busy, setBusy] = useState<"generate" | "save" | "send" | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/newsletter");
    if (res.ok) {
      const { issues: data, confirmedCount: count } = await res.json();
      setIssues(data ?? []);
      setConfirmedCount(count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const select = (issue: NewsletterIssue) => {
    setSelected(issue);
    setDraftHtml(issue.html_content ?? "");
    setDraftSubject(issue.subject ?? "");
    setMessage(null);
  };

  const generateDraft = async () => {
    setBusy("generate");
    setMessage(null);
    const res = await fetch("/api/newsletter/generate-draft");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ kind: "error", text: body.error ?? "Failed to generate draft." });
    } else {
      setMessage({ kind: "ok", text: `Draft generated (${body.articleCount ?? 0} articles).` });
      await fetchIssues();
    }
    setBusy(null);
  };

  const saveDraft = async () => {
    if (!selected) return;
    setBusy("save");
    setMessage(null);
    const res = await fetch("/api/admin/newsletter", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, subject: draftSubject, html_content: draftHtml }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ kind: "error", text: body.error ?? "Failed to save." });
    } else {
      setMessage({ kind: "ok", text: "Saved." });
      await fetchIssues();
    }
    setBusy(null);
  };

  const sendIssue = async () => {
    if (!selected) return;
    if (!window.confirm(`Send this issue to ${confirmedCount} confirmed subscriber(s)? This can't be undone.`)) {
      return;
    }
    setBusy("send");
    setMessage(null);
    const res = await fetch("/api/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId: selected.id }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage({ kind: "error", text: body.error ?? "Failed to send." });
    } else {
      setMessage({ kind: "ok", text: `Sent to ${body.sent} subscriber(s).` });
      setSelected(null);
      await fetchIssues();
    }
    setBusy(null);
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif mb-1">Newsletter</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${confirmedCount} confirmed subscriber${confirmedCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={generateDraft}
          disabled={busy !== null}
          className="flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-medium hover:bg-secondary disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={busy === "generate" ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Generate draft for last month
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Issue list */}
        <div className="divide-y divide-border border-t border-b border-border">
          {!loading && issues.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">No issues yet.</p>
          )}
          {issues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => select(issue)}
              className={`w-full text-left py-3 px-1 text-sm transition-colors ${
                selected?.id === issue.id ? "text-oxblood font-medium" : "text-foreground hover:text-oxblood"
              }`}
            >
              <div>{periodLabel(issue.period)}</div>
              <span className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground mt-1 inline-block">
                {issue.status}
              </span>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div>
          {!selected && (
            <div className="border border-border p-12 text-center">
              <p className="text-muted-foreground text-sm">Select an issue to review.</p>
            </div>
          )}

          {selected && (
            <div className="space-y-4">
              {message && (
                <div
                  className={`border p-3 text-sm ${
                    message.kind === "error"
                      ? "border-destructive/40 bg-destructive/5 text-destructive"
                      : "border-border bg-secondary text-foreground"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Subject</label>
                <input
                  type="text"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  disabled={selected.status === "sent"}
                  className="w-full border border-border px-3 py-2 text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">HTML content</label>
                <textarea
                  value={draftHtml}
                  onChange={(e) => setDraftHtml(e.target.value)}
                  disabled={selected.status === "sent"}
                  rows={20}
                  className="w-full border border-border px-3 py-2.5 text-xs font-mono bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y disabled:opacity-50"
                />
              </div>

              {selected.status === "draft" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveDraft}
                    disabled={busy !== null}
                    className="flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-medium hover:bg-secondary disabled:opacity-40 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save
                  </button>
                  <button
                    onClick={sendIssue}
                    disabled={busy !== null || confirmedCount === 0}
                    title={confirmedCount === 0 ? "No confirmed subscribers yet" : undefined}
                    className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-medium hover:opacity-80 disabled:opacity-30 transition-opacity"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send to {confirmedCount} subscriber{confirmedCount !== 1 ? "s" : ""}
                  </button>
                </div>
              )}

              {selected.status === "sent" && selected.sent_at && (
                <p className="text-xs text-muted-foreground">
                  Sent {new Date(selected.sent_at).toLocaleString("en-GB")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
