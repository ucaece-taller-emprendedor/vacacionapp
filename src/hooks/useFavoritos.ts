import { collection, deleteDoc, doc, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { useCallback, useMemo } from 'react'
import { useAuth } from '@/auth/useAuth'
import { db } from '@/lib/firebase'
import { useColeccion } from './useColeccion'

type Favorito = { userId: string; serviceId: string }

/** Favoritos del turista conectado (en tiempo real). Para el resto de los usuarios no hay favoritos. */
export function useFavoritos() {
  const { perfil, usuario } = useAuth()
  const uid = perfil?.role === 'turista' ? usuario?.uid : undefined
  const consulta = useMemo(() => (uid ? query(collection(db, 'favorites'), where('userId', '==', uid)) : null), [uid])
  const { datos } = useColeccion<Favorito>(consulta)
  const ids = useMemo(() => new Set(datos.map(f => f.serviceId)), [datos])

  const alternar = useCallback(
    async (serviceId: string) => {
      if (!uid) return
      const ref = doc(db, 'favorites', `${uid}_${serviceId}`)
      if (ids.has(serviceId)) await deleteDoc(ref)
      else await setDoc(ref, { userId: uid, serviceId, createdAt: serverTimestamp() })
    },
    [uid, ids],
  )
  return { ids, alternar, puedeGuardar: perfil?.role === 'turista' }
}
