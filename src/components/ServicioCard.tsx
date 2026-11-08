import { Heart, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router'
import { dinero } from '@/config/app'
import type { Con } from '@/hooks/useColeccion'
import type { Servicio } from '@/lib/tipos'
import { Etiqueta } from './ui'

type Props = { servicio: Con<Servicio>; favorito: boolean; onFavorito: () => void }

export function ServicioCard({ servicio: s, favorito, onFavorito }: Props) {
  return (
    <article className="overflow-hidden rounded-tema border border-borde bg-superficie" data-testid="servicio-card">
      <div className="relative">
        <img src={s.image} alt={s.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-superficie/95 px-3 py-1 text-xs font-semibold text-primario">{s.tag}</span>
        <button
          type="button"
          onClick={onFavorito}
          aria-label={favorito ? `Quitar ${s.title} de favoritos` : `Guardar ${s.title} en favoritos`}
          aria-pressed={favorito}
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-superficie/95"
        >
          <Heart className={`size-5 ${favorito ? 'fill-peligro text-peligro' : 'text-texto'}`} aria-hidden />
        </button>
      </div>
      <div className="space-y-2 p-4">
        <p className="flex items-center gap-1 text-xs text-suave"><MapPin className="size-3.5" aria-hidden /> {s.location} · {s.commerceName}</p>
        <h3 className="text-lg font-semibold leading-tight">
          <Link to={`/servicio/${s.id}`} className="hover:text-primario">{s.title}</Link>
        </h3>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-1"><Star className="size-4 fill-acento text-acento" aria-hidden /> {s.rating > 0 ? `${s.rating.toFixed(1)} (${s.reviews})` : 'Nuevo'}</span>
          <span><strong className="text-lg">{dinero(s.price)}</strong> <span className="text-xs text-suave">{s.unit}</span></span>
        </div>
        {s.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}
      </div>
    </article>
  )
}
