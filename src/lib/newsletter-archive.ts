import { createAdminClient } from "@/lib/supabase/admin";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/emails/NewsletterDigest";

// Public archive of SENT issues (/newsletter, /newsletter/issues/[period]).
// newsletter_issues is admin-only in the database, so this reads with the
// service-role client — and therefore must only ever select sent issues
// and only the columns the public pages show.

export interface ArchivedIssue {
  period: string; // "2026-10"
  subject: string | null;
  sent_at: string | null;
}

export const SITE_URL = "https://dirtypaintbrushes.com";

export function periodLabel(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function listSentIssues(): Promise<ArchivedIssue[]> {
  const { data, error } = await createAdminClient()
    .from("newsletter_issues")
    .select("period, subject, sent_at")
    .eq("status", "sent")
    .order("period", { ascending: false });
  if (error) return [];
  return data ?? [];
}

// The stored HTML is exactly what subscribers received, minus their personal
// unsubscribe link: the placeholder points at the unsubscribe page instead,
// which (without a token) explains to use the link from their own email.
export async function getSentIssueHtml(period: string): Promise<string | null> {
  if (!/^\d{4}-\d{2}$/.test(period)) return null;
  const { data, error } = await createAdminClient()
    .from("newsletter_issues")
    .select("html_content")
    .eq("status", "sent")
    .eq("period", period)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.html_content) return null;
  return data.html_content.split(UNSUBSCRIBE_PLACEHOLDER).join(`${SITE_URL}/newsletter/unsubscribe`);
}
