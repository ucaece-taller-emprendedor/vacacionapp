import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { booking, commerce } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { HttpError, requireRole } from '@/lib/auth/guards'
import { reservaEstadoSchema } from '@/lib/validations/provider'

export const PATCH = route(async (request: Request) => {
  const actual = await requireRole('provider')
  const { id, status } = await parseBody(request, reservaEstadoSchema)
  const [propio] = await db.select({ id: commerce.id }).from(commerce).where(eq(commerce.ownerId, actual.id))
  if (!propio) throw new HttpError(403, 'Sin comercio.')
  const [actualizada] = await db
    .update(booking)
    .set({ status, cancelledAt: status === 'cancelled' ? new Date() : null })
    .where(and(eq(booking.id, id), eq(booking.commerceId, propio.id)))
    .returning()
  if (!actualizada) throw new HttpError(404, 'Reserva no encontrada.')
  return NextResponse.json(actualizada)
})
