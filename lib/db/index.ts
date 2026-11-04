import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '@/lib/env'
import * as schema from './schema'

const globalParaPool = globalThis as unknown as { __vacacionappPool?: Pool }

// Un solo pool por proceso (evita agotar conexiones con el hot reload en desarrollo).
export const pool = globalParaPool.__vacacionappPool ?? new Pool({ connectionString: env.DATABASE_URL, max: 10 })
if (process.env.NODE_ENV !== 'production') globalParaPool.__vacacionappPool = pool

export const db = drizzle(pool, { schema })
