import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient } from "@/lib/resend";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/emails/NewsletterDigest";

// Reads request.cookies via requireSession() — opt out of static rendering
// explicitly, same reasoning as /api/ingest.
export const dynamic = "force-dynamic";

// No CRON_SECRET path here, unlike generate-draft — sending is the one
// irreversible step in the flow and stays a deliberate, logged-in action.
async function requireSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Resend's batch endpoint takes up to 100 distinct payloads per call, so
// this stays correct well past the "a few hundred subscribers" point where
// a naive per-subscriber loop would start tripping per-second rate limits.
const BATCH_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function POST(request: NextRequest) {
  if (!(await requireSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const issueId = typeof body.issueId === "string" ? body.issueId : null;
  if (!issueId) {
    return NextResponse.json({ error: "Body must include `issueId`." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: issue, error: issueError } = await supabase
    .from("newsletter_issues")
    .select("*")
    .eq("id", issueId)
    .single();

  if (issueError || !issue) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }
  if (issue.status === "sent") {
    return NextResponse.json({ error: "This issue has already been sent." }, { status: 400 });
  }
  if (!issue.html_content) {
    return NextResponse.json({ error: "This issue has no content to send." }, { status: 400 });
  }

  const { data: subscribers, error: subscribersError } = await supabase
    .from("subscribers")
    .select("email, unsubscribe_token")
    .eq("status", "confirmed");

  if (subscribersError) {
    return NextResponse.json({ error: subscribersError.message }, { status: 500 });
  }
  if (!subscribers?.length) {
    return NextResponse.json({ error: "No confirmed subscribers to send to." }, { status: 400 });
  }

  const siteOrigin = new URL(request.url).origin;
  const resend = createResendClient();
  let sent = 0;

  for (const batch of chunk(subscribers, BATCH_SIZE)) {
    const payload = batch.map((sub) => {
      const unsubscribeUrl = `${siteOrigin}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`;
      return {
        from: "Dirty Paintbrushes <news@dirtypaintbrushes.com>",
        to: sub.email,
        subject: issue.subject ?? "Dirty Paintbrushes",
        html: issue.html_content!.split(UNSUBSCRIBE_PLACEHOLDER).join(unsubscribeUrl),
      };
    });

    const { error: sendError } = await resend.batch.send(payload);
    if (sendError) {
      return NextResponse.json({ error: sendError.message, sent }, { status: 502 });
    }
    sent += batch.length;
  }

  const { error: updateError } = await supabase
    .from("newsletter_issues")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", issueId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message, sent }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent });
}
