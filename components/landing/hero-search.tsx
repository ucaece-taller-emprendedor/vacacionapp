'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CalendarDays, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LOCATIONS, today } from '@/lib/catalog'

export function HeroSearch() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  function buscar() {
    const params = new URLSearchParams()
    if (destination) params.set('zona', destination)
    if (from) params.set('desde', from)
    if (to) params.set('hasta', to)
    router.push(`/explorar${params.size ? `?${params}` : ''}`)
  }

  return (
    <div className="mt-12 rounded-2xl bg-white p-3 shadow-2xl md:flex md:items-center md:gap-1 md:rounded-full">
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-3">
        <MapPin className="text-[#2bbfc2]" />
        <span className="flex w-full flex-col">
          <span className="text-xs font-semibold">¿A dónde vas?</span>
          <select aria-label="Destino en Mar del Plata" value={destination} onChange={e => setDestination(e.target.value)} className="bg-transparent text-sm text-[#55707a] outline-none">
            <option value="">Elegí una zona</option>
            {LOCATIONS.map(x => <option key={x}>{x}</option>)}
          </select>
        </span>
      </label>
      <div className="hidden h-9 w-px bg-[#e6eceb] md:block" />
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-3">
        <CalendarDays className="text-[#2bbfc2]" />
        <span className="flex w-full flex-col">
          <span className="text-xs font-semibold">Desde</span>
          <input aria-label="Fecha desde" type="date" min={today()} value={from} onChange={e => setFrom(e.target.value)} className="bg-transparent text-sm text-[#55707a] outline-none" />
        </span>
      </label>
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-3">
        <CalendarDays className="text-[#2bbfc2]" />
        <span className="flex w-full flex-col">
          <span className="text-xs font-semibold">Hasta</span>
          <input aria-label="Fecha hasta" type="date" min={from || today()} value={to} onChange={e => setTo(e.target.value)} className="bg-transparent text-sm text-[#55707a] outline-none" />
        </span>
      </label>
      <Button onClick={buscar} className="rounded-full bg-[#f5a623] px-7 py-6 text-[#183b4d] hover:bg-[#ffc15a]"><Search className="mr-2" />Buscar</Button>
    </div>
  )
}
