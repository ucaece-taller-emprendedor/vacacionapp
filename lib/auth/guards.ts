import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import type { Role } from '@/lib/roles'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  phone: string | null
}

export class HttpError extends Error {
  constructor(
    public status: 401 | 403 | 404 | 409,
    message: string,
  ) {
    super(message)
  }
}

/** Usuario de la sesión actual leído del servidor (rol y estado siempre vienen de la base). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const actual = await auth.api.getSession({ headers: await headers() })
  if (!actual) return null
  const { user } = actual as { user: typeof actual.user & { role?: string; status?: string; phone?: string | null } }
  if (user.status === 'suspended') return null
  const esAdminPorEmail = user.emailVerified && env.ADMIN_EMAILS.includes(user.email.toLowerCase())
  const role: Role = esAdminPorEmail || user.role === 'admin' ? 'admin' : user.role === 'provider' ? 'provider' : 'client'
  return { id: user.id, name: user.name, email: user.email, role, phone: user.phone ?? null }
}

/** Para route handlers y server actions: lanza 401/403 si no hay sesión o el rol no alcanza. */
export async function requireRole(roles: Role | Role[]): Promise<SessionUser> {
  const permitidos = Array.isArray(roles) ? roles : [roles]
  const actual = await getSessionUser()
  if (!actual) throw new HttpError(401, 'Tenés que iniciar sesión.')
  if (!permitidos.includes(actual.role)) throw new HttpError(403, 'No tenés permiso para hacer esto.')
  return actual
}

/** Para páginas y layouts: redirige al login en vez de lanzar un error. */
export async function requirePageRole(roles: Role | Role[], loginPath = '/app/ingresar'): Promise<SessionUser> {
  const permitidos = Array.isArray(roles) ? roles : [roles]
  const actual = await getSessionUser()
  if (!actual) redirect(loginPath)
  if (!permitidos.includes(actual.role)) redirect(actual.role === 'admin' ? '/admin' : '/app')
  return actual
}
