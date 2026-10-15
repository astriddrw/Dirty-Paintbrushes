import { NextRequest, NextResponse } from "next/server";
import { forwardToPage, readPostedToken, updateByToken, validToken } from "@/lib/newsletter-tokens";

export const dynamic = "force-dynamic";

// GET never unsubscribes (see src/lib/newsletter-tokens.ts) — it forwards
// to the page with the "Unsubscribe" button.
export function GET(request: NextRequest) {
  return forwardToPage(request, "/newsletter/unsubscribe");
}

// Two callers: the page's button (form post → redirect to the result page),
// and Gmail/Apple Mail's one-click unsubscribe, which posts the body
// "List-Unsubscribe=One-Click" to the List-Unsubscribe URL in each issue's
// headers (src/app/api/newsletter/send) and only needs a 200.
export async function POST(request: NextRequest) {
  const isOneClick = (await request.clone().text().catch(() => "")).includes("List-Unsubscribe=One-Click");
  const token = await readPostedToken(request);
  const ok = validToken(token) && (await updateByToken("unsubscribe_token", token, { status: "unsubscribed" }));

  if (isOneClick) {
    return new NextResponse(ok ? "Unsubscribed" : "Invalid link", { status: ok ? 200 : 400 });
  }
  const target = ok ? "/newsletter/unsubscribed" : "/newsletter/unsubscribed?error=1";
  return NextResponse.redirect(new URL(target, request.url), 303);
}
