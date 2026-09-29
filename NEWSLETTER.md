# Newsletter setup

The code for the whole flow is in place. These are the one-time steps outside
the repo that make it work in production.

## How it works

1. A visitor enters their email (homepage modal, footer banner, or `/newsletter`).
2. `POST /api/newsletter/subscribe` stores them as `pending` in Supabase and
   emails a confirmation link through Resend.
3. Clicking the link hits `/api/newsletter/confirm`, which marks them
   `confirmed` and redirects to `/newsletter/confirmed`.
4. On the 1st of each month at 08:00 UTC, the Vercel cron calls
   `/api/newsletter/generate-draft`, which builds last month's digest from
   published articles and saves it as a draft (and emails
   `NEWSLETTER_ADMIN_EMAIL` if set).
5. You review and edit the draft at `/admin/newsletter`, then press Send. It goes
   to every confirmed subscriber, each with their own unsubscribe link.

Preview the current digest any time at `/api/newsletter/preview`.

## One-time setup

1. **Supabase:** run section 10 (NEWSLETTER) of `supabase/migrations.sql` in
   the SQL editor, which creates the `subscribers` and `newsletter_issues` tables.
2. **Resend:** create an account, add the domain `dirtypaintbrushes.com`,
   and add the DNS records it gives you (SPF/DKIM, plus DMARC if you want it) at your
   domain registrar. Wait until it shows **Verified**. Emails are sent from
   `news@dirtypaintbrushes.com`, and Resend rejects that address until the domain is verified.
3. **Vercel → Project → Settings → Environment Variables** (Production):
   - `RESEND_API_KEY`: an API key from Resend with sending access
   - `SUPABASE_SERVICE_ROLE_KEY`: from Supabase → Project Settings → API
   - `CRON_SECRET`: any long random string (Vercel sends it to cron routes)
   - `NEWSLETTER_ADMIN_EMAIL` (optional): where the "draft is ready" email goes
4. Redeploy so the new variables take effect.
5. Test: subscribe with your own email on the live site, click the confirm link,
   then check the `subscribers` table shows `confirmed`.

## Troubleshooting

If signup shows "Could not send confirmation email", check the Vercel function
logs for `[newsletter/subscribe]`. The usual causes are a missing `RESEND_API_KEY`
or an unverified domain.
