import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore'
import { CheckCircle2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { Alerta, Boton, BotonLink, Cargando, Tarjeta } from '@/components/ui'
import { AVISO_PAGO_SIMULADO, dinero, METODOS_PAGO, totalReserva } from '@/config/app'
import { useDocumento } from '@/hooks/useDocumento'
import { db } from '@/lib/firebase'
import type { Servicio } from '@/lib/tipos'
import { mensajeDeError, validarFormulario } from '@/lib/validations/form'
import { busquedaReservaSchema, pagoSchema } from '@/lib/validations/vacacionapp'

/** Paso final: confirmación de la reserva con pago SIMULADO. */
export default function Reservar() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const { perfil, usuario } = useAuth()
  const ref = useMemo(() => doc(db, 'services', id), [id])
  const { dato: s, cargando } = useDocumento<Servicio>(ref)
  const [metodo, setMetodo] = useState<string>(METODOS_PAGO[0])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [hecho, setHecho] = useState(false)

  const datos = busquedaReservaSchema.safeParse({ from: params.get('from'), to: params.get('to'), people: params.get('people'), shift: params.get('shift') })

  if (cargando) return <Cargando />
  if (!s || !s.active || !datos.success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Alerta>Faltan datos de la reserva o el servicio ya no está disponible.</Alerta>
        <BotonLink to={s ? `/servicio/${id}` : '/explorar'} className="mt-6">Volver</BotonLink>
      </div>
    )
  }
  if (perfil?.role !== 'turista' || !usuario) {
    return <div className="mx-auto max-w-md px-4 py-16"><Alerta tipo="info">Solo las cuentas de turista pueden reservar.</Alerta></div>
  }

  const reserva = datos.data
  const total = totalReserva(s.category, s.price, reserva.people)

  if (hecho) {
    return (
      <div className="mx-auto max-w-lg px-4 py-14 text-center">
        <CheckCircle2 className="mx-auto size-14 text-ok" aria-hidden />
        <h1 className="mt-3 text-2xl font-semibold">¡Reserva confirmada!</h1>
        <p className="mt-2 text-suave">{s.title} · {reserva.from === reserva.to ? reserva.from : `${reserva.from} → ${reserva.to}`} · {reserva.shift}</p>
        <p className="mt-1 text-sm text-suave">Pago simulado: no se cobró nada.</p>
        <BotonLink to="/app/turista" className="mt-6">Ver mis reservas</BotonLink>
      </div>
    )
  }

  async function confirmar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const r = validarFormulario(pagoSchema, e.currentTarget)
    if (!r.datos) return setError(Object.values(r.errores).join(' '))
    if (!s || !usuario || !perfil) return
    setError('')
    setGuardando(true)
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: usuario.uid,
        userName: perfil.displayName,
        userEmail: usuario.email,
        serviceId: id,
        ownerId: s.ownerId,
        serviceTitle: s.title,
        commerceName: s.commerceName,
        location: s.location,
        fromDate: reserva.from,
        toDate: reserva.to,
        people: reserva.people,
        shift: reserva.shift,
        total,
        status: 'confirmada',
        payment: { metodo: r.datos.metodo, estado: 'simulado', monto: total },
        createdAt: serverTimestamp(),
      })
      setHecho(true)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to={`/servicio/${id}`} className="text-sm font-semibold text-primario">← Volver al detalle</Link>
      <Tarjeta className="mt-4 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primario">Paso final</p>
        <h1 className="text-2xl font-semibold">Completá tu reserva</h1>
        <p className="text-sm text-suave">{s.title} · {reserva.people} persona(s) · {reserva.shift} · {reserva.from === reserva.to ? reserva.from : `${reserva.from} → ${reserva.to}`}</p>
        <p role="note" className="rounded-tema bg-acento/15 p-3 text-sm">{AVISO_PAGO_SIMULADO}</p>
        <form onSubmit={e => void confirmar(e)} className="space-y-4">
          <fieldset>
            <legend className="font-semibold">Método de pago (simulado)</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {METODOS_PAGO.map(m => (
                <label key={m} className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${metodo === m ? 'border-primario bg-primario/10 font-semibold' : 'border-borde'}`}>
                  <input type="radio" name="metodo" value={m} checked={metodo === m} onChange={() => setMetodo(m)} className="sr-only" /> {m}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirmo" className="mt-1" /> Confirmo que los datos son correctos.</label>
          <p className="flex justify-between border-t border-borde pt-4 text-lg font-bold"><span>Total</span><span>{dinero(total)}</span></p>
          {error && <Alerta>{error}</Alerta>}
          <Boton type="submit" variante="acento" className="w-full" disabled={guardando}>{guardando ? 'Procesando…' : 'Confirmar reserva (pago simulado)'}</Boton>
        </form>
        <Boton variante="fantasma" onClick={() => navegar(-1)}>Cancelar</Boton>
      </Tarjeta>
    </div>
  )
}
