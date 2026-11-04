import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { service } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { HttpError, requireRole } from '@/lib/auth/guards'
import { adminServicioSchema } from '@/lib/validations/admin'

export const PATCH = route(async (request: Request) => {
  await requireRole('admin')
  const { id, active } = await parseBody(request, adminServicioSchema)
  const [actualizado] = await db.update(service).set({ active, updatedAt: new Date() }).where(eq(service.id, id)).returning({ id: service.id, active: service.active })
  if (!actualizado) throw new HttpError(404, 'Servicio no encontrado.')
  return NextResponse.json(actualizado)
})
