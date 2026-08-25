import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/newsletter/confirmed?error=1", request.url));
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("confirm_token", token)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(new URL("/newsletter/confirmed?error=1", request.url));
  }

  return NextResponse.redirect(new URL("/newsletter/confirmed", request.url));
}
