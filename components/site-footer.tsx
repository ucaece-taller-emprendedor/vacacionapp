'use client'

import Link from 'next/link'
import { useState } from 'react'
import { InfoModal } from '@/components/info-modal'

export function SiteFooter() {
  const [info, setInfo] = useState<string | null>(null)
  return (
    <>
      <footer className="border-t border-[#dbe8e5] bg-[#123d51] px-5 py-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold">VacacionApp</h3>
            <p className="mt-2 text-sm text-white/65">Todo lo que necesitás para disfrutar Mar del Plata.</p>
            <p className="mt-4 text-xs text-white/50">Proyecto académico del Taller Emprendedor · Los pagos son simulados.</p>
          </div>
          <div>
            <p className="font-semibold">Enlaces</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              <Link href="/app/registro?tipo=provider" className="text-left text-sm font-semibold text-[#f5c36b]">Sumar mi comercio</Link>
              <Link href="/app/prestador" className="text-left text-sm font-semibold text-white/80">Panel de proveedor</Link>
            </div>
            <div className="mt-3 flex flex-col gap-2 text-sm text-white/70">
              {['Ayuda', 'Privacidad', 'Contacto'].map(titulo => <button key={titulo} className="text-left" onClick={() => setInfo(titulo)}>{titulo}</button>)}
            </div>
          </div>
          <div>
            <p className="font-semibold">Viajes más simples</p>
            <p className="mt-3 text-sm text-white/70">Reservá, compará y disfrutá con tranquilidad.</p>
          </div>
        </div>
      </footer>
      {info && <InfoModal title={info} onClose={() => setInfo(null)} />}
    </>
  )
}
