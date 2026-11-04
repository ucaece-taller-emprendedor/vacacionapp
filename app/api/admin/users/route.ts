import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { session, user } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { HttpError, requireRole } from '@/lib/auth/guards'
import { adminUsuarioSchema } from '@/lib/validations/admin'

export const PATCH = route(async (request: Request) => {
  const actual = await requireRole('admin')
  const { id, role, status } = await parseBody(request, adminUsuarioSchema)
  if (id === actual.id) throw new HttpError(409, 'No podés cambiar tu propio rol ni suspenderte.')
  const [actualizado] = await db
    .update(user)
    .set({ ...(role ? { role } : {}), ...(status ? { status } : {}), updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning({ id: user.id, role: user.role, status: user.status })
  if (!actualizado) throw new HttpError(404, 'Usuario no encontrado.')
  if (status === 'suspended') await db.delete(session).where(eq(session.userId, id)) // cierra sus sesiones abiertas
  return NextResponse.json(actualizado)
})
