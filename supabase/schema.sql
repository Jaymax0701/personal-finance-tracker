-- Ledger personal finance schema
-- Apply in the Supabase SQL Editor. Every personal table is protected by RLS.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  currency_code text not null default 'MYR' check (char_length(currency_code) = 3),
  country_code text not null default 'MY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('cash','bank','ewallet','credit_card','investment','other')),
  institution text,
  currency_code text not null default 'MYR',
  opening_balance numeric(14,2) not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account_id uuid,
  transaction_type text not null check (transaction_type in ('income','expense','transfer')),
  amount numeric(14,2) not null check (amount > 0),
  currency_code text not null default 'MYR',
  category text not null,
  description text not null,
  transaction_date date not null default current_date,
  merchant text,
  notes text,
  created_at timestamptz not null default now(),
  foreign key (account_id, user_id) references public.accounts(id, user_id) on delete set null
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null,
  amount_limit numeric(14,2) not null check (amount_limit > 0),
  period_month date not null,
  currency_code text not null default 'MYR',
  created_at timestamptz not null default now(),
  unique (user_id, category, period_month)
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  current_amount numeric(14,2) not null default 0 check (current_amount >= 0),
  target_date date,
  currency_code text not null default 'MYR',
  created_at timestamptz not null default now()
);

create table if not exists public.financing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  financing_type text not null check (financing_type in ('vehicle','personal_loan','mortgage','credit_card','bnpl','other')),
  lender text,
  original_amount numeric(14,2),
  outstanding_amount numeric(14,2) not null default 0 check (outstanding_amount >= 0),
  monthly_payment numeric(14,2) not null default 0 check (monthly_payment >= 0),
  interest_rate numeric(7,4),
  next_due_date date,
  currency_code text not null default 'MYR',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.recurring_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'Bills & utilities',
  amount numeric(14,2) not null check (amount >= 0),
  frequency text not null check (frequency in ('weekly','monthly','quarterly','yearly')),
  next_due_date date not null,
  is_active boolean not null default true,
  currency_code text not null default 'MYR',
  created_at timestamptz not null default now()
);

create table if not exists public.tax_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tax_year integer not null check (tax_year between 2000 and 2200),
  relief_category text not null,
  description text,
  amount numeric(14,2) not null default 0 check (amount >= 0),
  document_reference text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx on public.transactions(user_id, transaction_date desc);
create index if not exists transactions_user_category_idx on public.transactions(user_id, category);
create index if not exists budgets_user_month_idx on public.budgets(user_id, period_month);
create index if not exists financing_user_due_idx on public.financing(user_id, next_due_date);
create index if not exists bills_user_due_idx on public.recurring_bills(user_id, next_due_date);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.financing enable row level security;
alter table public.recurring_bills enable row level security;
alter table public.tax_records enable row level security;

-- Explicit owner policies: users can only read and mutate their own rows.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['accounts','transactions','budgets','savings_goals','financing','recurring_bills','tax_records'] loop
    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format('create policy %I on public.%I for select to authenticated using (user_id = (select auth.uid()))', t || '_select_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t || '_insert_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t || '_update_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);
    execute format('create policy %I on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t || '_delete_own', t);
  end loop;
end $$;

-- Do not expose service-role credentials in the browser. Add storage policies
-- only when a private receipts bucket is created and its access model is reviewed.
