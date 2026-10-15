// Security headers on every page and API response.
// - Other sites can't show this one inside a frame (clickjacking):
//   frame-ancestors (modern browsers) + X-Frame-Options (older ones).
// - Browsers must trust the declared file types, send only the domain (not
//   full URLs) to other sites, and always use HTTPS.
// - Camera, microphone and location are switched off — the site never uses them.
// A full Content-Security-Policy is left out on purpose: the site loads
// scripts from unpkg and talks to Supabase, and a too-strict policy would
// break pages silently. Worth adding later with testing.
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
