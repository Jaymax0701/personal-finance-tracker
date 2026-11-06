import { createRemoteJWKSet, jwtVerify } from 'jose'

interface Env {
  DB: D1Database
  ASSETS: Fetcher
  CF_ACCESS_TEAM_DOMAIN: string
  CF_ACCESS_AUD: string
}

type AccessIdentity = { id: string; email?: string }

async function authenticate(request: Request, env: Env): Promise<AccessIdentity | null> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion')
  if (!token || !env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) return null
  try {
    const issuer = env.CF_ACCESS_TEAM_DOMAIN.replace(/\/$/, '')
    const jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`))
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: env.CF_ACCESS_AUD,
    })
    if (typeof payload.sub !== 'string' || !payload.sub) return null
    return { id: payload.sub, email: typeof payload.email === 'string' ? payload.email : undefined }
  } catch {
    return null
  }
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 })

    const identity = await authenticate(request, env)
    if (!identity) return json({ error: 'Authentication required' }, 401)

    await env.DB.prepare(
      'INSERT INTO users (id, email) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET email = excluded.email, updated_at = datetime(\'now\')'
    ).bind(identity.id, identity.email ?? null).run()

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({ ok: true, database: 'connected' })
    }

    if (url.pathname === '/api/transactions' && request.method === 'GET') {
      const result = await env.DB.prepare(
        'SELECT id, transaction_type, amount_cents, currency_code, category, description, transaction_date, merchant, notes, created_at FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC, created_at DESC LIMIT 500'
      ).bind(identity.id).all()
      return json({ transactions: result.results })
    }

    if (url.pathname === '/api/transactions' && request.method === 'POST') {
      let body: Record<string, unknown>
      try { body = await request.json() as Record<string, unknown> } catch { return json({ error: 'Invalid JSON body' }, 400) }
      const type = body.transaction_type
      const amount = body.amount_cents
      const category = typeof body.category === 'string' ? body.category.trim() : ''
      const description = typeof body.description === 'string' ? body.description.trim() : ''
      const date = typeof body.transaction_date === 'string' ? body.transaction_date : ''
      if (!['income', 'expense', 'transfer'].includes(String(type)) ||
          !Number.isSafeInteger(amount) || Number(amount) <= 0 ||
          !category || category.length > 80 || !description || description.length > 160 ||
          !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return json({ error: 'Please provide a valid type, positive amount in cents, category, description and date.' }, 400)
      }
      const id = crypto.randomUUID()
      await env.DB.prepare(
        'INSERT INTO transactions (id, user_id, transaction_type, amount_cents, currency_code, category, description, transaction_date, merchant, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, identity.id, type, amount, typeof body.currency_code === 'string' ? body.currency_code : 'MYR', category, description, date, typeof body.merchant === 'string' ? body.merchant : null, typeof body.notes === 'string' ? body.notes : null).run()
      return json({ id }, 201)
    }

    return json({ error: 'Not found' }, 404)
  },
}
