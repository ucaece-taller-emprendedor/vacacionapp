import { collection, query, where } from 'firebase/firestore'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { ServicioCard } from '@/components/ServicioCard'
import { Alerta, Cargando, EstadoVacio } from '@/components/ui'
import { CATEGORIAS, ZONAS } from '@/config/app'
import { useColeccion } from '@/hooks/useColeccion'
import { useFavoritos } from '@/hooks/useFavoritos'
import { db } from '@/lib/firebase'
import type { Servicio } from '@/lib/tipos'

const sel = 'min-h-11 rounded-tema border border-borde bg-superficie px-3'

export default function Explorar() {
  const [params, setParams] = useSearchParams()
  const navegar = useNavigate()
  const { usuario } = useAuth()
  const consulta = useMemo(() => query(collection(db, 'services'), where('active', '==', true)), [])
  const { datos, cargando, error } = useColeccion<Servicio>(consulta)
  const { ids, alternar, puedeGuardar } = useFavoritos()

  const q = params.get('q') ?? ''
  const categoria = params.get('categoria') ?? ''
  const zona = params.get('zona') ?? ''
  const orden = params.get('orden') ?? 'valoracion'

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase()
    return datos
      .filter(s => (!categoria || s.category === categoria) && (!zona || s.location === zona) && (!t || `${s.title} ${s.commerceName} ${s.description}`.toLowerCase().includes(t)))
      .sort((a, b) => (orden === 'precio' ? a.price - b.price : b.rating - a.rating))
  }, [datos, q, categoria, zona, orden])

  function cambiar(clave: string, valor: string) {
    const p = new URLSearchParams(params)
    if (valor) p.set(clave, valor)
    else p.delete(clave)
    setParams(p, { replace: true })
  }

  function favorito(id: string) {
    if (!usuario) return navegar('/app/ingresar', { state: { desde: '/explorar' } })
    if (puedeGuardar) void alternar(id)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Explorá servicios</h1>
      <p className="mt-1 text-suave">Carpas, actividades acuáticas, bienestar y gastronomía en Mar del Plata.</p>
      <form className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" role="search" onSubmit={e => e.preventDefault()}>
        <input aria-label="Buscar" placeholder="Buscar…" value={q} onChange={e => cambiar('q', e.target.value)} className={sel} />
        <select aria-label="Categoría" value={categoria} onChange={e => cambiar('categoria', e.target.value)} className={sel}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Zona" value={zona} onChange={e => cambiar('zona', e.target.value)} className={sel}>
          <option value="">Todas las zonas</option>
          {ZONAS.map(z => <option key={z}>{z}</option>)}
        </select>
        <select aria-label="Ordenar por" value={orden} onChange={e => cambiar('orden', e.target.value)} className={sel}>
          <option value="valoracion">Mejor valorados</option>
          <option value="precio">Menor precio</option>
        </select>
      </form>
      <div className="mt-6">
        {error && <Alerta>{error}</Alerta>}
        {cargando ? <Cargando /> : filtrados.length === 0 ? <EstadoVacio>No encontramos servicios con esos filtros.</EstadoVacio> : (
          <>
            <p className="mb-3 text-sm text-suave" aria-live="polite">{filtrados.length} servicio(s)</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map(s => <ServicioCard key={s.id} servicio={s} favorito={ids.has(s.id)} onFavorito={() => favorito(s.id)} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
