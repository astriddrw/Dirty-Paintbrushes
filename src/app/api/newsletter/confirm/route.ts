import { NextRequest, NextResponse } from "next/server";
import { forwardToPage, readPostedToken, updateByToken, validToken } from "@/lib/newsletter-tokens";

export const dynamic = "force-dynamic";

// GET never confirms (see src/lib/newsletter-tokens.ts) — it forwards to
// the page with the "Confirm subscription" button.
export function GET(request: NextRequest) {
  return forwardToPage(request, "/newsletter/confirm");
}

export async function POST(request: NextRequest) {
  const token = await readPostedToken(request);
  const ok =
    validToken(token) &&
    (await updateByToken("confirm_token", token, {
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    }));
  const target = ok ? "/newsletter/confirmed" : "/newsletter/confirmed?error=1";
  return NextResponse.redirect(new URL(target, request.url), 303);
}
