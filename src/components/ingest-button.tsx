"use client";

import { useState } from "react";
import { RefreshCw, Wrench } from "lucide-react";

interface IngestResult {
  ok: boolean;
  processed: number;
  saved: number;
  skipped: number;
  errors: string[];
}

interface CleanupResult {
  ok: boolean;
  decoded: number;
  urlsCleaned: number;
  deleted: number;
  errors: string[];
}

export function IngestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [cleanupError, setCleanupError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/ingest");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ingestion failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    if (!confirm("This will decode HTML entities, clean Google URLs, and delete irrelevant articles. Continue?")) return;
    setCleanupLoading(true);
    setCleanupResult(null);
    setCleanupError(null);
    try {
      const res = await fetch("/api/cleanup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cleanup failed");
      setCleanupResult(data);
    } catch (e) {
      setCleanupError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Ingest */}
      <div className="flex flex-col gap-3">
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-medium hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Running…" : "Run Feed Ingestion"}
        </button>
        {result && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>✓ {result.saved} saved · {result.skipped} skipped · {result.processed} processed</p>
            {result.errors.length > 0 && (
              <p className="text-destructive">{result.errors.length} feed error(s)</p>
            )}
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {/* Cleanup */}
      <div className="flex flex-col gap-3">
        <button
          onClick={runCleanup}
          disabled={cleanupLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40 transition-colors"
        >
          <Wrench className={`h-3.5 w-3.5 ${cleanupLoading ? "animate-spin" : ""}`} />
          {cleanupLoading ? "Running…" : "Run Data Cleanup"}
        </button>
        <p className="text-xs text-muted-foreground">Decodes HTML entities, fixes Google URLs, removes irrelevant articles.</p>
        {cleanupResult && (
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>✓ {cleanupResult.decoded} titles decoded · {cleanupResult.urlsCleaned} URLs fixed · {cleanupResult.deleted} deleted</p>
            {cleanupResult.errors.length > 0 && (
              <p className="text-destructive">{cleanupResult.errors.length} error(s)</p>
            )}
          </div>
        )}
        {cleanupError && <p className="text-xs text-destructive">{cleanupError}</p>}
      </div>
    </div>
  );
}
