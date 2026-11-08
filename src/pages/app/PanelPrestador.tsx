import { addDoc, collection, deleteDoc, doc, query, serverTimestamp, setDoc, updateDoc, where, writeBatch, getDocs } from 'firebase/firestore'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { PestanasPanel } from '@/components/PestanasPanel'
import { ReservaFila } from '@/components/ReservaFila'
import { Alerta, Boton, BotonLink, Campo, CampoTexto, Cargando, EstadoVacio, Etiqueta, Selector, Tarjeta } from '@/components/ui'
import { CATEGORIAS, dinero, ZONAS } from '@/config/app'
import { useColeccion, type Con } from '@/hooks/useColeccion'
import { useDocumento } from '@/hooks/useDocumento'
import { db } from '@/lib/firebase'
import type { Comercio, Reserva, Servicio } from '@/lib/tipos'
import { mensajeDeError, validarFormulario, type Errores } from '@/lib/validations/form'
import { comercioSchema, servicioSchema } from '@/lib/validations/vacacionapp'

function useMiComercio() {
  const { usuario } = useAuth()
  const uid = usuario?.uid
  const ref = useMemo(() => (uid ? doc(db, 'commerces', uid) : null), [uid])
  return useDocumento<Comercio>(ref)
}

const textoEstado = {
  pendiente: ['aviso', 'Tu comercio está pendiente de aprobación. Cuando el equipo lo apruebe vas a poder publicar servicios.'],
  aprobado: ['ok', 'Tu comercio está aprobado: ya podés publicar servicios.'],
  rechazado: ['error', 'Tu comercio fue rechazado. Revisá los datos y escribinos.'],
  suspendido: ['error', 'Tu comercio está suspendido. Escribinos para resolverlo.'],
} as const

export function PanelPrestador() {
  const { perfil } = useAuth()
  const { dato: comercio, cargando } = useMiComercio()
  const aviso = cargando ? null : !comercio ? (
    <Alerta tipo="aviso">Todavía no cargaste tu comercio. <Link to="/app/prestador/comercio" className="font-semibold underline">Completá los datos</Link> para que el equipo lo apruebe.</Alerta>
  ) : (
    <Alerta tipo={textoEstado[comercio.status][0]}>{textoEstado[comercio.status][1]}</Alerta>
  )
  return (
    <PestanasPanel
      titulo={`Panel del prestador · ${perfil?.displayName ?? ''}`}
      arriba={aviso}
      pestanas={[{ to: '/app/prestador', etiqueta: 'Reservas', fin: true }, { to: '/app/prestador/comercio', etiqueta: 'Mi comercio' }, { to: '/app/prestador/servicios', etiqueta: 'Mis servicios' }]}
    />
  )
}

export function ReservasPrestador() {
  const { usuario } = useAuth()
  const uid = usuario?.uid
  const consulta = useMemo(() => (uid ? query(collection(db, 'bookings'), where('ownerId', '==', uid)) : null), [uid])
  const { datos, cargando, error } = useColeccion<Reserva>(consulta)
  const [aviso, setAviso] = useState('')
  const ordenadas = [...datos].sort((a, b) => b.fromDate.localeCompare(a.fromDate))

  async function cambiar(id: string, status: 'completada' | 'cancelada') {
    setAviso('')
    try {
      await updateDoc(doc(db, 'bookings', id), status === 'cancelada' ? { status, cancelledAt: serverTimestamp() } : { status })
    } catch (e) {
      setAviso(mensajeDeError(e))
    }
  }
  if (cargando) return <Cargando />
  return (
    <div className="space-y-3">
      {(error || aviso) && <Alerta>{error ?? aviso}</Alerta>}
      {ordenadas.length === 0 ? <EstadoVacio>Todavía no recibiste reservas.</EstadoVacio> : ordenadas.map(r => (
        <ReservaFila key={r.id} r={r} quien="turista" acciones={r.status === 'confirmada' ? (
          <>
            <Boton onClick={() => void cambiar(r.id, 'completada')}>Marcar completada</Boton>
            <Boton variante="borde" onClick={() => void cambiar(r.id, 'cancelada')}>Cancelar</Boton>
          </>
        ) : undefined} />
      ))}
    </div>
  )
}

export function ComercioPrestador() {
  const { usuario } = useAuth()
  const { dato: c, cargando } = useMiComercio()
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [guardando, setGuardando] = useState(false)
  const navegar = useNavigate()
  if (cargando || !usuario) return <Cargando />
  const uid = usuario.uid

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const r = validarFormulario(comercioSchema, e.currentTarget)
    setErrores(r.errores ?? {})
    if (!r.datos) return
    setGuardando(true)
    setError('')
    setOk('')
    try {
      if (!c) {
        await setDoc(doc(db, 'commerces', uid), { ...r.datos, ownerId: uid, status: 'pendiente', isDemo: false, createdAt: serverTimestamp() })
        setOk('Comercio enviado. El equipo lo va a revisar.')
        navegar('/app/prestador')
      } else {
        await updateDoc(doc(db, 'commerces', uid), r.datos)
        if (c.status === 'aprobado' && c.name !== r.datos.name) {
          // El nombre se copia en cada servicio (para mostrarlo en el catálogo sin leer el comercio).
          const snap = await getDocs(query(collection(db, 'services'), where('ownerId', '==', uid)))
          const lote = writeBatch(db)
          snap.forEach(d => lote.update(d.ref, { commerceName: r.datos.name }))
          await lote.commit()
        }
        setOk('Datos guardados.')
      }
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Tarjeta>
      <h2 className="text-lg font-semibold">{c ? 'Datos de tu comercio' : 'Cargá los datos de tu comercio'}</h2>
      {c && <p className="mt-1 text-sm text-suave">Estado: <Etiqueta tono={c.status === 'aprobado' ? 'ok' : c.status === 'pendiente' ? 'aviso' : 'peligro'}>{c.status}</Etiqueta></p>}
      <form onSubmit={e => void guardar(e)} noValidate className="mt-4 grid gap-4 sm:grid-cols-2" key={c?.id ?? 'nuevo'}>
        <Campo etiqueta="Nombre del comercio" name="name" defaultValue={c?.name} error={errores.name} />
        <Selector etiqueta="Categoría" name="category" defaultValue={c?.category ?? ''} error={errores.category}>
          <option value="" disabled>Elegí…</option>
          {CATEGORIAS.map(x => <option key={x}>{x}</option>)}
        </Selector>
        <div className="sm:col-span-2"><CampoTexto etiqueta="Descripción" name="description" defaultValue={c?.description} error={errores.description} /></div>
        <Campo etiqueta="Persona de contacto" name="contactName" defaultValue={c?.contactName} error={errores.contactName} />
        <Campo etiqueta="Email de contacto" name="email" type="email" defaultValue={c?.email} error={errores.email} />
        <Campo etiqueta="Teléfono" name="phone" type="tel" defaultValue={c?.phone} error={errores.phone} />
        <Campo etiqueta="Dirección" name="address" defaultValue={c?.address} error={errores.address} />
        <Campo etiqueta="Ciudad" name="city" defaultValue={c?.city ?? 'Mar del Plata'} error={errores.city} />
        <Campo etiqueta="Provincia" name="province" defaultValue={c?.province ?? 'Buenos Aires'} error={errores.province} />
        <div className="space-y-3 sm:col-span-2">
          {error && <Alerta>{error}</Alerta>}
          {ok && <Alerta tipo="ok">{ok}</Alerta>}
          <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : c ? 'Guardar cambios' : 'Enviar para aprobación'}</Boton>
        </div>
      </form>
    </Tarjeta>
  )
}

export function ServiciosPrestador() {
  const { usuario, perfil } = useAuth()
  const uid = usuario?.uid
  const { dato: comercio, cargando: cargandoC } = useMiComercio()
  const consulta = useMemo(() => (uid ? query(collection(db, 'services'), where('ownerId', '==', uid)) : null), [uid])
  const { datos, cargando } = useColeccion<Servicio>(consulta)
  const [editando, setEditando] = useState<Con<Servicio> | 'nuevo' | null>(null)
  const [errores, setErrores] = useState<Errores>({})
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  if (cargandoC || cargando || !uid) return <Cargando />
  if (!comercio || comercio.status !== 'aprobado' || perfil?.status !== 'activo') {
    return (
      <EstadoVacio>
        Vas a poder publicar servicios cuando tu comercio esté aprobado.{' '}
        {!comercio && <Link to="/app/prestador/comercio" className="font-semibold text-primario">Cargá tu comercio</Link>}
      </EstadoVacio>
    )
  }
  const nombreComercio = comercio.name

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const r = validarFormulario(servicioSchema, e.currentTarget)
    setErrores(r.errores ?? {})
    if (!r.datos) return
    setGuardando(true)
    setError('')
    try {
      if (editando && editando !== 'nuevo') {
        await updateDoc(doc(db, 'services', editando.id), { ...r.datos, commerceName: nombreComercio })
      } else {
        await addDoc(collection(db, 'services'), { ...r.datos, ownerId: uid, commerceName: nombreComercio, rating: 0, reviews: 0, isDemo: false, createdAt: serverTimestamp() })
      }
      setEditando(null)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setGuardando(false)
    }
  }

  if (editando) {
    const s = editando === 'nuevo' ? null : editando
    return (
      <Tarjeta>
        <h2 className="text-lg font-semibold">{s ? 'Editar servicio' : 'Nuevo servicio'}</h2>
        <form onSubmit={e => void guardar(e)} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Campo etiqueta="Título" name="title" defaultValue={s?.title} error={errores.title} /></div>
          <div className="sm:col-span-2"><CampoTexto etiqueta="Descripción" name="description" defaultValue={s?.description} error={errores.description} /></div>
          <Selector etiqueta="Categoría" name="category" defaultValue={s?.category ?? ''} error={errores.category}>
            <option value="" disabled>Elegí…</option>
            {CATEGORIAS.map(x => <option key={x}>{x}</option>)}
          </Selector>
          <Selector etiqueta="Zona" name="location" defaultValue={s?.location ?? ''} error={errores.location}>
            <option value="" disabled>Elegí…</option>
            {ZONAS.map(x => <option key={x}>{x}</option>)}
          </Selector>
          <Campo etiqueta="Precio (ARS)" name="price" type="number" inputMode="numeric" min={100} defaultValue={s?.price} error={errores.price} />
          <Selector etiqueta="Se cobra" name="unit" defaultValue={s?.unit ?? 'por persona'} error={errores.unit}>
            <option>por día</option><option>por persona</option><option>por sesión</option>
          </Selector>
          <Campo etiqueta="Duración" name="duration" defaultValue={s?.duration ?? 'A elección'} error={errores.duration} />
          <Campo etiqueta="Etiqueta" name="tag" defaultValue={s?.tag ?? 'Nuevo'} error={errores.tag} />
          <div className="sm:col-span-2"><CampoTexto etiqueta="Qué incluye (uno por línea)" name="includes" rows={3} defaultValue={s?.includes.join('\n')} error={errores.includes} /></div>
          <div className="sm:col-span-2"><Campo etiqueta="Política de cancelación" name="policy" defaultValue={s?.policy ?? 'Cancelación gratis hasta 24 h antes.'} error={errores.policy} /></div>
          <div className="sm:col-span-2"><Campo etiqueta="Imagen (URL https:// o vacío)" name="image" defaultValue={s?.image.startsWith('/') ? '' : s?.image} ayuda="Si lo dejás vacío se usa una imagen genérica." error={errores.image} /></div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="active" defaultChecked={s?.active ?? true} /> Visible en el catálogo</label>
          <div className="space-y-3 sm:col-span-2">
            {error && <Alerta>{error}</Alerta>}
            <div className="flex gap-2">
              <Boton type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</Boton>
              <Boton variante="borde" onClick={() => setEditando(null)}>Cancelar</Boton>
            </div>
          </div>
        </form>
      </Tarjeta>
    )
  }

  return (
    <div className="space-y-3">
      <Boton onClick={() => { setErrores({}); setError(''); setEditando('nuevo') }}>Nuevo servicio</Boton>
      {datos.length === 0 ? <EstadoVacio>Todavía no publicaste servicios.</EstadoVacio> : datos.map(s => (
        <Tarjeta key={s.id} className="flex flex-wrap items-center justify-between gap-3" data-testid="mi-servicio">
          <div>
            <p className="font-semibold">{s.title} {s.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}</p>
            <p className="text-sm text-suave">{s.category} · {dinero(s.price)} {s.unit} · {s.active ? 'Visible' : 'Oculto'}</p>
          </div>
          <div className="flex gap-2">
            <BotonLink to={`/servicio/${s.id}`} variante="fantasma">Ver</BotonLink>
            <Boton variante="borde" onClick={() => { setErrores({}); setError(''); setEditando(s) }}>Editar</Boton>
            <Boton variante="peligro" onClick={() => { if (confirm('¿Borrar este servicio?')) void deleteDoc(doc(db, 'services', s.id)) }}>Borrar</Boton>
          </div>
        </Tarjeta>
      ))}
    </div>
  )
}
