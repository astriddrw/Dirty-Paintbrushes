import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { render } from "@react-email/render";
import NewsletterDigest from "@/emails/NewsletterDigest";
import { buildMonthlyDigest } from "@/lib/newsletter";
import { DEFAULT_EDITOR_NOTE, getEditorNote } from "@/lib/newsletter-slots";

// Reads request.cookies via isAuthorized() — opt out of static rendering
// explicitly, same reasoning as /api/ingest.
export const dynamic = "force-dynamic";

// Same shape as /api/ingest's isAuthorized(): Vercel cron secret, dev
// bypass, or an admin session — so this can also be triggered by hand from
// /admin/newsletter without a second auth mechanism.
async function isAuthorized(request: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${cronSecret}`) return true;
  }

  if (!cronSecret && process.env.NODE_ENV !== "production") return true;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { period, articleCount, ...digest } = await buildMonthlyDigest(supabase);

  const { data: existingIssue } = await supabase
    .from("newsletter_issues")
    .select("id, status, html_content")
    .eq("period", period)
    .maybeSingle();

  if (existingIssue?.status === "sent") {
    return NextResponse.json({ ok: false, error: `${period} was already sent.` }, { status: 409 });
  }

  // Re-generating keeps whatever editor's note was already written.
  const editorNote =
    (existingIssue?.html_content && getEditorNote(existingIssue.html_content)) || DEFAULT_EDITOR_NOTE;
  const html = await render(NewsletterDigest({ ...digest, editorNote }));
  const subject = digest.leadStory
    ? `The Monthly Briefing, ${digest.periodLabel}: ${digest.leadStory.title}`
    : `The Monthly Briefing: Dirty Paintbrushes, ${digest.periodLabel}`;

  if (existingIssue) {
    // Idempotent re-generation: running the cron (or re-triggering by hand)
    // twice for the same period edits the existing draft instead of
    // creating a second one that would silently orphan any edits already
    // made in /admin/newsletter.
    const { error: updateError } = await supabase
      .from("newsletter_issues")
      .update({ subject, html_content: html })
      .eq("id", existingIssue.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, issueId: existingIssue.id, articleCount });
  }

  const { data: issue, error: insertError } = await supabase
    .from("newsletter_issues")
    .insert({ period, status: "draft", subject, html_content: html })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, issueId: issue.id, articleCount });
}
