import { desc, eq } from 'drizzle-orm'
import { AccountDashboard } from '@/components/account-dashboard'
import { requirePageRole } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { booking, commerce, favorite, payment, service } from '@/lib/db/schema'

export const metadata = { title: 'Mi cuenta | VacacionApp' }

export default async function CuentaPage() {
  const actual = await requirePageRole(['client', 'provider'])
  const [reservas, favoritos, pagos] = await Promise.all([
    db.select().from(booking).where(eq(booking.userId, actual.id)).orderBy(desc(booking.createdAt)),
    db
      .select({ id: service.id, title: service.title, provider: commerce.name, location: service.location, price: service.price, unit: service.unit, image: service.image })
      .from(favorite)
      .innerJoin(service, eq(favorite.serviceId, service.id))
      .innerJoin(commerce, eq(service.commerceId, commerce.id))
      .where(eq(favorite.userId, actual.id)),
    db.select().from(payment).where(eq(payment.userId, actual.id)).orderBy(desc(payment.createdAt)),
  ])
  return (
    <AccountDashboard
      profile={{ name: actual.name, email: actual.email, phone: actual.phone }}
      bookings={reservas.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      favorites={favoritos}
      payments={pagos.map(p => ({ id: p.id, bookingId: p.bookingId, amount: p.amount, method: p.method, status: p.status, createdAt: p.createdAt.toISOString() }))}
    />
  )
}
