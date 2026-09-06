"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useModalFocusTrap } from "@/lib/use-modal-focus-trap";

interface LoginPromptModalProps {
  // The path (with query string) to return to after logging in. Presence of
  // a non-null value is what controls whether the modal is open — callers
  // don't need a separate open/next pair to keep in sync.
  next: string | null;
  onClose: () => void;
}

export function LoginPromptModal({ next, onClose }: LoginPromptModalProps) {
  const open = next !== null;
  const dialogRef = useModalFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 px-6 animate-fade-in-up"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-heading"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm border border-border bg-background p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 p-3.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-xs uppercase tracking-wide font-nav font-light text-ochre-on-light mb-2">
          Save articles
        </p>
        <h2
          id="login-prompt-heading"
          className="text-2xl font-headline font-semibold tracking-tight text-oxblood mb-3"
        >
          Log in to save
        </h2>
        <p className="text-sm text-foreground leading-relaxed mb-6">
          Create a free account, no password needed, to save articles and pick up where you left
          off on any device.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="px-5 py-2.5 bg-indigo text-background text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Log in
          </Link>
          <button
            onClick={onClose}
            className="px-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
