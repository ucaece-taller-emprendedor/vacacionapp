'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthModal } from '@/components/auth/auth-modal'
import { CompareBar } from '@/components/catalog/compare-bar'
import { Checkout } from '@/components/catalog/checkout'
import { Confirmation } from '@/components/catalog/confirmation'
import { Detail } from '@/components/catalog/detail'
import { Results } from '@/components/catalog/results'
import { useSession } from '@/lib/auth/client'
import { bookingTotal, shifts, type BookingForm, type Service } from '@/lib/catalog'

type Vista = 'results' | 'detail' | 'checkout' | 'confirmation'
type Props = { services: Service[]; googleEnabled: boolean; initialZone: string; initialFrom: string; initialTo: string }

/** Explorar → detalle → checkout → confirmación. Navegar es público; reservar y guardar favoritos exige sesión. */
export function Catalog({ services, googleEnabled, initialZone, initialFrom, initialTo }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [view, setView] = useState<Vista>('results')
  const [selected, setSelected] = useState<Service | null>(null)
  const [compare, setCompare] = useState<Service[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [booking, setBooking] = useState<BookingForm>({ from: '', to: '', people: '1', shift: 'Día completo' })
  const [auth, setAuth] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) return
    fetch('/api/account').then(r => (r.ok ? r.json() : null)).then((datos: { favorites: string[] } | null) => { if (datos) setFavorites(datos.favorites) })
  }, [userId])

  const subtotal = selected ? bookingTotal(selected, Number(booking.people) || 1) : 0

  const openDetail = (s: Service) => { setSelected(s); setBooking(b => ({ ...b, shift: shifts(s.category)[0] })); setError(''); setView('detail') }
  const toggleCompare = (s: Service) => setCompare(a => (a.some(x => x.id === s.id) ? a.filter(x => x.id !== s.id) : a.length < 3 ? [...a, s] : a))

  async function toggleFavorite(s: Pick<Service, 'id'>) {
    if (!userId) { setAuth(true); return }
    const saved = favorites.includes(s.id)
    setFavorites(items => (saved ? items.filter(item => item !== s.id) : [...items, s.id]))
    await (saved
      ? fetch(`/api/account?serviceId=${encodeURIComponent(s.id)}`, { method: 'DELETE' })
      : fetch('/api/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'favorite', serviceId: s.id }) }))
  }

  async function confirmBooking(paymentMethod: string) {
    if (!selected) return
    if (!userId) { setAuth(true); return }
    setSaving(true); setError('')
    const response = await fetch('/api/account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'booking', serviceId: selected.id, fromDate: booking.from, toDate: booking.to || booking.from, people: Number(booking.people), shift: booking.shift, paymentMethod }),
    })
    setSaving(false)
    if (!response.ok) {
      const datos = (await response.json().catch(() => null)) as { error?: string } | null
      setError(datos?.error ?? 'No pudimos confirmar la reserva. Intentá nuevamente.')
      return
    }
    const creada = (await response.json()) as { id: string }
    setCode(`VAC-${creada.id.slice(0, 6).toUpperCase()}`)
    setView('confirmation')
  }

  const goCheckout = () => { if (!userId) { setAuth(true); return } setView('checkout') }

  return (
    <>
      {view === 'results' && <Results services={services} destination={initialZone} from={initialFrom} to={initialTo} compare={compare} favorites={favorites} onClose={() => router.push('/')} onDetail={openDetail} onCompare={toggleCompare} onFavorite={toggleFavorite} />}
      {view === 'detail' && selected && <Detail service={selected} booking={booking} setBooking={setBooking} subtotal={subtotal} onBack={() => setView('results')} onCheckout={goCheckout} />}
      {view === 'checkout' && selected && <Checkout service={selected} booking={booking} subtotal={subtotal} error={error} saving={saving} onBack={() => setView('detail')} onConfirm={confirmBooking} />}
      {view === 'confirmation' && selected && <Confirmation service={selected} booking={booking} total={subtotal} code={code} />}
      {compare.length >= 2 && view === 'results' && <CompareBar items={compare} onClear={() => setCompare([])} onBook={openDetail} />}
      {auth && <AuthModal googleEnabled={googleEnabled} next="/explorar" onClose={() => setAuth(false)} onSuccess={() => setAuth(false)} />}
    </>
  )
}
