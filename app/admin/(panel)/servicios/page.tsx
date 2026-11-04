import { AdminAction } from '@/components/admin/admin-action'
import { money } from '@/lib/catalog'
import { adminServices } from '@/lib/data/admin'

export default async function AdminServicios() {
  const servicios = await adminServices()
  return (
    <section>
      <h1 className="text-3xl font-semibold">Servicios</h1>
      <p className="mt-2 text-[#6d858b]">{servicios.length} servicios. Desactivar un servicio lo oculta del catálogo.</p>
      <div className="mt-6 grid gap-3">
        {servicios.map(s => (
          <article key={s.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dbe8e5] bg-white p-4">
            <div>
              <h2 className="font-semibold">{s.title}{s.demo && <span className="ml-2 rounded-full bg-[#fff4d9] px-2 py-0.5 text-xs text-[#9a6500]">demo</span>}</h2>
              <p className="text-sm text-[#6d858b]">{s.commerce} · {s.category} · {money(s.price)} {s.unit}</p>
              <p className="mt-1 text-xs font-semibold text-[#147e88]">{s.active ? 'Activo' : 'Inactivo'}{s.commerceStatus !== 'approved' ? ' · comercio no aprobado (no se publica)' : ''}</p>
            </div>
            <AdminAction endpoint="/api/admin/services" body={{ id: s.id, active: !s.active }} label={s.active ? 'Desactivar' : 'Activar'} tone={s.active ? 'danger' : 'primary'} />
          </article>
        ))}
      </div>
    </section>
  )
}
