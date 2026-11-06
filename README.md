# Personal Finance Tracker

A private-first personal finance workspace built with React, TypeScript, Vite and Supabase.

## Product principles
- Manual-first financial tracking; no bank credentials or screen scraping.
- Malaysian Ringgit (MYR) defaults, with configurable currency and Malaysia tax-year support.
- Private-by-default records with Supabase Row Level Security.
- Demo mode uses synthetic data only until Supabase is configured.

## Planned modules
Overview, transactions, accounts, budgets, financing, recurring bills, savings goals and tax records.

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to connect a Supabase project. Apply `supabase/schema.sql` in the Supabase SQL Editor before enabling real user data.

## Security
Never commit `.env.local`, service-role keys, real statements, receipts or personal financial records. The browser must only use the Supabase anon/publishable key; enforce access through RLS.
