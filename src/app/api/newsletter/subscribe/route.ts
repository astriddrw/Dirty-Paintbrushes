import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResendClient } from "@/lib/resend";

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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, status, confirm_token")
    .eq("email", email)
    .maybeSingle();

  let confirmToken = existing?.confirm_token;

  if (!existing) {
    const { data: inserted, error: insertError } = await supabase
      .from("subscribers")
      .insert({ email, status: "pending" })
      .select("confirm_token")
      .single();
    if (insertError) {
      return NextResponse.json({ error: "Could not subscribe. Try again." }, { status: 500 });
    }
    confirmToken = inserted.confirm_token;
  } else if (existing.status === "confirmed") {
    // Already active — nothing to resend, and re-upserting would needlessly
    // demote a confirmed subscriber back to pending.
    return NextResponse.json({ ok: true, alreadyConfirmed: true });
  } else if (existing.status === "unsubscribed") {
    // Re-subscribing after opting out re-enters the confirm flow rather
    // than silently reactivating, same as a first-time signup.
    const { error: updateError } = await supabase
      .from("subscribers")
      .update({ status: "pending", confirmed_at: null })
      .eq("id", existing.id);
    if (updateError) {
      return NextResponse.json({ error: "Could not subscribe. Try again." }, { status: 500 });
    }
  }
  // status === "pending": fall through and resend the same confirm link.

  const confirmUrl = new URL("/api/newsletter/confirm", request.url);
  confirmUrl.searchParams.set("token", String(confirmToken));

  try {
    const resend = createResendClient();
    await resend.emails.send({
      from: "Dirty Paintbrushes <news@dirtypaintbrushes.com>",
      to: email,
      subject: "Confirm your subscription",
      html: confirmEmailHtml(confirmUrl.toString()),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not send confirmation email. Try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
