import { createClient } from "@supabase/supabase-js";

// Next.js 14 stores fetch() responses made on the server in its Data Cache
// — Supabase queries included, since supabase-js uses fetch — so the admin
// dashboard was showing review-queue and published counts from earlier
// requests. Every query here must read live data, so opt out explicitly.
const noStoreFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: noStoreFetch } }
  );
}
