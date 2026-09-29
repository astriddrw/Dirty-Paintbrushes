import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { render } from "@react-email/render";
import NewsletterDigest from "@/emails/NewsletterDigest";
import { buildMonthlyDigest } from "@/lib/newsletter";
import { createResendClient, NEWSLETTER_FROM } from "@/lib/resend";

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

// The cron only drafts — nothing goes out until someone presses Send in
// /admin/newsletter — so without a nudge a generated draft can sit unseen.
// Opt-in via NEWSLETTER_ADMIN_EMAIL; a failed nudge never fails the draft.
async function notifyDraftReady(request: NextRequest, periodLabel: string, articleCount: number) {
  const to = process.env.NEWSLETTER_ADMIN_EMAIL;
  if (!to) return;
  const reviewUrl = new URL("/admin/newsletter", request.url).toString();
  try {
    const { error } = await createResendClient().emails.send({
      from: NEWSLETTER_FROM,
      to,
      subject: `${periodLabel} newsletter draft is ready to review`,
      html: `<p>The ${periodLabel} digest has been drafted with ${articleCount} article${articleCount === 1 ? "" : "s"}.</p><p><a href="${reviewUrl}">Review and send it in the admin</a>.</p>`,
    });
    if (error) console.error("[newsletter/generate-draft] draft notification failed:", error.message);
  } catch (err) {
    console.error("[newsletter/generate-draft] draft notification failed:", err);
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { period, periodLabel, groups, articleCount } = await buildMonthlyDigest(supabase);

  const { data: existingIssue } = await supabase
    .from("newsletter_issues")
    .select("id, status")
    .eq("period", period)
    .maybeSingle();

  if (existingIssue?.status === "sent") {
    return NextResponse.json({ ok: false, error: `${period} was already sent.` }, { status: 409 });
  }

  const html = await render(NewsletterDigest({ periodLabel, groups }));
  const subject = `Dirty Paintbrushes, ${periodLabel} Edition`;

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
    await notifyDraftReady(request, periodLabel, articleCount);
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

  await notifyDraftReady(request, periodLabel, articleCount);
  return NextResponse.json({ ok: true, issueId: issue.id, articleCount });
}
