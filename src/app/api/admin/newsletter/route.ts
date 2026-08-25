import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";

// Reads request.cookies to check the admin session — opt out of static
// rendering explicitly rather than relying on Next's automatic bailout.
export const dynamic = "force-dynamic";

async function requireSession(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// GET/PATCH both use the service-role client, same reasoning as
// /api/admin/review — /admin/* is already gated on a valid session.

export async function GET(request: NextRequest) {
  if (!(await requireSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const [{ data: issues, error: issuesError }, { count: confirmedCount }] = await Promise.all([
    supabase.from("newsletter_issues").select("*").order("period", { ascending: false }),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
  ]);

  if (issuesError) {
    return NextResponse.json({ error: issuesError.message }, { status: 500 });
  }

  return NextResponse.json({ issues: issues ?? [], confirmedCount: confirmedCount ?? 0 });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, subject, html_content } = body as {
    id?: string;
    subject?: string;
    html_content?: string;
  };

  if (!id) {
    return NextResponse.json({ error: "Body must include `id`." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: issue } = await supabase
    .from("newsletter_issues")
    .select("status")
    .eq("id", id)
    .single();

  if (issue?.status === "sent") {
    return NextResponse.json({ error: "Can't edit an issue that's already been sent." }, { status: 400 });
  }

  const { error } = await supabase
    .from("newsletter_issues")
    .update({ subject, html_content })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
