import { ArrowRight, Heart, MapPin, Star } from 'lucide-react'
import { money, type Service } from '@/lib/catalog'

type Props = { service: Service; selected: boolean; favorite: boolean; onCompare: () => void; onFavorite: () => void; onDetail: () => void }

export function ServiceCard({ service, selected, favorite, onCompare, onFavorite, onDetail }: Props) {
  return (
    <article className="service-card">
      <div className="relative h-52 overflow-hidden">
        <img src={service.image} alt={service.title} className="size-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">{service.tag}</span>
        <button onClick={onFavorite} aria-label="Guardar favorito" className="absolute right-4 top-4 rounded-full bg-white/90 p-2">
          <Heart className={favorite ? 'fill-[#ef6d62] text-[#ef6d62]' : 'text-[#183b4d]'} />
        </button>
      </div>
      <div className="p-5">
        <div className="flex justify-between gap-3">
          <div>
            <h3 className="font-semibold">{service.title}</h3>
            <p className="mt-1 text-sm text-[#6d858b]">{service.provider}</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold">
            <Star className="size-4 fill-[#f5a623] text-[#f5a623]" />
            {service.reviews > 0 ? service.rating : 'Nuevo'}
          </span>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-[#7d969b]"><MapPin className="size-3.5" />{service.location}, Mar del Plata</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <label className="rounded-full border border-[#dbe8e5] px-3 py-2 text-xs font-semibold">
            <input type="checkbox" checked={selected} onChange={onCompare} className="mr-2 accent-[#147e88]" />Comparar
          </label>
          <button onClick={onDetail} className="text-sm font-semibold text-[#147e88]">Ver detalle <ArrowRight className="ml-1 inline size-4" /></button>
        </div>
        <p className="mt-4"><span className="text-xl font-bold">{money(service.price)}</span><span className="ml-1 text-xs text-[#7d969b]">{service.unit}</span></p>
      </div>
    </article>
  )
}
