'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = { endpoint: string; id: string; field: string; value: string; options: ReadonlyArray<readonly [string, string]>; label: string; disabled?: boolean }

/** Selector que cambia un campo (rol, estado de reserva) y refresca la tabla. */
export function AdminSelect({ endpoint, id, field, value, options, label, disabled }: Props) {
  const router = useRouter()
  const [error, setError] = useState('')

  async function cambiar(nuevo: string) {
    setError('')
    const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, [field]: nuevo }) })
    if (!response.ok) {
      const datos = (await response.json().catch(() => null)) as { error?: string } | null
      setError(datos?.error ?? 'No se pudo aplicar el cambio.')
      return
    }
    router.refresh()
  }

  return (
    <span className="inline-flex flex-col">
      <select aria-label={label} value={value} disabled={disabled} onChange={e => cambiar(e.target.value)} className="rounded-lg border border-[#dbe8e5] bg-white px-2 py-1.5 text-xs">
        {options.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
      </select>
      {error && <span role="alert" className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  )
}
