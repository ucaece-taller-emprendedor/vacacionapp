import { AdminSelect } from '@/components/admin/admin-select'
import { money } from '@/lib/catalog'
import { adminBookings } from '@/lib/data/admin'
import { BOOKING_STATUS_LABELS, BOOKING_STATUSES } from '@/lib/roles'

export default async function AdminReservas() {
  const reservas = await adminBookings()
  return (
    <section>
      <h1 className="text-3xl font-semibold">Reservas</h1>
      <p className="mt-2 text-[#6d858b]">{reservas.length} reservas. Los pagos son simulados.</p>
      <div className="mt-6 grid gap-3">
        {reservas.map(r => (
          <article key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dbe8e5] bg-white p-4">
            <div>
              <h2 className="font-semibold">{r.serviceTitle} <span className="font-normal text-[#6d858b]">· {r.provider}</span></h2>
              <p className="text-sm text-[#6d858b]">{r.fromDate}{r.toDate !== r.fromDate ? ` al ${r.toDate}` : ''} · {r.people} persona{r.people === 1 ? '' : 's'} · {r.tourist}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{money(r.total)}</span>
              <AdminSelect endpoint="/api/admin/bookings" id={r.id} field="status" value={r.status} label={`Estado de la reserva ${r.serviceTitle}`} options={BOOKING_STATUSES.map(e => [e, BOOKING_STATUS_LABELS[e]] as const)} />
            </div>
          </article>
        ))}
        {!reservas.length && <p className="rounded-2xl border border-dashed border-[#b9d7d2] p-6 text-sm text-[#6d858b]">Todavía no hay reservas.</p>}
      </div>
    </section>
  )
}
