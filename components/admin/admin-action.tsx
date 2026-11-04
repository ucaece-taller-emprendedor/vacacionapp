'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = { endpoint: string; body: Record<string, unknown>; label: string; confirmText?: string; tone?: 'primary' | 'danger' | 'neutral' }

const estilos = {
  primary: 'bg-[#147e88] text-white',
  danger: 'border border-[#e9b6ae] text-[#a84a3f]',
  neutral: 'border border-[#b9d7d2]',
}

/** Botón que aplica un cambio de moderación (PATCH) y refresca la tabla. */
export function AdminAction({ endpoint, body, label, confirmText, tone = 'neutral' }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function aplicar() {
    if (confirmText && !window.confirm(confirmText)) return
    setBusy(true)
    setError('')
    const response = await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setBusy(false)
    if (!response.ok) {
      const datos = (await response.json().catch(() => null)) as { error?: string } | null
      setError(datos?.error ?? 'No se pudo aplicar el cambio.')
      return
    }
    router.refresh()
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button onClick={aplicar} disabled={busy} className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${estilos[tone]}`}>{busy ? '…' : label}</button>
      {error && <span role="alert" className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  )
}
