import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/contact";

// Every email the site sends goes out under this name and address. The
// domain must be verified in Resend (Domains → dirtypaintbrushes.com) or
// Resend rejects the send.
export const NEWSLETTER_FROM = "Dirty Paintbrushes <news@dirtypaintbrushes.com>";

// news@ is send-only; replies land in the contact inbox instead.
export const NEWSLETTER_REPLY_TO = CONTACT_EMAIL;

export function createResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}
