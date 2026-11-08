import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore'
import { useMemo, useState } from 'react'
import { Alerta, Boton, Cargando, EstadoVacio, Etiqueta, Selector, Tarjeta } from '@/components/ui'
import { ReservaFila } from '@/components/ReservaFila'
import { dinero, ESTADOS, ETIQUETA_ROL, ROLES_REGISTRABLES, type Estado, type Rol } from '@/config/app'
import { useColeccion } from '@/hooks/useColeccion'
import { db } from '@/lib/firebase'
import type { Comercio, EstadoComercio, Reserva, Servicio, Usuario } from '@/lib/tipos'
import { mensajeDeError } from '@/lib/validations/form'

function useAviso() {
  const [aviso, setAviso] = useState('')
  async function ejecutar(fn: () => Promise<unknown>) {
    setAviso('')
    try {
      await fn()
    } catch (e) {
      setAviso(mensajeDeError(e))
    }
  }
  return { aviso, ejecutar }
}

export function AdminInicio() {
  const u = useColeccion<Usuario>(useMemo(() => query(collection(db, 'users')), []))
  const c = useColeccion<Comercio>(useMemo(() => query(collection(db, 'commerces')), []))
  const s = useColeccion<Servicio>(useMemo(() => query(collection(db, 'services')), []))
  const r = useColeccion<Reserva>(useMemo(() => query(collection(db, 'bookings')), []))
  const pendientes = c.datos.filter(x => x.status === 'pendiente').length
  const tarjetas = [
    ['Usuarios', u.datos.length, 'usuarios'],
    ['Comercios pendientes', pendientes, 'pendientes'],
    ['Servicios', s.datos.length, 'servicios'],
    ['Reservas', r.datos.length, 'reservas'],
  ] as const
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Administración</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map(([titulo, n, id]) => (
          <Tarjeta key={id}><p className="text-sm text-suave">{titulo}</p><p className="text-3xl font-bold" data-testid={`stat-${id}`}>{n}</p></Tarjeta>
        ))}
      </div>
    </div>
  )
}

export function AdminUsuarios() {
  const { datos, cargando, error } = useColeccion<Usuario>(useMemo(() => query(collection(db, 'users'), orderBy('email')), []))
  const { aviso, ejecutar } = useAviso()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      {(error || aviso) && <Alerta>{error ?? aviso}</Alerta>}
      {cargando ? <Cargando /> : datos.length === 0 ? <EstadoVacio>No hay usuarios.</EstadoVacio> : (
        <div className="overflow-x-auto rounded-tema border border-borde bg-superficie">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-borde text-xs uppercase text-suave"><tr><th className="p-3">Usuario</th><th className="p-3">Tipo</th><th className="p-3">Estado</th></tr></thead>
            <tbody>
              {datos.map(u => (
                <tr key={u.id} className="border-b border-borde last:border-0" data-testid={`usuario-${u.email}`}>
                  <td className="p-3"><p className="font-medium">{u.displayName} {u.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}</p><p className="text-xs text-suave">{u.email}</p></td>
                  <td className="p-3">
                    {u.role === 'admin' ? <Etiqueta>{ETIQUETA_ROL.admin}</Etiqueta> : (
                      <Selector etiqueta="" aria-label={`Tipo de ${u.email}`} value={u.role} onChange={e => void ejecutar(() => updateDoc(doc(db, 'users', u.id), { role: e.target.value as Rol }))}>
                        {ROLES_REGISTRABLES.map(r => <option key={r.rol} value={r.rol}>{r.etiqueta}</option>)}
                      </Selector>
                    )}
                  </td>
                  <td className="p-3">
                    <Selector etiqueta="" aria-label={`Estado de ${u.email}`} value={u.status} onChange={e => void ejecutar(() => updateDoc(doc(db, 'users', u.id), { status: e.target.value as Estado }))}>
                      {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Selector>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const tonoComercio = { pendiente: 'aviso', aprobado: 'ok', rechazado: 'peligro', suspendido: 'peligro' } as const

export function AdminComercios() {
  const { datos, cargando, error } = useColeccion<Comercio>(useMemo(() => query(collection(db, 'commerces')), []))
  const { aviso, ejecutar } = useAviso()

  /** Cambia el estado del comercio y mantiene coherentes al prestador y sus servicios. */
  function cambiar(c: Comercio & { id: string }, estado: EstadoComercio) {
    return ejecutar(async () => {
      const lote = writeBatch(db)
      lote.update(doc(db, 'commerces', c.id), { status: estado })
      if (estado === 'aprobado') lote.update(doc(db, 'users', c.ownerId), { status: 'activo' })
      if (estado === 'suspendido' || estado === 'rechazado') {
        // Los servicios dejan de verse en el catálogo.
        const servicios = await getDocs(query(collection(db, 'services'), where('ownerId', '==', c.ownerId)))
        servicios.forEach(s => lote.update(s.ref, { active: false }))
      }
      await lote.commit()
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Comercios</h1>
      {(error || aviso) && <Alerta>{error ?? aviso}</Alerta>}
      {cargando ? <Cargando /> : datos.length === 0 ? <EstadoVacio>Todavía no hay comercios.</EstadoVacio> : (
        <ul className="space-y-3">
          {datos.map(c => (
            <li key={c.id}>
              <Tarjeta className="space-y-2" data-testid={`comercio-${c.name}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{c.name} {c.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}</p>
                    <p className="text-sm text-suave">{c.category} · {c.city} · {c.email} · {c.phone}</p>
                  </div>
                  <Etiqueta tono={tonoComercio[c.status]}>{c.status}</Etiqueta>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.status !== 'aprobado' && <Boton onClick={() => void cambiar(c, 'aprobado')}>Aprobar</Boton>}
                  {c.status === 'pendiente' && <Boton variante="borde" onClick={() => void cambiar(c, 'rechazado')}>Rechazar</Boton>}
                  {c.status === 'aprobado' && <Boton variante="peligro" onClick={() => void cambiar(c, 'suspendido')}>Suspender</Boton>}
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminServicios() {
  const { datos, cargando, error } = useColeccion<Servicio>(useMemo(() => query(collection(db, 'services')), []))
  const { aviso, ejecutar } = useAviso()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Servicios</h1>
      {(error || aviso) && <Alerta>{error ?? aviso}</Alerta>}
      {cargando ? <Cargando /> : datos.length === 0 ? <EstadoVacio>No hay servicios.</EstadoVacio> : (
        <ul className="space-y-2">
          {datos.map(s => (
            <li key={s.id}>
              <Tarjeta className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{s.title} {s.isDemo && <Etiqueta tono="demo">DEMO</Etiqueta>}</p>
                  <p className="text-xs text-suave">{s.commerceName} · {s.category} · {dinero(s.price)} {s.unit} · {s.active ? 'visible' : 'oculto'}</p>
                </div>
                <div className="flex gap-2">
                  <Boton variante="borde" onClick={() => void ejecutar(() => updateDoc(doc(db, 'services', s.id), { active: !s.active }))}>{s.active ? 'Ocultar' : 'Mostrar'}</Boton>
                  <Boton variante="peligro" onClick={() => { if (confirm(`¿Borrar "${s.title}"?`)) void ejecutar(() => deleteDoc(doc(db, 'services', s.id))) }}>Borrar</Boton>
                </div>
              </Tarjeta>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminReservas() {
  const { datos, cargando, error } = useColeccion<Reserva>(useMemo(() => query(collection(db, 'bookings')), []))
  const { aviso, ejecutar } = useAviso()
  const ordenadas = [...datos].sort((a, b) => b.fromDate.localeCompare(a.fromDate))
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reservas</h1>
      {(error || aviso) && <Alerta>{error ?? aviso}</Alerta>}
      {cargando ? <Cargando /> : ordenadas.length === 0 ? <EstadoVacio>No hay reservas.</EstadoVacio> : ordenadas.map(r => (
        <ReservaFila key={r.id} r={r} quien="turista" acciones={
          <Selector etiqueta="" aria-label={`Estado de la reserva ${r.id}`} value={r.status} onChange={e => void ejecutar(() => updateDoc(doc(db, 'bookings', r.id), e.target.value === 'cancelada' ? { status: 'cancelada', cancelledAt: serverTimestamp() } : { status: e.target.value }))}>
            <option value="confirmada">confirmada</option><option value="completada">completada</option><option value="cancelada">cancelada</option>
          </Selector>
        } />
      ))}
    </div>
  )
}
