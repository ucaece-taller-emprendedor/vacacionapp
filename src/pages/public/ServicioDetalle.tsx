import { doc } from 'firebase/firestore'
import { Check, Heart, MapPin, Star } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { Alerta, Boton, BotonLink, Campo, Cargando, Selector, Tarjeta } from '@/components/ui'
import { dinero, hoy, totalReserva, turnos } from '@/config/app'
import { useDocumento } from '@/hooks/useDocumento'
import { useFavoritos } from '@/hooks/useFavoritos'
import { db } from '@/lib/firebase'
import type { Servicio } from '@/lib/tipos'
import { busquedaReservaSchema } from '@/lib/validations/vacacionapp'
import { validarFormulario, type Errores } from '@/lib/validations/form'

export default function ServicioDetalle() {
  const { id = '' } = useParams()
  const navegar = useNavigate()
  const { perfil, usuario } = useAuth()
  const ref = useMemo(() => doc(db, 'services', id), [id])
  const { dato: s, cargando } = useDocumento<Servicio>(ref)
  const { ids, alternar, puedeGuardar } = useFavoritos()
  const [errores, setErrores] = useState<Errores>({})
  const [personas, setPersonas] = useState(2)

  if (cargando) return <Cargando />
  if (!s || (!s.active && s.ownerId !== usuario?.uid && perfil?.role !== 'admin')) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Este servicio no está disponible</h1>
        <BotonLink to="/explorar" className="mt-6">Ver otros servicios</BotonLink>
      </div>
    )
  }

  const total = totalReserva(s.category, s.price, personas)
  const esTurista = perfil?.role === 'turista'

  function reservar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const r = validarFormulario(busquedaReservaSchema, e.currentTarget)
    setErrores(r.errores ?? {})
    if (!r.datos) return
    const destino = `/app/reservar/${id}?${new URLSearchParams({ from: r.datos.from, to: r.datos.to, people: String(r.datos.people), shift: r.datos.shift })}`
    if (!usuario) navegar('/app/ingresar', { state: { desde: destino } })
    else navegar(destino)
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_22rem]">
      <div>
        <Link to="/explorar" className="text-sm font-semibold text-primario">← Volver al catálogo</Link>
        <img src={s.image} alt={s.title} className="mt-4 aspect-[16/10] w-full rounded-tema object-cover" />
        <div className="mt-5 flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1 text-sm text-suave"><MapPin className="size-4" aria-hidden /> {s.location} · {s.commerceName}</p>
            <h1 className="mt-1 text-3xl font-semibold">{s.title}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm"><Star className="size-4 fill-acento text-acento" aria-hidden /> {s.rating > 0 ? `${s.rating.toFixed(1)} · ${s.reviews} opiniones` : 'Todavía sin opiniones'} · {s.duration}</p>
          </div>
          {puedeGuardar && (
            <Boton variante="borde" onClick={() => void alternar(id)} aria-pressed={ids.has(id)}>
              <Heart className={`size-4 ${ids.has(id) ? 'fill-peligro text-peligro' : ''}`} aria-hidden /> {ids.has(id) ? 'En favoritos' : 'Guardar'}
            </Boton>
          )}
        </div>
        <p className="mt-5 text-suave">{s.description}</p>
        <h2 className="mt-6 font-semibold">Incluye</h2>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {s.includes.map(i => <li key={i} className="flex items-center gap-2 text-sm"><Check className="size-4 text-ok" aria-hidden /> {i}</li>)}
        </ul>
        <h2 className="mt-6 font-semibold">Política de cancelación</h2>
        <p className="mt-1 text-sm text-suave">{s.policy}</p>
      </div>

      <aside>
        <Tarjeta className="sticky top-20">
          <p><strong className="text-2xl">{dinero(s.price)}</strong> <span className="text-sm text-suave">{s.unit}</span></p>
          {perfil && !esTurista ? (
            <div className="mt-4"><Alerta tipo="info">Para reservar necesitás una cuenta de turista.</Alerta></div>
          ) : (
            <form onSubmit={reservar} noValidate className="mt-4 space-y-3">
              <Campo etiqueta="Desde" name="from" type="date" min={hoy()} defaultValue={hoy()} error={errores.from} />
              <Campo etiqueta="Hasta" name="to" type="date" min={hoy()} defaultValue={hoy()} error={errores.to} />
              <Campo etiqueta="Personas" name="people" type="number" min={1} max={20} value={personas} onChange={e => setPersonas(Number(e.target.value))} error={errores.people} />
              <Selector etiqueta="Horario" name="shift" error={errores.shift}>
                {turnos(s.category).map(t => <option key={t}>{t}</option>)}
              </Selector>
              <p className="flex justify-between border-t border-borde pt-3 font-semibold"><span>Total estimado</span><span>{dinero(total)}</span></p>
              <Boton type="submit" variante="acento" className="w-full">{usuario ? 'Reservar' : 'Ingresar para reservar'}</Boton>
            </form>
          )}
          <p className="mt-3 text-xs text-suave">Los pagos de esta demo son simulados.</p>
        </Tarjeta>
      </aside>
    </div>
  )
}
