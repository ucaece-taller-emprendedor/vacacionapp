import { ArrowLeft, Check, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money, shifts, today, type BookingForm, type Service } from '@/lib/catalog'

type Props = { service: Service; booking: BookingForm; setBooking: (b: BookingForm) => void; subtotal: number; onBack: () => void; onCheckout: () => void }

export function Detail({ service, booking, setBooking, subtotal, onBack, onCheckout }: Props) {
  const options = shifts(service.category)
  const porDia = service.category === 'Carpas y sombrillas'
  return (
    <div className="min-h-screen bg-[#fbfaf7] pt-24">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#147e88]"><ArrowLeft className="size-4" />Volver a resultados</button>
        <div className="grid gap-10 lg:grid-cols-[1fr_390px]">
          <div>
            <img src={service.image} alt={service.title} className="h-[390px] w-full rounded-3xl object-cover" />
            <p className="mt-8 text-sm font-semibold text-[#147e88]">{service.provider}</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight">{service.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-[#6d858b]"><MapPin className="size-4" />{service.location}, Mar del Plata</p>
            <p className="mt-7 text-base leading-relaxed text-[#55707a]">{service.description}</p>
            <h2 className="mt-8 font-semibold">Qué incluye</h2>
            <ul className="mt-3 grid gap-2 text-sm text-[#55707a] sm:grid-cols-2">{service.includes.map(x => <li key={x} className="flex gap-2"><Check className="size-4 text-[#147e88]" />{x}</li>)}</ul>
          </div>
          <aside className="h-fit rounded-3xl border border-[#dbe8e5] bg-white p-6 shadow-xl lg:sticky lg:top-24">
            <p className="text-sm text-[#6d858b]">Desde</p>
            <div className="mt-1"><span className="text-3xl font-bold">{money(service.price)}</span><span className="text-sm text-[#6d858b]"> {service.unit}</span></div>
            <div className="mt-6 flex flex-col gap-4">
              <label className="field-label">Desde
                <input required type="date" min={today()} className="field-input" value={booking.from} onChange={e => setBooking({ ...booking, from: e.target.value, to: booking.to && booking.to >= e.target.value ? booking.to : '' })} />
              </label>
              {porDia && (
                <label className="field-label">Hasta
                  <input required type="date" min={booking.from || today()} className="field-input" value={booking.to} onChange={e => setBooking({ ...booking, to: e.target.value })} />
                </label>
              )}
              <label className="field-label">Personas
                <div className="flex items-center justify-between rounded-xl border border-[#dbe8e5] px-3 py-2">
                  <button type="button" onClick={() => setBooking({ ...booking, people: String(Math.max(1, (Number(booking.people) || 1) - 1)) })}>−</button>
                  <input aria-label="Cantidad de personas" inputMode="numeric" className="w-20 bg-transparent text-center outline-none" value={booking.people} onChange={e => setBooking({ ...booking, people: e.target.value.replace(/[^0-9]/g, '') })} onBlur={() => setBooking({ ...booking, people: String(Math.max(1, Number(booking.people) || 1)) })} />
                  <button type="button" onClick={() => setBooking({ ...booking, people: String((Number(booking.people) || 1) + 1) })}>+</button>
                </div>
              </label>
              <label className="field-label">Horario
                <select className="field-input" value={booking.shift} onChange={e => setBooking({ ...booking, shift: e.target.value })}>{options.map(x => <option key={x}>{x}</option>)}</select>
              </label>
            </div>
            <div className="mt-6 flex justify-between border-t border-[#edf2f0] pt-5 font-bold"><span>Total</span><span>{money(subtotal)}</span></div>
            <p className="mt-2 text-xs text-[#147e88]">Sin cargos adicionales para vos.</p>
            <Button onClick={onCheckout} disabled={!booking.from || (porDia && !booking.to) || !Number(booking.people)} className="mt-6 w-full rounded-full bg-[#f5a623] py-6 text-[#183b4d]">Reservar ahora</Button>
          </aside>
        </div>
      </div>
    </div>
  )
}
