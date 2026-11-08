import { collection, doc, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { PestanasPanel } from '@/components/PestanasPanel'
import { ReservaFila } from '@/components/ReservaFila'
import { ServicioCard } from '@/components/ServicioCard'
import { Alerta, Boton, BotonLink, Cargando, EstadoVacio, Tarjeta } from '@/components/ui'
import { useColeccion } from '@/hooks/useColeccion'
import { useFavoritos } from '@/hooks/useFavoritos'
import { db } from '@/lib/firebase'
import type { Reserva, Servicio } from '@/lib/tipos'
import { mensajeDeError } from '@/lib/validations/form'

export function PanelTurista() {
  const { perfil } = useAuth()
  return (
    <PestanasPanel
      titulo={`Hola, ${perfil?.displayName ?? ''}`}
      pestanas={[{ to: '/app/turista', etiqueta: 'Mis reservas', fin: true }, { to: '/app/turista/favoritos', etiqueta: 'Favoritos' }, { to: '/app/turista/cuenta', etiqueta: 'Mi cuenta' }]}
    />
  )
}

export function ReservasTurista() {
  const { usuario } = useAuth()
  const uid = usuario?.uid
  const consulta = useMemo(() => (uid ? query(collection(db, 'bookings'), where('userId', '==', uid)) : null), [uid])
  const { datos, cargando, error } = useColeccion<Reserva>(consulta)
  const [aviso, setAviso] = useState('')
  const ordenadas = [...datos].sort((a, b) => b.fromDate.localeCompare(a.fromDate))

  async function cancelar(id: string) {
    setAviso('')
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelada', cancelledAt: serverTimestamp() })
    } catch (e) {
      setAviso(mensajeDeError(e))
    }
  }

  if (cargando) return <Cargando />
  return (
    <div className="space-y-3">
      {(error || aviso) && <Alerta>{error ?? aviso}</Alerta>}
      {ordenadas.length === 0 ? (
        <EstadoVacio>Todavía no reservaste nada. <Link to="/explorar" className="font-semibold text-primario">Explorá servicios</Link>.</EstadoVacio>
      ) : (
        ordenadas.map(r => (
          <ReservaFila key={r.id} r={r} acciones={r.status === 'confirmada' ? <Boton variante="borde" onClick={() => void cancelar(r.id)}>Cancelar reserva</Boton> : undefined} />
        ))
      )}
    </div>
  )
}

export function FavoritosTurista() {
  const consulta = useMemo(() => query(collection(db, 'services'), where('active', '==', true)), [])
  const { datos, cargando } = useColeccion<Servicio>(consulta)
  const { ids, alternar } = useFavoritos()
  const mios = datos.filter(s => ids.has(s.id))
  if (cargando) return <Cargando />
  if (mios.length === 0) return <EstadoVacio>No tenés favoritos todavía. Tocá el corazón en cualquier servicio para guardarlo.</EstadoVacio>
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {mios.map(s => <ServicioCard key={s.id} servicio={s} favorito onFavorito={() => void alternar(s.id)} />)}
    </div>
  )
}

export function CuentaTurista() {
  const { perfil, usuario } = useAuth()
  return (
    <Tarjeta className="space-y-1">
      <p className="font-semibold">{perfil?.displayName}</p>
      <p className="text-sm text-suave">{usuario?.email}</p>
      <p className="text-sm text-suave">Tipo de cuenta: turista · Estado: {perfil?.status}</p>
      <BotonLink to="/explorar" variante="borde" className="mt-3">Explorar servicios</BotonLink>
    </Tarjeta>
  )
}
