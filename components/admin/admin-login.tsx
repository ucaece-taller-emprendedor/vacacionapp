'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { authClient, signOut } from '@/lib/auth/client'

/** Login del panel de administración. No hay registro: las cuentas admin salen de ADMIN_EMAILS o del seed. */
export function AdminLogin({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function enviar(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const resultado = await authClient.signIn.email({ email, password })
    if (resultado.error) {
      setLoading(false)
      setError('Email o contraseña incorrectos.')
      return
    }
    const esAdmin = (await fetch('/api/admin/session')).ok
    if (!esAdmin) {
      await signOut()
      setLoading(false)
      setError('Esta cuenta no tiene acceso al panel de administración.')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  async function conGoogle() {
    const resultado = await authClient.signIn.social({ provider: 'google', callbackURL: '/admin' })
    if (resultado?.error) setError('No pudimos conectar con Google.')
  }

  return (
    <>
      <form onSubmit={enviar} className="mt-6 space-y-4">
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className="field-input" />
        <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" autoComplete="current-password" className="field-input" />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full rounded-full bg-[#123d51]">{loading ? 'Procesando…' : 'Ingresar'}</Button>
      </form>
      {googleEnabled && <Button type="button" variant="outline" onClick={conGoogle} className="mt-3 w-full rounded-full">Continuar con Google</Button>}
    </>
  )
}
