import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient, NEWSLETTER_FROM, NEWSLETTER_REPLY_TO } from "@/lib/resend";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function confirmEmailHtml(confirmUrl: string) {
  return `
    <div style="background:#354A89;padding:32px 40px;font-family:Georgia,serif;">
      <p style="font-style:italic;font-size:28px;color:#E6E2C5;margin:0 0 20px;">Dirty Paintbrushes</p>
      <p style="font-family:Roboto,Arial,sans-serif;font-size:14px;color:#E6E2C5;line-height:1.6;margin:0 0 20px;">
        Confirm your subscription to the monthly digest, curated once a month on art market financial crime.
      </p>
      <a href="${confirmUrl}" style="display:inline-block;background:#E6E2C5;color:#354A89;font-family:Roboto,Arial,sans-serif;font-size:14px;font-weight:600;padding:10px 20px;text-decoration:none;">
        Confirm subscription
      </a>
    </div>
  `;
}

// One confirmation email per address per 10 minutes, so this form can't be
// used to flood a stranger's inbox from our domain.
const RESEND_COOLDOWN_MS = 10 * 60 * 1000;

// Every outcome below returns this same reply — whether the address is new,
// pending, already confirmed or rate-limited — so the form never reveals
// who is subscribed.
const OK = () => NextResponse.json({ ok: true });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  // Honeypot: a field hidden from people (see newsletter-signup.tsx) that
  // form-filling bots tend to complete. Pretend it worked, do nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") return OK();

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing, error: lookupError } = await supabase
    .from("subscribers")
    .select("id, status, confirm_token, last_confirmation_sent_at")
    .eq("email", email)
    .maybeSingle();
  if (lookupError) {
    return NextResponse.json({ error: "Could not subscribe. Try again." }, { status: 500 });
  }

  // Already active: nothing to send, and the reply is identical.
  if (existing?.status === "confirmed") return OK();

  let confirmToken: string;
  const now = new Date();

  if (!existing) {
    const { data: inserted, error: insertError } = await supabase
      .from("subscribers")
      .insert({ email, status: "pending", last_confirmation_sent_at: now.toISOString() })
      .select("confirm_token")
      .single();
    if (insertError) {
      // A simultaneous request may have just created it — same reply.
      if (insertError.code === "23505") return OK();
      return NextResponse.json({ error: "Could not subscribe. Try again." }, { status: 500 });
    }
    confirmToken = String(inserted.confirm_token);
  } else {
    // Pending or unsubscribed. Sent one recently? Then don't send again.
    const previous: string | null = existing.last_confirmation_sent_at;
    if (previous && now.getTime() - new Date(previous).getTime() < RESEND_COOLDOWN_MS) return OK();

    // Claim the send slot: the update only applies if nobody else changed
    // last_confirmation_sent_at since we read it, so two simultaneous
    // requests can't both send. (Deliberately not .or(): PostgREST re-applies
    // .or() filters to the returned rows, which made this update fail.)
    // Re-subscribing after opting out re-enters the confirm flow rather than
    // silently reactivating, same as a first-time signup.
    let claim = supabase
      .from("subscribers")
      .update({
        last_confirmation_sent_at: now.toISOString(),
        ...(existing.status === "unsubscribed" ? { status: "pending", confirmed_at: null } : {}),
      })
      .eq("id", existing.id);
    claim = previous ? claim.eq("last_confirmation_sent_at", previous) : claim.is("last_confirmation_sent_at", null);
    const { data: claimed, error: claimError } = await claim.select("id");
    if (claimError) {
      return NextResponse.json({ error: "Could not subscribe. Try again." }, { status: 500 });
    }
    if (!claimed?.length) return OK(); // another request just sent one
    confirmToken = String(existing.confirm_token);
  }

  // The link opens a page with a "Confirm" button rather than confirming on
  // the spot, so email security scanners that pre-open links can't confirm
  // (or unsubscribe) anyone by themselves.
  const confirmUrl = new URL("/newsletter/confirm", request.url);
  confirmUrl.searchParams.set("token", confirmToken);

  try {
    const resend = createResendClient();
    const { error: sendError } = await resend.emails.send({
      from: NEWSLETTER_FROM,
      replyTo: NEWSLETTER_REPLY_TO,
      to: email,
      subject: "Confirm your subscription",
      html: confirmEmailHtml(confirmUrl.toString()),
    });
    if (sendError) throw new Error(sendError.message);
  } catch {
    // Free the cooldown slot so they can try again straight away.
    await supabase.from("subscribers").update({ last_confirmation_sent_at: null }).eq("email", email);
    return NextResponse.json(
      { error: "Could not send confirmation email. Try again." },
      { status: 500 }
    );
  }

  return OK();
}
