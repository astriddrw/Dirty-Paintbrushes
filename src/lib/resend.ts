import { Resend } from "resend";

// Resend only sends from a domain verified in its dashboard — this address
// fails with a 403 until dirtypaintbrushes.com is verified there.
export const NEWSLETTER_FROM = "Dirty Paintbrushes <news@dirtypaintbrushes.com>";

export function createResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}
