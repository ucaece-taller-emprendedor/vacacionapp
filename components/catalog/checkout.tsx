import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money, type BookingForm, type Service } from '@/lib/catalog'
import type { metodosDePago } from '@/lib/validations/account'

type Metodo = (typeof metodosDePago)[number]
type Props = { service: Service; booking: BookingForm; subtotal: number; error: string; saving: boolean; onBack: () => void; onConfirm: (metodo: Metodo) => void }

export function Checkout({ service, booking, subtotal, error, saving, onBack, onConfirm }: Props) {
  const [method, setMethod] = useState<Metodo>('Mercado Pago')
  const [valid, setValid] = useState(false)
  return (
    <div className="min-h-screen bg-[#fbfaf7] pt-24">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#147e88]"><ArrowLeft className="size-4" />Volver al detalle</button>
        <div className="rounded-3xl border border-[#dbe8e5] bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2bbfc2]">Paso final</p>
          <h1 className="mt-2 text-3xl font-semibold">Completá tu reserva</h1>
          <p className="mt-3 text-sm text-[#6d858b]">{service.title} · {booking.people} persona(s) · {booking.shift}</p>
          <p role="note" className="mt-4 rounded-2xl bg-[#fff4d9] p-3 text-sm text-[#9a6500]">Pago simulado: esto es una demostración y no se realiza ningún cobro real. No ingreses datos reales de tu tarjeta.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="field-label">Nombre<input required className="field-input" placeholder="Tu nombre" /></label>
            <label className="field-label">Apellido<input required className="field-input" placeholder="Tu apellido" /></label>
            <label className="field-label sm:col-span-2">Email<input required type="email" className="field-input" placeholder="nombre@email.com" /></label>
          </div>
          <div className="mt-8">
            <h2 className="font-semibold">Método de pago</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['Mercado Pago', 'Tarjeta', 'Transferencia'] as const).map(x => (
                <button key={x} onClick={() => setMethod(x)} className={`rounded-full border px-4 py-2 text-sm ${method === x ? 'border-[#2bc4c4] bg-[#eef7f5] font-semibold' : 'border-[#dbe8e5]'}`}>{x}</button>
              ))}
            </div>
            {method === 'Tarjeta' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="field-label sm:col-span-2">Número de tarjeta<input className="field-input" inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" pattern="[0-9 ]{16,19}" /></label>
                <label className="field-label">Titular<input className="field-input" autoComplete="off" placeholder="Como figura en la tarjeta" /></label>
                <label className="field-label">Vencimiento<input className="field-input" autoComplete="off" placeholder="MM/AA" pattern="[0-9]{2}/[0-9]{2}" /></label>
                <label className="field-label">CVV<input className="field-input" inputMode="numeric" autoComplete="off" placeholder="123" pattern="[0-9]{3,4}" /></label>
              </div>
            )}
            {method === 'Mercado Pago' && <Button type="button" variant="outline" className="mt-4 rounded-full">Pagar con Mercado Pago <ArrowRight className="ml-2" /></Button>}
            {method === 'Transferencia' && (
              <div className="mt-4 rounded-2xl bg-[#eef7f5] p-4 text-sm">
                <p>CBU: 0000003100001234567890</p>
                <p>Alias: VACACIONAPP.MDP</p>
                <Button type="button" variant="outline" className="mt-3 rounded-full">Ya transferí</Button>
              </div>
            )}
          </div>
          <label className="mt-7 flex items-start gap-2 text-sm"><input type="checkbox" checked={valid} onChange={e => setValid(e.target.checked)} className="mt-1" />Confirmo que los datos son correctos.</label>
          <div className="mt-8 flex justify-between border-t border-[#edf2f0] pt-5 text-lg font-bold"><span>Total</span><span>{money(subtotal)}</span></div>
          <p className="mt-2 text-xs text-[#147e88]">Sin cargos adicionales para vos.</p>
          {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
          <Button disabled={!valid || saving} onClick={() => onConfirm(method)} className="mt-7 w-full rounded-full bg-[#f5a623] py-6 text-[#183b4d]">{saving ? 'Procesando…' : 'Confirmar y pagar'}</Button>
        </div>
      </div>
    </div>
  )
}
