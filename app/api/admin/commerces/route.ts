import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { commerce } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { HttpError, requireRole } from '@/lib/auth/guards'
import { adminComercioSchema } from '@/lib/validations/admin'

export const PATCH = route(async (request: Request) => {
  await requireRole('admin')
  const { id, status } = await parseBody(request, adminComercioSchema)
  const [actualizado] = await db.update(commerce).set({ status, updatedAt: new Date() }).where(eq(commerce.id, id)).returning({ id: commerce.id, status: commerce.status })
  if (!actualizado) throw new HttpError(404, 'Comercio no encontrado.')
  return NextResponse.json(actualizado)
})
