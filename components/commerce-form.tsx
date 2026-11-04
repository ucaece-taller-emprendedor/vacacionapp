'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Building2 } from 'lucide-react'

export function CommerceForm() {
  const [form, setForm] = useState({ name: '', category: '', description: '', contactName: '', email: '', phone: '', address: '', city: 'Mar del Plata', province: 'Buenos Aires' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch('/api/commerce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (!response.ok) {
      const datos = (await response.json().catch(() => null)) as { error?: string } | null
      setError(datos?.error ?? 'No pudimos enviar la solicitud. Revisá los datos e intentá nuevamente.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#dbe8e5] bg-white p-6 shadow-sm sm:p-8">
        <Building2 className="size-8 text-[#147e88]" />
        <h1 className="mt-4 text-3xl font-semibold">Solicitud enviada</h1>
        <p role="status" className="mt-2 text-[#6d858b]">Quedó pendiente de revisión. Cuando el equipo apruebe tu comercio, tus servicios se publican en el catálogo.</p>
        <Link href="/app/prestador" className="mt-6 inline-flex rounded-full bg-[#147e88] px-6 py-3 font-semibold text-white">Ir a mi panel</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-[#dbe8e5] bg-white p-6 shadow-sm sm:p-8">
        <Building2 className="size-8 text-[#147e88]" />
        <h1 className="mt-4 text-3xl font-semibold">Sumar mi comercio</h1>
        <p className="mt-2 text-[#6d858b]">Completá la solicitud. El equipo la revisará antes de publicarla.</p>
        <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className={key === 'description' ? 'sm:col-span-2' : ''}>
              <span className="mb-1 block text-sm font-semibold capitalize">{key === 'name' ? 'Nombre del comercio' : key === 'contactName' ? 'Nombre de contacto' : key === 'description' ? 'Descripción' : key}</span>
              {key === 'description'
                ? <textarea required value={value} onChange={event => setForm({ ...form, [key]: event.target.value })} className="field-input min-h-28" />
                : <input required type={key === 'email' ? 'email' : 'text'} value={value} onChange={event => setForm({ ...form, [key]: event.target.value })} className="field-input" />}
            </label>
          ))}
          {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <button disabled={saving} className="rounded-full bg-[#147e88] px-6 py-3 font-semibold text-white sm:col-span-2">{saving ? 'Enviando…' : 'Enviar solicitud'}</button>
        </form>
      </div>
    </div>
  )
}
