import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { booking, commerce } from '@/lib/db/schema'

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json() as { id?: string; status?: string }
  if (!body.id || !['confirmed', 'cancelled', 'completed'].includes(body.status || '')) return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
  const businesses = await db.select({ name: commerce.name }).from(commerce).where(eq(commerce.ownerId, session.user.id))
  const names = businesses.map(item => item.name)
  if (!names.length) return NextResponse.json({ error: 'Sin comercio' }, { status: 403 })
  const rows = await db.select({ id: booking.id }).from(booking).where(and(eq(booking.id, body.id), eq(booking.provider, names[0])))
  if (!rows.length) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
  const result = await db.update(booking).set({ status: body.status, cancelledAt: body.status === 'cancelled' ? new Date() : null }).where(and(eq(booking.id, body.id), eq(booking.provider, names[0]))).returning()
  return NextResponse.json(result[0])
}
