import { useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ServiceCard } from '@/components/catalog/service-card'
import { CATEGORIES, LOCATIONS, type Service } from '@/lib/catalog'

type Props = {
  services: Service[]
  destination: string
  from: string
  to: string
  compare: Service[]
  favorites: string[]
  onClose: () => void
  onDetail: (s: Service) => void
  onCompare: (s: Service) => void
  onFavorite: (s: Service) => void
}

export function Results({ services, destination, from, to, compare, favorites, onClose, onDetail, onCompare, onFavorite }: Props) {
  const [category, setCategory] = useState('Todas')
  const [location, setLocation] = useState(destination || 'Todas las zonas')
  const [rating, setRating] = useState(1)
  const [sort, setSort] = useState('recommended')
  const filtered = useMemo(
    () =>
      services
        .filter(s => (category === 'Todas' || s.category === category) && (location === 'Todos' || location === 'Todas las zonas' || location.split(',').includes(s.location)) && (s.reviews === 0 || s.rating >= rating))
        .sort((a, b) => (sort === 'price' ? a.price - b.price : sort === 'rating' ? b.rating - a.rating : 0)),
    [services, category, location, rating, sort],
  )
  const clear = () => { setCategory('Todas'); setLocation('Todas las zonas'); setRating(1); setSort('recommended') }

  return (
    <div className="min-h-screen bg-[#fbfaf7] pt-24">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
        <button onClick={onClose} className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#147e88]"><ArrowLeft className="size-4" />Volver</button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2bbfc2]">Mar del Plata{destination ? ` · ${destination}` : ''}</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Servicios para tus vacaciones</h1>
            <p className="mt-2 text-sm text-[#6d858b]">{from && to ? `Del ${from} al ${to} · ` : ''}{filtered.length} opciones disponibles</p>
          </div>
          <select aria-label="Ordenar resultados" value={sort} onChange={e => setSort(e.target.value)} className="h-10 rounded-full border border-[#dbe8e5] bg-white px-4 text-sm">
            <option value="recommended">Ordenar: recomendados</option>
            <option value="price">Precio más bajo</option>
            <option value="rating">Mejor valorados</option>
          </select>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#dbe8e5] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Filtros</h2>
              <button onClick={clear} className="text-xs font-semibold text-[#147e88]">Limpiar</button>
            </div>
            <label className="field-label mt-5">Categoría
              <select className="field-input" value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(x => <option key={x}>{x}</option>)}</select>
            </label>
            <label className="field-label mt-4">Zona
              <select className="field-input" value={location} onChange={e => setLocation(e.target.value)}>
                <option>Todos</option>
                {LOCATIONS.map(x => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="field-label mt-4">Valoración mínima
              <input type="range" min="1" max="5" step="0.1" value={rating} onChange={e => setRating(Number(e.target.value))} />
              <span className="text-sm text-[#6d858b]">{rating.toFixed(1)} estrellas</span>
            </label>
          </aside>
          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map(s => (
              <ServiceCard key={s.id} service={s} selected={compare.some(x => x.id === s.id)} favorite={favorites.includes(s.id)} onCompare={() => onCompare(s)} onFavorite={() => onFavorite(s)} onDetail={() => onDetail(s)} />
            ))}
            {!filtered.length && <p className="rounded-2xl border border-dashed border-[#b9d7d2] p-8 text-sm text-[#6d858b] sm:col-span-2">No encontramos servicios con esos filtros.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
