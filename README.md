# Ledger — Personal Finance Tracker

A private-first personal finance workspace built with React, TypeScript, Vite and Cloudflare.

## Architecture

- **Cloudflare Workers** — API and server-side business logic.
- **Cloudflare D1** — relational financial data.
- **Cloudflare R2** — private receipt/document storage (to be enabled in a later phase).
- **Cloudflare Access** — private sign-in for the initial single-user deployment.
- **Google Drive** — optional export/backup destination; never the live database.

The database schema includes a `user_id` ownership key from day one. The API derives this identity from a verified Cloudflare Access JWT; clients cannot choose another user's ID.

## Product principles

- Manual-first financial tracking; no bank credentials or screen scraping.
- Malaysian Ringgit (MYR) defaults and Malaysia tax-year support.
- Private by default. Do not enter real financial records until Cloudflare Access, D1 and production secrets are configured and verified.
- Demo dashboard data is synthetic and remains local to the browser.

## Local development

```bash
npm install
npm run dev
```

For the Worker API, configure a local `.dev.vars` file with:
- `CF_ACCESS_TEAM_DOMAIN` — your Cloudflare Access team domain, e.g. `https://your-team.cloudflareaccess.com`.
- `CF_ACCESS_AUD` — the Access application's AUD tag.

Then run:

```bash
npm run dev:worker
```

## Cloudflare setup

1. Create a D1 database named `finance-db`.
2. Copy its database ID into `wrangler.jsonc`.
3. Create a Cloudflare Access self-hosted application for the app hostname and allow only your account.
4. Set Worker variables `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD`; use secrets for any future private API credentials.
5. Apply the schema with `npm run db:remote`.
6. Deploy with `npm run deploy`.

Do not enable real-data use until Access JWT verification and the D1 migration have both been tested in the deployed environment.

## Planned modules

Overview, transactions, accounts, budgets, financing, recurring bills, savings goals, tax records, receipt archive and export/restore.

## Security

Never commit `.dev.vars`, `.env`, Access secrets, real statements, receipts or personal financial records. The Worker verifies Cloudflare Access JWTs and derives `user_id` from the verified token subject. D1 queries are always scoped to that identity. Google Drive is an export/backup destination, not a database.
