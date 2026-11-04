import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money, type Service } from '@/lib/catalog'

export function CompareBar({ items, onClear, onBook }: { items: Service[]; onClear: () => void; onBook: (s: Service) => void }) {
  const [open, setOpen] = useState(false)
  const lowest = Math.min(...items.map(x => x.price))
  const best = Math.max(...items.map(x => x.rating))
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dbe8e5] bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="mx-auto flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">Comparando {items.length} servicios</span>
          <div className="flex gap-3">
            <button onClick={onClear} className="text-sm text-[#6d858b]">Limpiar</button>
            <Button onClick={() => setOpen(true)} className="rounded-full bg-[#123d51]">Comparar ahora</Button>
          </div>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#123d51]/50 p-3">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-3xl bg-white p-5 sm:p-7">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2bbfc2]">Comparador</p>
                <h2 className="text-2xl font-semibold">Elegí la mejor experiencia</h2>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar comparador"><X /></button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {items.map(x => (
                <div key={x.id} className="rounded-2xl border border-[#dbe8e5] p-4">
                  <img src={x.image} alt={x.title} className="h-32 w-full rounded-xl object-cover" />
                  <h3 className="mt-3 font-semibold">{x.title}</h3>
                  <p className="text-sm text-[#6d858b]">{x.provider}</p>
                  {x.price === lowest && <span className="mt-2 inline-block rounded-full bg-[#eef7f5] px-2 py-1 text-xs font-semibold text-[#147e88]">Mejor precio</span>}
                  {x.rating === best && <span className="ml-1 mt-2 inline-block rounded-full bg-[#fff4d9] px-2 py-1 text-xs font-semibold text-[#9a6500]">Mejor valorado</span>}
                  <div className="mt-3 grid gap-2 text-sm">
                    <p><b>Zona:</b> {x.location}</p>
                    <p><b>Precio:</b> {money(x.price)} {x.unit}</p>
                    <p><b>Valoración:</b> {x.rating} / 5 ({x.reviews} reseñas)</p>
                    <p><b>Incluye:</b> {x.includes.join(', ')}</p>
                    <p><b>Horario:</b> {x.duration}</p>
                    <p><b>Cancelación:</b> {x.policy}</p>
                  </div>
                  <Button onClick={() => { setOpen(false); onBook(x) }} className="mt-4 w-full rounded-full bg-[#f5a623] text-[#183b4d]">Reservar</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
