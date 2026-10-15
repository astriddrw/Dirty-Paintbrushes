import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, NEWSLETTER_FROM, NEWSLETTER_REPLY_TO } from "@/lib/resend";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/emails/NewsletterDigest";
import { isAdminRequest } from "@/lib/admin-auth";
import { CONTACT_EMAIL } from "@/lib/contact";

// Reads request.cookies via isAdminRequest() — opt out of static rendering
// explicitly, same reasoning as /api/ingest.
export const dynamic = "force-dynamic";

// No CRON_SECRET path here, unlike generate-draft — sending is the one
// irreversible step in the flow and stays a deliberate, logged-in action.

// Resend's batch endpoint takes up to 100 distinct payloads per call, so
// this stays correct well past the "a few hundred subscribers" point where
// a naive per-subscriber loop would start tripping per-second rate limits.
const BATCH_SIZE = 100;

// A send that died part-way (timeout, Resend error) leaves its lock behind;
// after this long another attempt may take over.
const STALE_LOCK_MS = 15 * 60 * 1000;

// Supabase returns at most 1,000 rows per request — page through so the
// send doesn't silently stop at subscriber 1,000.
async function fetchAll<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await query(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) return rows;
  }
}

async function releaseLock(supabase: SupabaseClient, issueId: string) {
  await supabase.from("newsletter_issues").update({ sending_started_at: null }).eq("id", issueId);
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
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

  // Only one send per issue at a time (double-click, two tabs). A lock
  // younger than STALE_LOCK_MS means a send is in progress.
  const previousLock: string | null = issue.sending_started_at ?? null;
  if (previousLock && Date.now() - new Date(previousLock).getTime() < STALE_LOCK_MS) {
    return NextResponse.json(
      { error: "This issue is already being sent. Wait a few minutes, then refresh." },
      { status: 409 }
    );
  }
  // Take the lock only if nobody else took it since we read the issue.
  // (Deliberately not .or(): PostgREST re-applies .or() filters to the
  // returned rows, which breaks this kind of update.)
  let lock = supabase
    .from("newsletter_issues")
    .update({ sending_started_at: new Date().toISOString() })
    .eq("id", issueId)
    .eq("status", "draft");
  lock = previousLock ? lock.eq("sending_started_at", previousLock) : lock.is("sending_started_at", null);
  const { data: locked, error: lockError } = await lock.select("id");
  if (lockError) {
    return NextResponse.json({ error: lockError.message }, { status: 500 });
  }
  if (!locked?.length) {
    return NextResponse.json(
      { error: "This issue is already being sent. Wait a few minutes, then refresh." },
      { status: 409 }
    );
  }

  let subscribers: { id: string; email: string; unsubscribe_token: string }[];
  let alreadySent: Set<string>;
  try {
    subscribers = await fetchAll((from, to) =>
      supabase
        .from("subscribers")
        .select("id, email, unsubscribe_token")
        .eq("status", "confirmed")
        .order("id")
        .range(from, to)
    );
    // Retry-safe: anyone recorded as already sent this issue is skipped.
    const delivered = await fetchAll<{ subscriber_id: string }>((from, to) =>
      supabase
        .from("newsletter_deliveries")
        .select("subscriber_id")
        .eq("issue_id", issueId)
        .order("subscriber_id")
        .range(from, to)
    );
    alreadySent = new Set(delivered.map((d) => d.subscriber_id));
  } catch (e) {
    await releaseLock(supabase, issueId);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }

  const pending = subscribers.filter((sub) => !alreadySent.has(sub.id));
  if (!subscribers.length) {
    await releaseLock(supabase, issueId);
    return NextResponse.json({ error: "No confirmed subscribers to send to." }, { status: 400 });
  }

  const siteOrigin = new URL(request.url).origin;
  const resend = createResendClient();
  let sent = 0;

  for (const batch of chunk(pending, BATCH_SIZE)) {
    const payload = batch.map((sub) => {
      // Link in the email body: a page with an "Unsubscribe" button (a
      // scanner opening it changes nothing). Header: the one-click URL
      // Gmail/Apple Mail post to for their own "Unsubscribe" button.
      const pageUrl = `${siteOrigin}/newsletter/unsubscribe?token=${sub.unsubscribe_token}`;
      const oneClickUrl = `${siteOrigin}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`;
      return {
        from: NEWSLETTER_FROM,
        replyTo: NEWSLETTER_REPLY_TO,
        to: sub.email,
        subject: issue.subject ?? "Dirty Paintbrushes",
        html: issue.html_content!.split(UNSUBSCRIBE_PLACEHOLDER).join(pageUrl),
        headers: {
          "List-Unsubscribe": `<${oneClickUrl}>, <mailto:${CONTACT_EMAIL}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });

    // Same key for the same batch of the same issue: if a previous attempt
    // actually reached Resend but timed out before we recorded it, Resend
    // recognises the repeat (within 24h) and doesn't send it twice.
    const idempotencyKey = `issue-${issueId}-${batch[0].id}-${batch[batch.length - 1].id}-${batch.length}`;
    const { error: sendError } = await resend.batch.send(payload, { idempotencyKey });
    if (sendError) {
      await releaseLock(supabase, issueId);
      return NextResponse.json(
        { error: `${sendError.message} — ${sent} sent this time. Press Send again to continue; people already sent to are skipped.`, sent },
        { status: 502 }
      );
    }

    const { error: recordError } = await supabase
      .from("newsletter_deliveries")
      .upsert(
        batch.map((sub) => ({ issue_id: issueId, subscriber_id: sub.id })),
        { onConflict: "issue_id,subscriber_id", ignoreDuplicates: true }
      );
    sent += batch.length;
    if (recordError) {
      await releaseLock(supabase, issueId);
      return NextResponse.json({ error: recordError.message, sent }, { status: 500 });
    }
  }

  const { error: updateError } = await supabase
    .from("newsletter_issues")
    .update({ status: "sent", sent_at: new Date().toISOString(), sending_started_at: null })
    .eq("id", issueId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message, sent }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent, skipped: alreadySent.size });
}
