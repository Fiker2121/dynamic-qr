# Dynamic QR Code Generator with Analytics

Create QR codes whose destination you can change after printing, and track every scan by time, country, and device.

Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui (Radix), Supabase (Auth + PostgreSQL), `qr-code-styling`, Recharts.

## How it works

1. A QR code stores a random short code (for example `aZ91Kx7`). The printed image encodes `https://your-domain.com/r/aZ91Kx7`, never the final destination.
2. When someone scans it, `app/r/[code]/route.ts` looks up the code with the service-role client, records a scan (country, device, browser, OS, referrer origin), and answers with an HTTP `302` to the stored destination.
3. Editing the destination only updates the database row. The short code and the QR image stay the same.

## Requirements

- Node.js 20 or newer (the short-code generator uses the global Web Crypto API)
- A Supabase project (free tier works)

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

Useful scripts: `npm run typecheck`, `npm run lint`, `npm run build`.

## Environment setup

Fill in `.env.local`:

| Variable | Where it is used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | QR links, metadata | `http://localhost:3000` locally, `https://yourdomain.com` in production. No trailing slash. |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | Safe to expose; Row Level Security protects data |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Bypasses RLS. Never prefix with `NEXT_PUBLIC_`. |

## Supabase setup

1. In the Supabase dashboard open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. It is safe to re-run.
2. The script creates `qr_codes` and `scans`, indexes, constraints, an `updated_at` trigger, Row Level Security policies, and the analytics functions the dashboard calls.

Access model:

- Signed-in users can read, create, update, and delete only their own `qr_codes`.
- Signed-in users can read only scans of their own QR codes. There is no insert policy for `scans`; only the redirect route (service role) writes them.
- Anonymous visitors have no direct table access. They scan through `/r/[code]`, which runs server-side.
- Analytics aggregation functions are `SECURITY INVOKER`, so RLS applies to them too.

## Authentication setup

In Supabase → Authentication:

1. **Providers**: keep Email enabled.
2. **URL Configuration**: set **Site URL** to your `NEXT_PUBLIC_APP_URL` and add `http://localhost:3000/auth/callback` and `https://yourdomain.com/auth/callback` to **Redirect URLs**.
3. **Email confirmations**: if enabled (the default), new users get a confirmation email and must click it before signing in. For quick local testing you can disable confirmation.

## Production deployment (Vercel)

1. Push the repository and import it in Vercel.
2. Add the four environment variables above (set `SUPABASE_SERVICE_ROLE_KEY` as a server-side secret).
3. Deploy. `/r/[code]` runs on the Node.js runtime and is always dynamic.

Notes:

- No filesystem persistence is used. Logos are stored as small data URLs inside the `qr_codes` row.
- Scan logging is awaited for up to 1.5 seconds before the redirect is sent. Serverless platforms may freeze a function right after it responds, so fire-and-forget inserts are not guaranteed to finish. If logging fails or times out, the visitor is still redirected and the error is logged server-side.
- Add rate limiting (for example Vercel Firewall or Upstash) in front of `/r/*` and `/api/*` if you expect abuse. It is not included.

## Domain configuration

QR codes encode `${NEXT_PUBLIC_APP_URL}/r/[code]`. Pick your final domain before printing anything. If the domain changes later, existing printed codes stop working unless the old domain keeps redirecting `/r/*` to the new one.

## Security notes

- The service-role key is read only in `lib/supabase/admin.ts`, which imports `server-only`, so the build fails if a client component imports it.
- Destination URLs must parse as `http:` or `https:`. They are validated in the form, in the API (Zod), by a database check constraint, and again right before every redirect. The scanner supplies only the short code, never a destination.
- `user_id` is always taken from the session, never from the request body.
- Unknown or malformed codes return a branded 404 page.

## Analytics notes

- Country comes from CDN/proxy headers (`x-vercel-ip-country`, `cf-ipcountry`, `cloudfront-viewer-country`, and similar). It is only as accurate as that header. On localhost or hosts without such headers it is stored as `Unknown`.
- Device type, browser, and OS come from a small built-in User-Agent parser. Unrecognized agents and bots are `Unknown`. iPads that request the desktop site report as Mac and are counted as desktop.
- No IP address and no precise location is stored. Referrers are reduced to their origin.
- Timestamps are stored in UTC. Daily buckets, "today", and "this week" use UTC calendar days. Dates in lists are shown in the viewer's local time.

## Plans

The Free/Pro pricing section is UI only. No payments are implemented and no plan limits are enforced. Plan copy lives in `lib/plans.ts`; when you add billing, enforce limits server-side in `POST /api/qr-codes`.

## Project structure

```
app/            routes (landing, auth, dashboard, /r redirect, /api)
components/     ui (shadcn), landing, dashboard, qr, analytics, auth
lib/            supabase clients, qr utilities, analytics queries, validators
supabase/       schema.sql
types/          database-facing TypeScript types
```
