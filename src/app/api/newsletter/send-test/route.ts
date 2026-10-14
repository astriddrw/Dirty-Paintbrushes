import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createResendClient, NEWSLETTER_FROM } from "@/lib/resend";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/emails/NewsletterDigest";

// Reads request.cookies for the admin session — same reasoning as /send.
export const dynamic = "force-dynamic";

// Sends whatever is currently in the /admin/newsletter editor (saved or not)
// to the logged-in admin only. The recipient is never taken from the
// request body, so this can't be used to mail anyone else.
export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const html = typeof body.html === "string" ? body.html : "";
  const subject = typeof body.subject === "string" && body.subject.trim() ? body.subject : "Dirty Paintbrushes";
  if (!html) {
    return NextResponse.json({ error: "Nothing to send — the draft is empty." }, { status: 400 });
  }

  // Test copies get a working-looking unsubscribe link that goes nowhere
  // harmful: the newsletter page, not a real per-subscriber token.
  const siteOrigin = new URL(request.url).origin;
  const { error } = await createResendClient().emails.send({
    from: NEWSLETTER_FROM,
    to: user.email,
    subject: `[TEST] ${subject}`,
    html: html.split(UNSUBSCRIBE_PLACEHOLDER).join(`${siteOrigin}/newsletter`),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
  return NextResponse.json({ ok: true, to: user.email });
}
