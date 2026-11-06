PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  currency_code TEXT NOT NULL DEFAULT 'MYR',
  country_code TEXT NOT NULL DEFAULT 'MY',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('cash','bank','ewallet','credit_card','investment','other')),
  institution TEXT,
  currency_code TEXT NOT NULL DEFAULT 'MYR',
  opening_balance_cents INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(id, user_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income','expense','transfer')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency_code TEXT NOT NULL DEFAULT 'MYR',
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  merchant TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (account_id, user_id) REFERENCES accounts(id, user_id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_category_idx ON transactions(user_id, category);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount_limit_cents INTEGER NOT NULL CHECK (amount_limit_cents > 0),
  period_month TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'MYR',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, category, period_month)
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount_cents INTEGER NOT NULL CHECK (target_amount_cents > 0),
  current_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (current_amount_cents >= 0),
  target_date TEXT,
  currency_code TEXT NOT NULL DEFAULT 'MYR',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS financing (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  financing_type TEXT NOT NULL CHECK (financing_type IN ('vehicle','personal_loan','mortgage','credit_card','bnpl','other')),
  lender TEXT,
  original_amount_cents INTEGER,
  outstanding_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (outstanding_amount_cents >= 0),
  monthly_payment_cents INTEGER NOT NULL DEFAULT 0 CHECK (monthly_payment_cents >= 0),
  interest_rate REAL,
  next_due_date TEXT,
  currency_code TEXT NOT NULL DEFAULT 'MYR',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recurring_bills (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Bills & utilities',
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly','monthly','quarterly','yearly')),
  next_due_date TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  currency_code TEXT NOT NULL DEFAULT 'MYR',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tax_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL CHECK (tax_year BETWEEN 2000 AND 2200),
  relief_category TEXT NOT NULL,
  description TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (amount_cents >= 0),
  document_reference TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
