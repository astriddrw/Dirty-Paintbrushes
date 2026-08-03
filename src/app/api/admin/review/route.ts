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

// GET/PATCH both use the service-role client so the review queue reflects
// every article regardless of RLS policy state — /admin/* is already gated
// on having a valid session, so this doesn't widen the trust boundary.

export async function GET(request: NextRequest) {
  if (!(await requireSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "review_queue")
    .order("published_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireSession(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, status } = body as { id?: string; status?: string };

  if (!id || (status !== "published" && status !== "dismissed")) {
    return NextResponse.json(
      { error: "Body must include `id` and status: 'published' | 'dismissed'" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("articles").update({ status }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
