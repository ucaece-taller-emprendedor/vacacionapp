'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BarChart3, Building2, CalendarCheck, Check, CircleDollarSign, Clock3, MessageCircle, Plus, Settings2, X, type LucideIcon } from 'lucide-react'
import { CATEGORIES, LOCATIONS, money } from '@/lib/catalog'
import { BOOKING_STATUS_LABELS, COMMERCE_STATUS_LABELS, type BookingStatus, type CommerceStatus } from '@/lib/roles'

type Service = { id: string; title: string; description: string; category: string; location: string; price: number; unit: string; active: boolean }
type Booking = { id: string; serviceTitle: string; fromDate: string; toDate: string; people: number; shift: string; total: number; status: string; createdAt: string }
type Metrics = { total: number; pending: number; confirmed: number; cancelled: number; completed: number; revenue: number; cancellationRate: number }
type Commerce = { id: string; name: string; status: string; category: string }
type Tab = 'overview' | 'bookings' | 'services' | 'calendar' | 'finance' | 'analytics' | 'messages' | 'settings'

const emptyMetrics: Metrics = { total: 0, pending: 0, confirmed: 0, cancelled: 0, completed: 0, revenue: 0, cancellationRate: 0 }
const emptyService = { title: '', description: '', category: CATEGORIES[1], location: LOCATIONS[1], price: '', unit: 'por día' }
const statusLabel = (status: string) => BOOKING_STATUS_LABELS[status as BookingStatus] ?? status

export function ProviderDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [data, setData] = useState<{ commerce: Commerce[]; services: Service[]; bookings: Booking[]; metrics: Metrics }>({ commerce: [], services: [], bookings: [], metrics: emptyMetrics })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [newService, setNewService] = useState(emptyService)

  const load = async () => {
    const response = await fetch('/api/provider')
    if (!response.ok) { setError('No pudimos cargar el panel.'); setLoading(false); return }
    setData(await response.json())
    setLoading(false)
  }
  useEffect(() => {
    fetch('/api/provider')
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('panel'))))
      .then(setData)
      .catch(() => setError('No pudimos cargar el panel.'))
      .finally(() => setLoading(false))
  }, [])

  const commerceItem = data.commerce[0]
  const nav: ReadonlyArray<readonly [Tab, string, LucideIcon]> = [['overview', 'Resumen', BarChart3], ['bookings', 'Reservas', CalendarCheck], ['services', 'Mis servicios', Building2], ['calendar', 'Disponibilidad', Clock3], ['finance', 'Ingresos y pagos', CircleDollarSign], ['analytics', 'Analíticas', BarChart3], ['messages', 'Mensajes', MessageCircle], ['settings', 'Comercio y perfil', Settings2]]

  async function updateBooking(id: string, status: string) {
    if (!window.confirm(`¿Confirmás cambiar la reserva a ${statusLabel(status)}?`)) return
    const response = await fetch('/api/provider/bookings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (!response.ok) { setError('No pudimos actualizar la reserva.'); return }
    setMessage('Reserva actualizada.')
    await load()
  }

  async function createService(event: FormEvent) {
    event.preventDefault()
    if (!commerceItem) return
    const response = await fetch('/api/provider', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newService, price: Number(newService.price) }) })
    if (!response.ok) { setError('Revisá los datos del servicio.'); return }
    setError('')
    setNewService(emptyService)
    setMessage('Servicio creado y guardado.')
    await load()
  }

  async function toggleService(service: Service) {
    await fetch('/api/provider', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: service.id, active: !service.active }) })
    await load()
  }

  const cards = [['Reservas recibidas', data.metrics.total, CalendarCheck], ['Pendientes', data.metrics.pending, Clock3], ['Confirmadas', data.metrics.confirmed, Check], ['Ingresos confirmados', money(data.metrics.revenue), CircleDollarSign]] as const
  const estado = commerceItem ? COMMERCE_STATUS_LABELS[commerceItem.status as CommerceStatus] ?? commerceItem.status : ''

  return (
    <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[230px_1fr]">
      <aside className="flex h-fit gap-1 overflow-x-auto rounded-3xl border border-[#dbe8e5] bg-white p-3 lg:sticky lg:top-24 lg:block">
        <p className="hidden px-3 pb-3 text-xs font-bold uppercase tracking-[.16em] text-[#2bbfc2] lg:block">Área profesional</p>
        {nav.map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold lg:w-full ${tab === key ? 'bg-[#eaf7f5] text-[#147e88]' : 'text-[#55707a] hover:bg-[#f5faf9]'}`}><Icon className="size-4" />{label}</button>
        ))}
      </aside>
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#2bbfc2]">Panel de proveedor</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{commerceItem?.name || 'Tu espacio profesional'}</h1>
            <p className="mt-2 text-[#6d858b]">{commerceItem ? `Estado: ${estado}` : 'Registrá un comercio para comenzar.'}</p>
            {commerceItem && commerceItem.status !== 'approved' && <p className="mt-2 text-sm text-[#9a6500]">Tus servicios se publican en el catálogo cuando el equipo apruebe tu comercio.</p>}
          </div>
          {!loading && !commerceItem && <Link href="/app/prestador/comercio" className="rounded-full bg-[#147e88] px-5 py-3 text-sm font-semibold text-white">Sumar mi comercio</Link>}
        </div>
        {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-2xl bg-[#eaf7f5] p-4 text-sm text-[#147e88]">{message}</p>}
        {loading ? (
          <p className="mt-10 text-[#6d858b]">Cargando datos reales…</p>
        ) : !commerceItem ? (
          <div className="mt-8 rounded-3xl border border-dashed border-[#b9d7d2] bg-white p-8">
            <h2 className="text-xl font-semibold">Todavía no tenés un comercio asociado</h2>
            <p className="mt-2 text-[#6d858b]">Este panel no muestra datos ficticios. Cuando envíes tu solicitud, aparecerá aquí con su estado real.</p>
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {cards.map(([label, value, Icon]) => (
                    <article key={label} className="rounded-3xl border border-[#dbe8e5] bg-white p-5">
                      <Icon className="size-5 text-[#147e88]" />
                      <p className="mt-5 text-sm text-[#6d858b]">{label}</p>
                      <p className="mt-1 text-2xl font-semibold">{value}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <article className="rounded-3xl border border-[#dbe8e5] bg-white p-6">
                    <h2 className="text-xl font-semibold">Estado del negocio</h2>
                    <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div><dt className="text-[#6d858b]">Completadas</dt><dd className="mt-1 text-xl font-semibold">{data.metrics.completed}</dd></div>
                      <div><dt className="text-[#6d858b]">Canceladas</dt><dd className="mt-1 text-xl font-semibold">{data.metrics.cancelled}</dd></div>
                      <div><dt className="text-[#6d858b]">Tasa de cancelación</dt><dd className="mt-1 text-xl font-semibold">{data.metrics.cancellationRate}%</dd></div>
                      <div><dt className="text-[#6d858b]">Servicios activos</dt><dd className="mt-1 text-xl font-semibold">{data.services.filter(item => item.active).length}</dd></div>
                    </dl>
                  </article>
                  <article className="rounded-3xl border border-dashed border-[#b9d7d2] bg-white p-6">
                    <h2 className="text-xl font-semibold">Evolución por período</h2>
                    <p className="mt-2 text-sm text-[#6d858b]">Los gráficos aparecerán cuando existan reservas reales asociadas a tu comercio.</p>
                    <div className="mt-8 flex h-24 items-end gap-2">{[18, 28, 12, 34, 22, 16, 30].map((height, index) => <div key={index} className="flex-1 rounded-t bg-[#d9efec]" style={{ height: data.metrics.total ? `${height}%` : '8%' }} />)}</div>
                  </article>
                </div>
              </>
            )}
            {tab === 'bookings' && <Bookings bookings={data.bookings} onUpdate={updateBooking} />}
            {tab === 'services' && (
              <>
                <article className="mt-8 rounded-3xl border border-[#dbe8e5] bg-white p-6">
                  <h2 className="text-xl font-semibold">Crear servicio</h2>
                  <form onSubmit={createService} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input required placeholder="Nombre del servicio" value={newService.title} onChange={event => setNewService({ ...newService, title: event.target.value })} className="field-input" />
                    <select aria-label="Categoría" value={newService.category} onChange={event => setNewService({ ...newService, category: event.target.value })} className="field-input">{CATEGORIES.slice(1).map(x => <option key={x}>{x}</option>)}</select>
                    <textarea required placeholder="Descripción" value={newService.description} onChange={event => setNewService({ ...newService, description: event.target.value })} className="field-input min-h-24 sm:col-span-2" />
                    <select aria-label="Zona" value={newService.location} onChange={event => setNewService({ ...newService, location: event.target.value })} className="field-input">{LOCATIONS.slice(1).map(x => <option key={x}>{x}</option>)}</select>
                    <input required min="0" type="number" placeholder="Precio" value={newService.price} onChange={event => setNewService({ ...newService, price: event.target.value })} className="field-input" />
                    <input required placeholder="Unidad, por ejemplo por día" value={newService.unit} onChange={event => setNewService({ ...newService, unit: event.target.value })} className="field-input sm:col-span-2" />
                    <button className="flex items-center justify-center gap-2 rounded-full bg-[#147e88] px-5 py-3 font-semibold text-white sm:col-span-2"><Plus className="size-4" />Guardar servicio</button>
                  </form>
                </article>
                <div className="mt-5 grid gap-3">
                  {data.services.map(service => (
                    <article key={service.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dbe8e5] bg-white p-4">
                      <div>
                        <h3 className="font-semibold">{service.title}</h3>
                        <p className="text-sm text-[#6d858b]">{service.category} · {money(service.price)} {service.unit}</p>
                      </div>
                      <button onClick={() => toggleService(service)} className="rounded-full border border-[#b9d7d2] px-4 py-2 text-sm font-semibold">{service.active ? 'Desactivar' : 'Activar'}</button>
                    </article>
                  ))}
                  {!data.services.length && <p className="rounded-2xl border border-dashed border-[#b9d7d2] p-6 text-sm text-[#6d858b]">Todavía no hay servicios creados.</p>}
                </div>
              </>
            )}
            {tab === 'calendar' && <Empty title="Disponibilidad y calendario" text="La base está preparada para disponibilidad; todavía no hay horarios configurados para este comercio." />}
            {tab === 'finance' && <Empty title="Ingresos y pagos" text="Se muestran reservas e ingresos confirmados. Los pagos son simulados: no hay una pasarela conectada." />}
            {tab === 'analytics' && <Empty title="Analíticas" text="Las métricas se calculan desde reservas reales. Aún no hay suficiente actividad para comparar períodos." />}
            {tab === 'messages' && <Empty title="Mensajes" text="La mensajería todavía no tiene conversaciones reales asociadas a este comercio." />}
            {tab === 'settings' && <Empty title="Comercio y perfil" text="La ficha queda pendiente de aprobación administrativa antes de publicarse." />}
          </>
        )}
      </div>
    </section>
  )
}

function Bookings({ bookings, onUpdate }: { bookings: Booking[]; onUpdate: (id: string, status: string) => void }) {
  const [status, setStatus] = useState('all')
  const visible = useMemo(() => (status === 'all' ? bookings : bookings.filter(item => item.status === status)), [bookings, status])
  return (
    <article className="mt-8 rounded-3xl border border-[#dbe8e5] bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Mis reservas</h2>
          <p className="mt-1 text-sm text-[#6d858b]">Solo se muestran reservas asociadas a tu comercio.</p>
        </div>
        <select aria-label="Filtrar reservas por estado" value={status} onChange={event => setStatus(event.target.value)} className="field-input">
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>
      <div className="mt-5 grid gap-3">
        {visible.map(item => (
          <div key={item.id} className="rounded-2xl border border-[#e4eeeb] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.serviceTitle}</p>
                <p className="mt-1 text-sm text-[#6d858b]">{item.fromDate} · {item.shift} · {item.people} persona{item.people === 1 ? '' : 's'}</p>
                <p className="text-xs text-[#7d969b]">Creada: {new Date(item.createdAt).toLocaleDateString('es-AR')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{money(item.total)}</p>
                <span className="text-xs font-semibold text-[#147e88]">{statusLabel(item.status)}</span>
              </div>
            </div>
            {item.status === 'pending' && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => onUpdate(item.id, 'confirmed')} className="rounded-full bg-[#147e88] px-3 py-2 text-xs font-semibold text-white"><Check className="mr-1 inline size-3" />Confirmar</button>
                <button onClick={() => onUpdate(item.id, 'cancelled')} className="rounded-full border border-[#e9b6ae] px-3 py-2 text-xs font-semibold text-[#a84a3f]"><X className="mr-1 inline size-3" />Rechazar</button>
              </div>
            )}
            {item.status === 'confirmed' && <button onClick={() => onUpdate(item.id, 'completed')} className="mt-3 rounded-full border border-[#b9d7d2] px-3 py-2 text-xs font-semibold">Marcar completada</button>}
          </div>
        ))}
        {!visible.length && <div className="rounded-2xl border border-dashed border-[#b9d7d2] p-8 text-center text-sm text-[#6d858b]">No hay reservas con este estado.</div>}
      </div>
    </article>
  )
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <article className="mt-8 rounded-3xl border border-dashed border-[#b9d7d2] bg-white p-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-[#6d858b]">{text}</p>
    </article>
  )
}
