# WhatsBoard Dashboard

WhatsBoard is a premium, mobile-first seller operating dashboard for East African online businesses.  
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

- `/` Dashboard overview
- `/orders` Orders board and ledger
- `/orders/new` Create order
- `/orders/[id]` Order details
- `/orders/[id]/edit` Edit order
- `/customers` Customers
- `/customers/new` Add customer
- `/follow-ups` Follow-ups action center
- `/follow-ups/new` Add follow-up
- `/payments` Payments
- `/payments/new` Record payment
- `/analytics` Analytics
- `/settings` Settings

## Data and API

The current build uses local store-backed API routes under `src/app/api/*` and a typed repository layer.

- Seed/models: `src/data/whatsboard.ts`
- Store/persistence: `src/lib/whatsboard-store.ts`
- Query layer: `src/lib/whatsboard-repository.ts`

Default local data file:

- `/tmp/whatsboard-store.json`
- Override with `WHATSBOARD_STORE_PATH` if needed

## Notes

- Design system and reusable UI live in `src/components/whatsboard-dashboard`.
- Styling tokens and shared classes are defined in `src/styles/globals.css`.
