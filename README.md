# Pagentary

A paid online pageantry voting platform. The platform will support contestant profiles, secure Flutterwave payments, configurable vote pricing and limits, real-time public results, and a single-administrator dashboard.

## Technology

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Flutterwave (payments)
- Vercel (deployment)
- GitHub (source control)

## Getting started

Requires Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

Configure the values from `.env.example` in your local environment and deployment provider. Never commit real credentials.

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public project connection settings.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to browser code or committed.
- Flutterwave credentials are server-side only and will be used in the payment integration stage.

## Current progress

- [x] Premium public landing page and responsive navigation
- [x] Initial Supabase voting schema with RLS enabled
- [x] Supabase browser and server client utilities
- [x] Session refresh middleware
- [x] Administrator sign-in page and server-verified super-admin gate
- [x] Protected administrator dashboard shell
- [ ] First administrator account provisioning
- [ ] Competition and contestant management
- [ ] Flutterwave checkout and verified vote allocation
- [ ] Live public leaderboard
- [ ] Production deployment

## First administrator setup

Create the first user in Supabase Authentication, then insert that user's Auth UUID into `public.admin_accounts` using the Supabase SQL Editor. Keep public sign-ups disabled. The admin dashboard checks the allow-list on the server using the server-only service role key.

```sql
insert into public.admin_accounts (user_id, is_super_admin)
values ('AUTH_USER_UUID_HERE', true);
```

The database has a unique partial index that permits only one super-administrator.

## Security principles

- Never trust payment-success redirects as proof of payment.
- Verify Flutterwave transactions server-side before crediting votes.
- Enforce idempotency so one payment cannot be credited more than once.
- Keep privileged Supabase and Flutterwave secrets on the server only.
- Use database constraints and server-side rules for vote limits and allocation.
