'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CalendarDays, CheckCircle2, Heart, MessageCircle, UserRound, X } from 'lucide-react'
import { money } from '@/lib/catalog'
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/roles'

type Booking = { id: string; serviceTitle: string; provider: string; location: string; fromDate: string; toDate: string; people: number; shift: string; total: number; status: string }
type Profile = { name: string; email: string; phone?: string | null }
type Favorite = { id: string; title: string; provider: string; location: string; price: number; unit: string; image: string }
type Payment = { id: string; bookingId: string; amount: number; method: string | null; status: string; createdAt: string }
type Tab = 'reservas' | 'favoritos' | 'pagos' | 'chats' | 'perfil'

const etiquetaEstado = (estado: string) => BOOKING_STATUS_LABELS[estado as BookingStatus] ?? estado

export function AccountDashboard({ profile, bookings, favorites, payments }: { profile: Profile; bookings: Booking[]; favorites: Favorite[]; payments: Payment[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('reservas')
  const [form, setForm] = useState({ name: profile.name, phone: profile.phone ?? '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function saveProfile() {
    setBusy(true)
    setMessage('')
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setBusy(false)
    setMessage(response.ok ? 'Perfil actualizado correctamente.' : 'No pudimos guardar los cambios.')
    if (response.ok) router.refresh()
  }

  async function cancelBooking(id: string) {
    setBusy(true)
    const response = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: id, action: 'cancel' }) })
    setBusy(false)
    setMessage(response.ok ? 'Reserva cancelada.' : 'Esta reserva no se puede cancelar.')
    if (response.ok) router.refresh()
  }

  async function removeFavorite(id: string) {
    await fetch(`/api/account?serviceId=${encodeURIComponent(id)}`, { method: 'DELETE' })
    router.refresh()
  }

  const tabs = [['reservas', 'Mis reservas', CalendarDays], ['favoritos', 'Mis favoritos', Heart], ['pagos', 'Mis pagos', CheckCircle2], ['chats', 'Mis mensajes', MessageCircle], ['perfil', 'Mi perfil', UserRound]] as const

  return (
    <section className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2bbfc2]">Área personal</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Mi cuenta</h1>
      <p className="mt-2 text-[#6d858b]">Gestioná tus reservas y tus datos personales.</p>
      <div className="mt-8 flex gap-2 overflow-x-auto rounded-2xl border border-[#dbe8e5] bg-white p-2 sm:flex-wrap">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${tab === id ? 'bg-[#147e88] text-white' : 'text-[#55707a] hover:bg-[#eef7f5]'}`}><Icon className="size-4" />{label}</button>
        ))}
      </div>
      <div className="mt-6 rounded-3xl border border-[#dbe8e5] bg-white p-4 shadow-sm sm:p-6">
        {tab === 'reservas' && (
          <div>
            <h2 className="text-2xl font-semibold">Mis reservas</h2>
            {bookings.length === 0 ? (
              <p className="mt-5 text-sm text-[#6d858b]">Todavía no tenés reservas. <Link href="/explorar" className="font-semibold text-[#147e88]">Explorá servicios</Link> para hacer tu primera reserva.</p>
            ) : (
              <div className="mt-5 grid gap-3">
                {bookings.map(item => (
                  <article key={item.id} className="rounded-2xl border border-[#dbe8e5] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{item.serviceTitle}</h3>
                        <p className="mt-1 text-sm text-[#6d858b]">{item.provider} · {item.location}</p>
                        <p className="mt-2 text-xs text-[#7d969b]">{item.fromDate}{item.toDate !== item.fromDate ? ` al ${item.toDate}` : ''} · {item.shift} · {item.people} persona{item.people === 1 ? '' : 's'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{money(item.total)}</p>
                        <p className="mt-1 text-xs font-semibold capitalize text-[#147e88]">{etiquetaEstado(item.status)}</p>
                        {item.status === 'confirmed' && <button disabled={busy} onClick={() => cancelBooking(item.id)} className="mt-3 text-xs font-semibold text-red-600">Cancelar reserva</button>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'favoritos' && (
          <div>
            <h2 className="text-2xl font-semibold">Mis favoritos</h2>
            {favorites.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-[#dbe8e5] p-8 text-center">
                <Heart className="mx-auto size-10 text-[#ef6d62]" />
                <h3 className="mt-4 text-xl font-semibold">Todavía no guardaste favoritos</h3>
                <p className="mt-2 text-sm text-[#6d858b]">Explorá servicios y tocá el corazón para verlos acá.</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {favorites.map(item => (
                  <article key={item.id} className="overflow-hidden rounded-3xl border border-[#dbe8e5] bg-white">
                    <img src={item.image} alt={item.title} className="h-48 w-full object-cover" />
                    <div className="p-5">
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="mt-1 text-sm text-[#6d858b]">{item.provider} · {item.location}</p>
                        </div>
                        <button onClick={() => removeFavorite(item.id)} aria-label={`Quitar ${item.title}`}><X className="size-5 text-[#ef6d62]" /></button>
                      </div>
                      <p className="mt-4 text-lg font-bold">{money(item.price)} <span className="text-xs font-normal text-[#7d969b]">{item.unit}</span></p>
                      <Link href="/explorar" className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-full bg-[#123d51] text-sm font-medium text-white">Reservar</Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'pagos' && (
          <div>
            <h2 className="text-2xl font-semibold">Mis pagos</h2>
            <p className="mt-2 text-xs text-[#9a6500]">Los pagos son simulados: es una demostración y no se cobra nada.</p>
            {payments.length === 0 ? (
              <p className="mt-5 text-sm text-[#6d858b]">Todavía no hay pagos registrados. Los pagos aparecerán aquí cuando exista una transacción confirmada.</p>
            ) : (
              <div className="mt-5 grid gap-3">
                {payments.map(item => (
                  <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dbe8e5] p-4 text-sm">
                    <div>
                      <p className="font-semibold">{item.method ?? 'Pago'}</p>
                      <p className="text-xs text-[#7d969b]">{new Date(item.createdAt).toLocaleDateString('es-AR')} · simulado</p>
                    </div>
                    <p className="font-bold">{money(item.amount)}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'chats' && <p className="text-sm text-[#6d858b]">Todavía no tenés conversaciones. Los mensajes aparecerán cuando un comercio responda una consulta.</p>}
        {tab === 'perfil' && (
          <div>
            <h2 className="text-2xl font-semibold">Mi perfil</h2>
            <div className="mt-5 max-w-xl space-y-4">
              <label className="block text-sm font-semibold">Nombre<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field-input mt-1" /></label>
              <label className="block text-sm font-semibold">Email<input readOnly value={profile.email} className="field-input mt-1 bg-[#f3f7f6]" /></label>
              <label className="block text-sm font-semibold">Teléfono<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="field-input mt-1" /></label>
              <button disabled={busy} onClick={saveProfile} className="rounded-full bg-[#147e88] px-5 py-3 text-sm font-semibold text-white">{busy ? 'Guardando…' : 'Guardar cambios'}</button>
            </div>
          </div>
        )}
        {message && <p role="status" className="mt-5 text-sm font-semibold text-[#147e88]">{message}</p>}
      </div>
    </section>
  )
}
