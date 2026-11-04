import { AdminAction } from '@/components/admin/admin-action'
import { adminCommerces } from '@/lib/data/admin'
import { COMMERCE_STATUS_LABELS, type CommerceStatus } from '@/lib/roles'

export default async function AdminComercios() {
  const comercios = await adminCommerces()
  const endpoint = '/api/admin/commerces'
  return (
    <section>
      <h1 className="text-3xl font-semibold">Comercios</h1>
      <p className="mt-2 text-[#6d858b]">Los comercios pendientes aparecen primero. Un comercio aprobado publica sus servicios en el catálogo.</p>
      <div className="mt-6 grid gap-3">
        {comercios.map(c => (
          <article key={c.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dbe8e5] bg-white p-4">
            <div>
              <h2 className="font-semibold">{c.name}{c.demo && <span className="ml-2 rounded-full bg-[#fff4d9] px-2 py-0.5 text-xs text-[#9a6500]">demo</span>}</h2>
              <p className="text-sm text-[#6d858b]">{c.category} · {c.city} · {c.owner}</p>
              <p className="mt-1 text-xs font-semibold text-[#147e88]">Estado: {COMMERCE_STATUS_LABELS[c.status as CommerceStatus] ?? c.status}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.status !== 'approved' && <AdminAction endpoint={endpoint} body={{ id: c.id, status: 'approved' }} label="Aprobar" tone="primary" />}
              {c.status === 'approved' && <AdminAction endpoint={endpoint} body={{ id: c.id, status: 'suspended' }} label="Suspender" tone="danger" confirmText={`¿Suspender ${c.name}? Sus servicios dejan de verse.`} />}
              {c.status === 'pending' && <AdminAction endpoint={endpoint} body={{ id: c.id, status: 'rejected' }} label="Rechazar" tone="danger" />}
            </div>
          </article>
        ))}
        {!comercios.length && <p className="rounded-2xl border border-dashed border-[#b9d7d2] p-6 text-sm text-[#6d858b]">Todavía no hay comercios.</p>}
      </div>
    </section>
  )
}
