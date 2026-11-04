import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { eq } from 'drizzle-orm'
import { db, pool } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { env } from '@/lib/env'

const trustedOrigins = [
  env.BETTER_AUTH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '',
].filter(Boolean)

export const auth = betterAuth({
  database: pool,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins,
  emailAndPassword: { enabled: true, autoSignIn: true, minPasswordLength: 8 },
  // Google se habilita solo si están las dos variables; si faltan, el botón se oculta en la UI.
  socialProviders: env.googleEnabled
    ? { google: { clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! } }
    : {},
  // role y status los maneja el servidor: nunca se aceptan desde el cliente (input: false).
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'client', input: false },
      status: { type: 'string', required: false, defaultValue: 'active', input: false },
      phone: { type: 'string', required: false, input: false },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  databaseHooks: {
    user: {
      create: {
        // ADMIN_EMAILS solo promueve emails verificados (Google); el admin de demo viene del seed.
        before: async newUser => {
          const esAdmin = newUser.emailVerified && env.ADMIN_EMAILS.includes(newUser.email.toLowerCase())
          return { data: { ...newUser, role: esAdmin ? 'admin' : 'client' } }
        },
      },
    },
    session: {
      create: {
        before: async newSession => {
          const [fila] = await db.select({ status: user.status }).from(user).where(eq(user.id, newSession.userId))
          if (fila?.status === 'suspended') throw new APIError('FORBIDDEN', { message: 'Tu cuenta está suspendida.' })
          return { data: newSession }
        },
      },
    },
  },
})
