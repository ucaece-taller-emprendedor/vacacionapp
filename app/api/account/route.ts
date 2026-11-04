import { NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { booking, commerce, favorite, payment, service } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { HttpError, requireRole } from '@/lib/auth/guards'
import { bookingTotal, shifts } from '@/lib/catalog'
import { cuentaCancelarSchema, cuentaFavoritoDeleteSchema, cuentaPostSchema } from '@/lib/validations/account'

const ROLES_CUENTA = ['client', 'provider'] as const

export const GET = route(async () => {
  const actual = await requireRole([...ROLES_CUENTA])
  const [favoritos, reservas] = await Promise.all([
    db.select({ serviceId: favorite.serviceId }).from(favorite).where(eq(favorite.userId, actual.id)),
    db.select().from(booking).where(eq(booking.userId, actual.id)).orderBy(desc(booking.createdAt)),
  ])
  return NextResponse.json({ favorites: favoritos.map(f => f.serviceId), bookings: reservas })
})

export const POST = route(async (request: Request) => {
  const actual = await requireRole([...ROLES_CUENTA])
  const datos = await parseBody(request, cuentaPostSchema)

  const [encontrado] = await db
    .select({ service, comercio: commerce })
    .from(service)
    .innerJoin(commerce, eq(service.commerceId, commerce.id))
    .where(and(eq(service.id, datos.serviceId), eq(service.active, true), eq(commerce.status, 'approved')))
  if (!encontrado) throw new HttpError(404, 'El servicio no está disponible.')

  if (datos.type === 'favorite') {
    const fila = { id: crypto.randomUUID(), userId: actual.id, serviceId: datos.serviceId }
    await db.insert(favorite).values(fila).onConflictDoNothing()
    return NextResponse.json(fila, { status: 201 })
  }

  const hoy = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] // tolerancia por huso horario
  const esCarpa = encontrado.service.category === 'Carpas y sombrillas'
  const toDate = esCarpa ? datos.toDate : datos.fromDate
  if (datos.fromDate < hoy) throw new HttpError(409, 'La fecha ya pasó.')
  if (toDate < datos.fromDate) throw new HttpError(409, 'La fecha de salida no puede ser anterior a la de entrada.')
  if (!shifts(encontrado.service.category).includes(datos.shift)) throw new HttpError(409, 'El horario elegido no es válido.')

  const total = bookingTotal(encontrado.service, datos.people)
  const fila = {
    id: crypto.randomUUID(),
    userId: actual.id,
    serviceId: encontrado.service.id,
    commerceId: encontrado.comercio.id,
    serviceTitle: encontrado.service.title,
    provider: encontrado.comercio.name,
    location: encontrado.service.location,
    fromDate: datos.fromDate,
    toDate,
    people: datos.people,
    shift: datos.shift,
    total,
  }
  // El pago es simulado: solo se registra, no se cobra nada.
  await db.transaction(async tx => {
    await tx.insert(booking).values(fila)
    await tx.insert(payment).values({ id: crypto.randomUUID(), userId: actual.id, bookingId: fila.id, amount: total, method: datos.paymentMethod, status: 'simulated' })
  })
  return NextResponse.json({ ...fila, status: 'confirmed' }, { status: 201 })
})

export const DELETE = route(async (request: Request) => {
  const actual = await requireRole([...ROLES_CUENTA])
  const { searchParams } = new URL(request.url)
  const { serviceId } = cuentaFavoritoDeleteSchema.parse({ serviceId: searchParams.get('serviceId') })
  await db.delete(favorite).where(and(eq(favorite.userId, actual.id), eq(favorite.serviceId, serviceId)))
  return new NextResponse(null, { status: 204 })
})

export const PATCH = route(async (request: Request) => {
  const actual = await requireRole([...ROLES_CUENTA])
  const { bookingId } = await parseBody(request, cuentaCancelarSchema)
  const [cancelada] = await db
    .update(booking)
    .set({ status: 'cancelled', cancelledAt: new Date() })
    .where(and(eq(booking.id, bookingId), eq(booking.userId, actual.id), eq(booking.status, 'confirmed')))
    .returning()
  if (!cancelada) throw new HttpError(409, 'La reserva no se puede cancelar.')
  return NextResponse.json(cancelada)
})
