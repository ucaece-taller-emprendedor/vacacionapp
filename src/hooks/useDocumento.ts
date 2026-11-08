import { onSnapshot, type DocumentReference } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { Con } from './useColeccion'

/** Escucha un documento. `dato` es null si no existe (o no se puede leer). La referencia debe estar memoizada. */
export function useDocumento<T>(ref: DocumentReference | null): { dato: Con<T> | null; cargando: boolean } {
  const [estado, setEstado] = useState<{ dato: Con<T> | null; cargando: boolean }>({ dato: null, cargando: ref !== null })
  useEffect(() => {
    if (!ref) return
    return onSnapshot(
      ref,
      snap => setEstado({ dato: snap.exists() ? ({ id: snap.id, ...(snap.data() as T) } as Con<T>) : null, cargando: false }),
      () => setEstado({ dato: null, cargando: false }),
    )
  }, [ref])
  return estado
}
