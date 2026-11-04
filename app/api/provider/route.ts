import { NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { booking, commerce, service } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { HttpError, requireRole } from '@/lib/auth/guards'
import { servicioActualizarSchema, servicioCrearSchema } from '@/lib/validations/provider'

export const GET = route(async () => {
  const actual = await requireRole('provider')
  const comercios = await db.select().from(commerce).where(eq(commerce.ownerId, actual.id))
  const propio = comercios[0]
  const servicios = propio ? await db.select().from(service).where(eq(service.commerceId, propio.id)).orderBy(desc(service.createdAt)) : []
  const reservas = propio ? await db.select().from(booking).where(eq(booking.commerceId, propio.id)).orderBy(desc(booking.createdAt)) : []
  const canceladas = reservas.filter(item => item.status === 'cancelled').length
  const cuentan = reservas.filter(item => item.status === 'confirmed' || item.status === 'completed')
  return NextResponse.json({
    commerce: comercios,
    services: servicios,
    bookings: reservas,
    metrics: {
      total: reservas.length,
      pending: reservas.filter(item => item.status === 'pending').length,
      confirmed: reservas.filter(item => item.status === 'confirmed').length,
      cancelled: canceladas,
      completed: reservas.filter(item => item.status === 'completed').length,
      revenue: cuentan.reduce((suma, item) => suma + item.total, 0),
      cancellationRate: reservas.length ? Math.round((canceladas / reservas.length) * 100) : 0,
    },
  })
})

export const POST = route(async (request: Request) => {
  const actual = await requireRole('provider')
  const datos = await parseBody(request, servicioCrearSchema)
  const [propio] = await db.select({ id: commerce.id }).from(commerce).where(eq(commerce.ownerId, actual.id))
  if (!propio) throw new HttpError(403, 'Primero registrá tu comercio.')
  const fila = { id: crypto.randomUUID(), commerceId: propio.id, ...datos }
  await db.insert(service).values(fila)
  return NextResponse.json(fila, { status: 201 })
})

export const PATCH = route(async (request: Request) => {
  const actual = await requireRole('provider')
  const { id, ...cambios } = await parseBody(request, servicioActualizarSchema)
  const [propio] = await db.select({ id: commerce.id }).from(commerce).where(eq(commerce.ownerId, actual.id))
  if (!propio) throw new HttpError(403, 'Primero registrá tu comercio.')
  const [actualizado] = await db
    .update(service)
    .set({ ...cambios, updatedAt: new Date() })
    .where(and(eq(service.id, id), eq(service.commerceId, propio.id)))
    .returning()
  if (!actualizado) throw new HttpError(404, 'Servicio no encontrado.')
  return NextResponse.json(actualizado)
})
