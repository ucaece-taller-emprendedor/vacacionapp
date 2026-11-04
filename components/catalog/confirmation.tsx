import Link from 'next/link'
import { Check } from 'lucide-react'
import { money, type BookingForm, type Service } from '@/lib/catalog'

type Props = { service: Service; booking: BookingForm; total: number; code: string }

export function Confirmation({ service, booking, total, code }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef7f5] px-5 pt-20">
      <div className="w-full max-w-xl rounded-3xl border border-[#dbe8e5] bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#2bc4c4] text-[#073d52]"><Check className="size-8" /></div>
        <h1 className="mt-6 text-3xl font-semibold">Reserva confirmada</h1>
        <p className="mt-3 text-[#6d858b]">Tu experiencia en Mar del Plata ya está lista.</p>
        <p className="mt-7 rounded-2xl bg-[#fbfaf7] p-4 font-mono text-xl font-bold">{code}</p>
        <p className="mt-5 text-sm text-[#55707a]">{service.title} · {booking.people} persona(s) · Total {money(total)}</p>
        <p className="mt-2 text-xs text-[#7d969b]">Pago simulado: no se realizó ningún cobro.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/app" className="inline-flex h-9 items-center rounded-full border border-[#dbe8e5] px-5 text-sm font-medium">Ver mis reservas</Link>
          <Link href="/" className="inline-flex h-9 items-center rounded-full bg-[#123d51] px-5 text-sm font-medium text-white">Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}
