import type { ReactNode } from 'react'
import { dinero } from '@/config/app'
import type { Con } from '@/hooks/useColeccion'
import type { Reserva } from '@/lib/tipos'
import { Etiqueta, Tarjeta } from './ui'

const tono = { confirmada: 'ok', cancelada: 'peligro', completada: 'neutro' } as const

export function ReservaFila({ r, quien, acciones }: { r: Con<Reserva>; quien?: 'turista' | 'comercio'; acciones?: ReactNode }) {
  return (
    <Tarjeta data-testid="reserva-fila" className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{r.serviceTitle}</p>
          <p className="text-sm text-suave">{quien === 'turista' ? `Reservó: ${r.userName} (${r.userEmail})` : r.commerceName} · {r.location}</p>
        </div>
        <Etiqueta tono={tono[r.status]}>{r.status}</Etiqueta>
      </div>
      <p className="text-sm">{r.fromDate === r.toDate ? r.fromDate : `${r.fromDate} → ${r.toDate}`} · {r.shift} · {r.people} persona(s)</p>
      <p className="text-sm text-suave">Total {dinero(r.total)} · pago {r.payment.estado} ({r.payment.metodo})</p>
      {acciones && <div className="flex flex-wrap gap-2 pt-1">{acciones}</div>}
    </Tarjeta>
  )
}
