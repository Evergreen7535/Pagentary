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

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables

Copy `.env.example` to `.env.local` and fill in credentials when the relevant services are configured. Never commit real credentials.

## Project status

The initial public homepage is in place. Supabase, Flutterwave, administrator authentication, contestant management and the voting engine will be implemented in later stages.

## Security principles

- Never trust payment-success redirects as proof of payment.
- Verify Flutterwave transactions server-side before crediting votes.
- Enforce idempotency so one payment cannot be credited more than once.
- Keep privileged Supabase and Flutterwave secrets on the server only.
- Use database constraints and server-side rules for vote limits and allocation.
