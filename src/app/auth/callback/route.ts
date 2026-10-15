import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// `next` arrives from the login link's query string, so it must only ever
// be a path on this site — "//evil.com" or "https://evil.com" would
// otherwise send someone off-site straight after a genuine login. The final
// origin comparison also catches browser URL-parsing tricks (tabs, newlines
// and backslashes that turn "/\t/evil.com" into "//evil.com").
function safeNextPath(next: string | null, origin: string): string {
  if (!next || !next.startsWith("/")) return "/saved";
  try {
    const resolved = new URL(next, origin);
    if (resolved.origin !== origin) return "/saved";
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/saved";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), origin);

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL(`/login?error=Could not log you in. Try again.`, origin));
}
