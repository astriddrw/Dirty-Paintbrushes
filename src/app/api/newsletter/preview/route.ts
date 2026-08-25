import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
import NewsletterDigest from "@/emails/NewsletterDigest";
import { buildMonthlyDigest } from "@/lib/newsletter";

// Unauthenticated on purpose: it only reads already-public "published"
// articles (same RLS scope as the live site) and never touches the
// subscribers table, so there's nothing here that isn't already visible
// on /feed. Renders straight to HTML rather than JSON so opening the URL
// in a browser shows the actual email.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { periodLabel, groups } = await buildMonthlyDigest(supabase);
  const html = await render(NewsletterDigest({ periodLabel, groups }));

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
