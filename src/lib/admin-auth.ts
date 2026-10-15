import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

// "Logged in" is not "admin": anyone can create an account through the
// public magic-link login (/login) to save articles. Admin = a row in
// admin_users, checked through the is_admin() SQL function
// (supabase/migrations.sql §11) — the same rule the database's RLS
// policies use, so the app and the database can't disagree.
//
// getUser() (not getSession()) because it verifies the session with
// Supabase instead of trusting whatever the cookie says.

// no-store: an admin check must never be answered from Next's Data Cache.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

function cookieClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: noStoreFetch },
      cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
    }
  );
}

export async function getAdminUser(request: NextRequest): Promise<User | null> {
  const supabase = cookieClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true ? user : null;
}

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  return (await getAdminUser(request)) !== null;
}

// For routes Vercel cron also calls: the cron secret, the local-dev bypass
// (no secret set, not production), or an admin session.
export async function isCronOrAdmin(request: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") === `Bearer ${cronSecret}`) return true;
  if (!cronSecret && process.env.NODE_ENV !== "production") return true;
  return isAdminRequest(request);
}
