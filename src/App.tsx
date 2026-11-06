import { useMemo, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, ChartNoAxesCombined, ChevronDown,
  CircleHelp, CreditCard, LayoutDashboard, Plus, Search, Settings2, ShieldCheck,
  Target, Wallet, X, ReceiptText, Menu, PiggyBank, Landmark, Repeat2
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { isSupabaseConfigured } from './lib/supabase'

type Tx = { id: number; name: string; category: string; date: string; amount: number; kind: 'income' | 'expense'; initials: string; color: string }
const seedTransactions: Tx[] = [
  { id: 1, name: 'Salary payment', category: 'Income', date: 'Today, 9:12 AM', amount: 3850, kind: 'income', initials: 'SP', color: 'mint' },
  { id: 2, name: 'Grocery shopping', category: 'Food & groceries', date: 'Today, 8:34 AM', amount: 126.4, kind: 'expense', initials: 'GS', color: 'orange' },
  { id: 3, name: 'Petrol station', category: 'Transport', date: 'Yesterday', amount: 85, kind: 'expense', initials: 'PS', color: 'blue' },
  { id: 4, name: 'Monthly subscription', category: 'Subscriptions', date: 'Yesterday', amount: 29.9, kind: 'expense', initials: 'MS', color: 'purple' },
  { id: 5, name: 'Freelance project', category: 'Side income', date: '04 Nov 2026', amount: 450, kind: 'income', initials: 'FP', color: 'mint' },
]
const trend = [
  { month: 'Jun', income: 3900, expense: 2740 }, { month: 'Jul', income: 4200, expense: 2910 },
  { month: 'Aug', income: 4050, expense: 2630 }, { month: 'Sep', income: 4380, expense: 3100 },
  { month: 'Oct', income: 4300, expense: 2860 }, { month: 'Nov', income: 4300, expense: 2450 },
]
const money = (n: number) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 2 }).format(n)
const nav = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Transactions', icon: ReceiptText },
  { label: 'Budgets', icon: ChartNoAxesCombined }, { label: 'Accounts', icon: Wallet },
  { label: 'Financing', icon: CreditCard }, { label: 'Savings goals', icon: Target },
  { label: 'Recurring bills', icon: Repeat2 }, { label: 'Tax records', icon: CalendarDays },
]
function App() {
  const [active, setActive] = useState('Overview')
  const [transactions, setTransactions] = useState(seedTransactions)
  const [showAdd, setShowAdd] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', category: 'Food & groceries', amount: '', kind: 'expense' as 'income' | 'expense' })
  const filtered = useMemo(() => transactions.filter(t => (t.name + t.category).toLowerCase().includes(search.toLowerCase())), [transactions, search])
  const income = transactions.filter(t => t.kind === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.kind === 'expense').reduce((s, t) => s + t.amount, 0)
  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !Number(form.amount) || Number(form.amount) <= 0) return
    setTransactions([{ id: Date.now(), name: form.name, category: form.category, date: 'Just now', amount: Number(form.amount), kind: form.kind, initials: form.name.slice(0, 2).toUpperCase(), color: form.kind === 'income' ? 'mint' : 'orange' }, ...transactions])
    setForm({ name: '', category: 'Food & groceries', amount: '', kind: 'expense' })
    setShowAdd(false)
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark">L</span><span>ledger<span className="brand-dot">.</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace"><span className="workspace-avatar">J</span><span><b>Personal space</b><small>Private workspace</small></span><ChevronDown size={15} /></div>
        <nav className="side-nav">
          <div className="nav-caption">MENU</div>
          {nav.map(item => <button key={item.label} className={`nav-link ${active === item.label ? 'active' : ''}`} onClick={() => { setActive(item.label); setMobileNav(false) }}><item.icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.label === 'Recurring bills' && <i className="nav-count">3</i>}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-icon"><ShieldCheck size={18} /></div><b>Your money, your data.</b><p>Private by design. Your records stay yours.</p><span>PRIVACY FIRST</span></div>
          <button className="nav-link"><Settings2 size={18} /><span>Settings</span></button>
          <button className="nav-link"><CircleHelp size={18} /><span>Help & support</span></button>
          <div className="profile-row"><div className="profile-avatar">J</div><span><b>Personal account</b><small>MYR · Malaysia</small></span><ChevronDown size={15} /></div>
        </div>
      </aside>
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={19} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div>
          <div className="top-actions"><div className="demo-pill"><span />{isSupabaseConfigured ? 'CONNECTED' : 'DEMO MODE'}</div><button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">J</div></div>
        </header>
        <div className="page-content">
          <section className="welcome-row"><div><div className="eyebrow">FRIDAY, 06 NOVEMBER 2026 <span>·</span> YOUR FINANCIAL OVERVIEW</div><h1>{active === 'Overview' ? 'Good afternoon.' : active}</h1><p className="page-subtitle">{active === 'Overview' ? 'A clearer picture of where your money goes.' : `A simple view of your ${active.toLowerCase()} and financial activity.`}</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17} /> Add transaction</button></section>
          {active === 'Overview' ? <>
            <section className="metric-grid">
              <article className="metric-card balance-card"><div className="metric-top"><span>Total balance</span><span className="metric-icon"><Wallet size={17} /></span></div><div className="metric-value">{money(12480.65)}</div><div className="metric-foot"><span className="trend-up"><ArrowUpRight size={14} /> 8.4%</span><span>vs. last month</span><span className="metric-period">ALL ACCOUNTS</span></div><div className="balance-glow" /></article>
              <article className="metric-card"><div className="metric-top"><span>Income this month</span><span className="metric-icon mint-icon"><ArrowDownLeft size={17} /></span></div><div className="metric-value">{money(income)}</div><div className="metric-foot"><span className="trend-up"><ArrowUpRight size={14} /> 4.2%</span><span>vs. last month</span></div><div className="metric-mini-bar"><i style={{ width: '72%' }} /></div></article>
              <article className="metric-card"><div className="metric-top"><span>Expenses this month</span><span className="metric-icon orange-icon"><ArrowUpRight size={17} /></span></div><div className="metric-value">{money(expenses)}</div><div className="metric-foot"><span className="trend-down">↓ 2.1%</span><span>vs. last month</span></div><div className="metric-mini-bar orange-bar"><i style={{ width: '48%' }} /></div></article>
              <article className="metric-card"><div className="metric-top"><span>Savings rate</span><span className="metric-icon purple-icon"><PiggyBank size={17} /></span></div><div className="metric-value">24.8<span className="metric-unit">%</span></div><div className="metric-foot"><span className="trend-up"><ArrowUpRight size={14} /> 3.6%</span><span>vs. last month</span></div><div className="metric-mini-bar purple-bar"><i style={{ width: '62%' }} /></div></article>
            </section>
            <section className="content-grid">
              <article className="panel cashflow-panel"><div className="panel-heading"><div><h2>Cash flow</h2><p>Income vs. expenses over time</p></div><button className="select-button">Last 6 months <ChevronDown size={14} /></button></div><div className="chart-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{ top: 12, right: 6, left: -16, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#68dbc2" stopOpacity={0.22} /><stop offset="100%" stopColor="#68dbc2" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff9a62" stopOpacity={0.15} /><stop offset="100%" stopColor="#ff9a62" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#20333b" vertical={false} strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#82939a', fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#82939a', fontSize: 10 }} tickFormatter={v => `RM${v / 1000}k`} /><Tooltip contentStyle={{ background: '#10252e', border: '1px solid #2b424b', borderRadius: 10, color: '#eaf2f3', fontSize: 12 }} formatter={(v) => money(Number(v))} /><Area type="monotone" dataKey="income" stroke="#68dbc2" strokeWidth={2.4} fill="url(#incomeFill)" /><Area type="monotone" dataKey="expense" stroke="#ff9a62" strokeWidth={2.2} fill="url(#expenseFill)" /></AreaChart></ResponsiveContainer></div></article>
              <article className="panel budget-panel"><div className="panel-heading"><div><h2>Budget overview</h2><p>Your monthly spending limits</p></div><button className="text-button" onClick={() => setActive('Budgets')}>See all <ArrowUpRight size={14} /></button></div><div className="budget-total"><div><small>MONTHLY BUDGET USED</small><strong>RM 2,184 <span>/ RM 3,500</span></strong></div><b>62%</b></div><div className="budget-track"><i style={{ width: '62%' }} /></div><div className="budget-list"><div className="budget-item"><span className="budget-dot food" /><div><b>Food & groceries</b><small>RM 620 of RM 900</small></div><strong>69%</strong></div><div className="budget-item"><span className="budget-dot transport" /><div><b>Transport</b><small>RM 310 of RM 500</small></div><strong>62%</strong></div><div className="budget-item"><span className="budget-dot lifestyle" /><div><b>Lifestyle</b><small>RM 420 of RM 700</small></div><strong>60%</strong></div><div className="budget-item"><span className="budget-dot bills" /><div><b>Bills & utilities</b><small>RM 834 of RM 1,400</small></div><strong>60%</strong></div></div></article>
            </section>
            <section className="content-grid lower-grid">
              <article className="panel transactions-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Your latest money movements</p></div><button className="text-button" onClick={() => setActive('Transactions')}>View all <ArrowUpRight size={14} /></button></div><TransactionList items={transactions.slice(0, 5)} /></article>
              <article className="panel goals-panel"><div className="panel-heading"><div><h2>Savings goals</h2><p>Small steps, meaningful progress</p></div><button className="text-button" onClick={() => setActive('Savings goals')}>View all <ArrowUpRight size={14} /></button></div><div className="goal-card"><div className="goal-top"><div className="goal-icon"><Landmark size={17} /></div><span>12 MONTHS LEFT</span></div><b>Emergency fund</b><div className="goal-amount">{money(4200)} <small>of RM 10,000</small></div><div className="goal-track"><i style={{ width: '42%' }} /></div><div className="goal-bottom"><span>42% completed</span><b>RM 5,800 to go</b></div></div><div className="goal-note"><Target size={16} /><span>You're making progress. Keep it consistent.</span></div></article>
            </section>
          </> : active === 'Transactions' ? <section className="panel full-panel"><div className="panel-heading"><div><h2>All transactions</h2><p>Review and search your money movements</p></div><div className="search-box"><Search size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions" /></div></div><TransactionList items={filtered} /></section> : <section className="panel empty-module"><div className="empty-icon"><activeIcon name={active} /></div><h2>{active}</h2><p>This workspace is scaffolded for the next build stage. Your records will be connected to your private Supabase account after configuration.</p><button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={16} /> Add transaction</button></section>}
          <footer className="page-footer"><span>LEDGER <i>·</i> PERSONAL FINANCE</span><span><ShieldCheck size={13} /> Private by design</span><span>MYR · Malaysia</span></footer>
        </div>
      </main>
      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><form className="transaction-modal" onSubmit={addTransaction} onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">MONEY MOVEMENT</span><h2>New transaction</h2></div><button type="button" className="icon-button" onClick={() => setShowAdd(false)}><X size={18} /></button></div><label>Transaction type<select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as 'income' | 'expense' })}><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Description<input required autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Grocery shopping" /></label><label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{['Food & groceries', 'Transport', 'Bills & utilities', 'Shopping', 'Health', 'Lifestyle', 'Salary', 'Side income', 'Other'].map(c => <option key={c}>{c}</option>)}</select></label><label>Amount (MYR)<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="primary-button">Save transaction</button></div><p className="modal-disclaimer">Demo mode: this entry is stored only in this browser session.</p></form></div>}
    </div>
  )
}
function activeIcon({ name }: { name: string }) {
  const Icon = name === 'Budgets' ? ChartNoAxesCombined : name === 'Accounts' ? Wallet : name === 'Financing' ? CreditCard : name === 'Savings goals' ? Target : name === 'Recurring bills' ? Repeat2 : name === 'Tax records' ? CalendarDays : ReceiptText
  return <Icon size={25} />
}
function TransactionList({ items }: { items: Tx[] }) {
  if (!items.length) return <div className="no-results">No transactions match your search.</div>
  return <div className="transaction-list">{items.map(t => <div className="transaction-row" key={t.id}><div className={`transaction-avatar ${t.color}`}>{t.initials}</div><div className="transaction-name"><b>{t.name}</b><small>{t.category} <i>·</i> {t.date}</small></div><strong className={t.kind === 'income' ? 'amount-income' : 'amount-expense'}>{t.kind === 'income' ? '+' : '−'}{money(t.amount)}</strong></div>)}</div>
}
export default App
