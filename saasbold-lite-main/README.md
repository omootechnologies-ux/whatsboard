# Folapp Dashboard

Folapp is a premium, mobile-first seller operating dashboard for East African online businesses.  
It helps teams move from chat chaos to sales control across orders, customers, follow-ups, payments, and analytics.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Lucide icons

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## App Routes

Public pages:

- `/` Homepage (sample/demo marketing data only)
- `/pricing`
- `/login`
- `/register`
- `/privacy`
- `/terms`

Authenticated app pages:

- `/dashboard`
- `/orders`
- `/orders/new`
- `/orders/[id]`
- `/orders/[id]/edit`
- `/products`
- `/customers`
- `/customers/new`
- `/customers/[id]/edit`
- `/follow-ups`
- `/follow-ups/new`
- `/follow-ups/[id]/edit`
- `/payments`
- `/payments/new`
- `/payments/[id]/edit`
- `/team`
- `/billing`
- `/analytics`
- `/settings`

## Data and API

The app uses a repository abstraction with two persistence drivers:

- `local` file-backed fallback (development-safe)
- `supabase` production-grade persistence

- Seed/models: `src/data/whatsboard.ts`
- Repository interface + driver switch: `src/lib/whatsboard-repository.ts`
- Local driver: `src/lib/repositories/local-repository.ts`
- Supabase driver: `src/lib/repositories/supabase-repository.ts`
- Supabase server client: `src/lib/supabase/server.ts`
- API routes: `src/app/api/*`

Default local data file:

- `/tmp/whatsboard-store.json`
- Override with `WHATSBOARD_STORE_PATH` if needed

## Environment Variables

Required for Supabase persistence:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSBOARD_PERSISTENCE_DRIVER=local|supabase`

Driver behavior:

- If `WHATSBOARD_PERSISTENCE_DRIVER=supabase`, Supabase is used.
- If `WHATSBOARD_PERSISTENCE_DRIVER=local`, file-backed fallback is used.
- If unset, Supabase is auto-selected when server env vars are present; otherwise local fallback is used.
- On Vercel production (`VERCEL_ENV=production`), driver defaults to `supabase` for durability safety.

## Supabase Migration + Data Backfill

1. Apply schema migration:

```bash
supabase db push
```

Migration file:

- `supabase/migrations/20260402_whatsboard_persistence.sql`
- `supabase/migrations/20260403_legacy_business_compat.sql`
- `supabase/migrations/20260403_auth_business_bootstrap.sql`
- `supabase/migrations/20260404_legacy_schema_hardening.sql`

2. Backfill local data into Supabase:

```bash
npm run migrate:local-to-supabase
```

Optional local export path override:

```bash
WHATSBOARD_STORE_PATH=/path/to/whatsboard-store.json npm run migrate:local-to-supabase
```

## Notes

- Design system and reusable UI live in `src/components/whatsboard-dashboard`.
- Styling tokens and shared classes are defined in `src/styles/globals.css`.
