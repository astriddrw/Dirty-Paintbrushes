import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Confirm and unsubscribe links in emails open a page with a button
// (/newsletter/confirm, /newsletter/unsubscribe) instead of acting on GET.
// Email security scanners "click" every link in a message to check it, and
// a GET that changed state would let them confirm or unsubscribe people by
// themselves. Only a POST — the button, or Gmail's one-click unsubscribe
// (RFC 8058) — changes anything.

// Tokens are UUIDs; reject anything else before it reaches the database.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validToken(token: string | null | undefined): token is string {
  return typeof token === "string" && UUID_RE.test(token);
}

// Old-style links (emails already sent point at /api/newsletter/...?token=)
// now just forward to the page with the button.
export function forwardToPage(request: NextRequest, pagePath: string) {
  const token = request.nextUrl.searchParams.get("token");
  const url = new URL(pagePath, request.url);
  if (token) url.searchParams.set("token", token);
  return NextResponse.redirect(url, 303);
}

// Token from the query string (one-click unsubscribe puts it in the URL)
// or from the posted form (the page's button).
export async function readPostedToken(request: NextRequest): Promise<string | null> {
  const fromQuery = request.nextUrl.searchParams.get("token");
  if (fromQuery) return fromQuery;
  const form = await request.formData().catch(() => null);
  const fromForm = form?.get("token");
  return typeof fromForm === "string" ? fromForm : null;
}

export async function updateByToken(
  column: "confirm_token" | "unsubscribe_token",
  token: string,
  changes: Record<string, unknown>
): Promise<boolean> {
  const { data, error } = await createAdminClient()
    .from("subscribers")
    .update(changes)
    .eq(column, token)
    .select("id")
    .maybeSingle();
  return !error && !!data;
}
