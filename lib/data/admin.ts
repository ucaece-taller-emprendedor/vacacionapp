import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { booking, commerce, service, user } from '@/lib/db/schema'

export async function adminStats() {
  const [fila] = await db
    .select({
      usuarios: sql<number>`(select count(*)::int from "user")`,
      comerciosPendientes: sql<number>`(select count(*)::int from commerce where status = 'pending')`,
      comerciosAprobados: sql<number>`(select count(*)::int from commerce where status = 'approved')`,
      servicios: sql<number>`(select count(*)::int from service)`,
      reservas: sql<number>`(select count(*)::int from booking)`,
      ingresos: sql<number>`(select coalesce(sum(total), 0)::int from booking where status in ('confirmed', 'completed'))`,
    })
    .from(sql`(select 1) as t`)
  return fila
}

export const adminUsers = () =>
  db.select({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, demo: user.demo, createdAt: user.createdAt }).from(user).orderBy(desc(user.createdAt))

export const adminCommerces = () =>
  db
    .select({ id: commerce.id, name: commerce.name, category: commerce.category, email: commerce.email, phone: commerce.phone, city: commerce.city, status: commerce.status, demo: commerce.demo, owner: user.email, createdAt: commerce.createdAt })
    .from(commerce)
    .innerJoin(user, eq(commerce.ownerId, user.id))
    .orderBy(sql`case when ${commerce.status} = 'pending' then 0 else 1 end`, desc(commerce.createdAt))

export const adminServices = () =>
  db
    .select({ id: service.id, title: service.title, category: service.category, price: service.price, unit: service.unit, active: service.active, demo: service.demo, commerce: commerce.name, commerceStatus: commerce.status })
    .from(service)
    .innerJoin(commerce, eq(service.commerceId, commerce.id))
    .orderBy(commerce.name, service.title)

export const adminBookings = () =>
  db
    .select({ id: booking.id, serviceTitle: booking.serviceTitle, provider: booking.provider, fromDate: booking.fromDate, toDate: booking.toDate, people: booking.people, total: booking.total, status: booking.status, createdAt: booking.createdAt, tourist: user.email })
    .from(booking)
    .innerJoin(user, eq(booking.userId, user.id))
    .orderBy(desc(booking.createdAt))
