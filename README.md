# WHATSBOARD

WHATSBOARD is a WhatsApp-first order-to-cash board for East African sellers.

## Features
- Homepage built around real seller pain points
- Order board with stages
- Customer tracking
- Payment visibility
- Analytics dashboard
- Supabase-ready schema with RLS
- Live Supabase data instead of local demo records

## Run locally
1. Copy `.env.example` to `.env.local`
2. Add Supabase keys
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## Deploy
- Push to GitHub
- Import to Vercel
- Add environment variables in Vercel
- Apply `supabase/schema.sql` and `supabase/policies.sql` in Supabase SQL editor
