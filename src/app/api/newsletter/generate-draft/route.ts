import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { render } from "@react-email/render";
import NewsletterDigest from "@/emails/NewsletterDigest";
import { buildMonthlyDigest } from "@/lib/newsletter";
import { DEFAULT_EDITOR_NOTE, getEditorNote } from "@/lib/newsletter-slots";
import { isCronOrAdmin } from "@/lib/admin-auth";

// Reads request.cookies via isCronOrAdmin() — opt out of static rendering
// explicitly, same reasoning as /api/ingest.
export const dynamic = "force-dynamic";

// isCronOrAdmin() (src/lib/admin-auth.ts): Vercel cron secret, dev
// bypass, or an admin session — so this can also be triggered by hand from
// /admin/newsletter without a second auth mechanism.

export async function GET(request: NextRequest) {
  if (!(await isCronOrAdmin(request))) {
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
  const html = await render(NewsletterDigest({ ...digest, editorNote, period }));
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
