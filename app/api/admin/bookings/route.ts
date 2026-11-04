import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { booking } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { HttpError, requireRole } from '@/lib/auth/guards'
import { adminReservaSchema } from '@/lib/validations/admin'

export const PATCH = route(async (request: Request) => {
  await requireRole('admin')
  const { id, status } = await parseBody(request, adminReservaSchema)
  const [actualizada] = await db
    .update(booking)
    .set({ status, cancelledAt: status === 'cancelled' ? new Date() : null })
    .where(eq(booking.id, id))
    .returning({ id: booking.id, status: booking.status })
  if (!actualizada) throw new HttpError(404, 'Reserva no encontrada.')
  return NextResponse.json(actualizada)
})
