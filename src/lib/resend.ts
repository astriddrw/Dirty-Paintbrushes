import { Resend } from "resend";

// Every email the site sends goes out under this name and address. The
// domain must be verified in Resend (Domains → dirtypaintbrushes.com) or
// Resend rejects the send.
export const NEWSLETTER_FROM = "Dirty Paintbrushes <news@dirtypaintbrushes.com>";

export function createResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}
