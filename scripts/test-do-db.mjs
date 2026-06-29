// Connectivity check for a Postgres DB. Reads DATABASE_URI from env (never hardcoded).
//   docker compose exec -e DATABASE_URI='postgresql://...?sslmode=require' app node scripts/test-do-db.mjs
import pg from 'pg'

if (!process.env.DATABASE_URI) {
  console.error('DATABASE_URI not set.')
  process.exit(1)
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  const v = await client.query('select version()')
  console.log('CONNECTED:', v.rows[0].version.split(',')[0])
  const t = await client.query(
    "select count(*)::int as n from information_schema.tables where table_schema='public'",
  )
  console.log('public tables:', t.rows[0].n)
  await client.end()
} catch (e) {
  console.error('DB ERROR:', e?.message || String(e))
  process.exit(2)
}
process.exit(0)
