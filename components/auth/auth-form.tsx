'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'

export type Tipo = 'client' | 'provider'
export type ModoAuth = 'login' | 'register'

type Props = {
  mode: ModoAuth
  googleEnabled: boolean
  /** A dónde ir después de ingresar (solo rutas internas). */
  next?: string
  defaultTipo?: Tipo
  /** Si se pasa, se llama en vez de navegar (lo usa el modal del catálogo). */
  onSuccess?: (tipo: Tipo | null) => void
  /** Cambio de modo dentro de un modal; en las páginas se usa switchHref. */
  onSwitchMode?: () => void
  switchHref?: string
}

const rutaSegura = (ruta?: string) => (ruta && ruta.startsWith('/') && !ruta.startsWith('//') ? ruta : '/app')

export function AuthForm({ mode, googleEnabled, next, defaultTipo = 'client', onSuccess, onSwitchMode, switchHref }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tipo, setTipo] = useState<Tipo>(defaultTipo)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const registro = mode === 'register'

  function terminar(tipoElegido: Tipo | null) {
    if (onSuccess) onSuccess(tipoElegido)
    else router.push(tipoElegido === 'provider' ? '/app/prestador' : rutaSegura(next))
    router.refresh()
  }

  async function enviar(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (registro) {
        const respuesta = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, tipo }) })
        if (!respuesta.ok) {
          const datos = (await respuesta.json().catch(() => null)) as { error?: string } | null
          setError(datos?.error ?? 'No pudimos crear la cuenta. Revisá tus datos e intentá nuevamente.')
          return
        }
        terminar(tipo)
      } else {
        const resultado = await authClient.signIn.email({ email, password })
        if (resultado.error) {
          setError('Email o contraseña incorrectos.')
          return
        }
        terminar(null)
      }
    } finally {
      setLoading(false)
    }
  }

  async function conGoogle() {
    setError('')
    const destino = registro && tipo === 'provider' ? '/app?tipo=prestador' : rutaSegura(next)
    const resultado = await authClient.signIn.social({ provider: 'google', callbackURL: destino })
    if (resultado?.error) setError('No pudimos conectar con Google. Probá con tu email y contraseña.')
  }

  const cambiar = switchHref ? (
    <Link href={switchHref} className="mt-5 block w-full text-center text-sm text-[#147e88]">
      {registro ? 'Ya tengo una cuenta' : '¿No tenés cuenta? Registrate'}
    </Link>
  ) : (
    <button type="button" onClick={onSwitchMode} className="mt-5 w-full text-sm text-[#147e88]">
      {registro ? 'Ya tengo una cuenta' : '¿No tenés cuenta? Registrate'}
    </button>
  )

  return (
    <>
      <form onSubmit={enviar} className="mt-6 space-y-4">
        {registro && (
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="mb-2 text-sm font-semibold text-[#183b4d]">¿Cómo vas a usar VacacionApp?</legend>
            {([['client', 'Soy turista', 'Quiero reservar'], ['provider', 'Soy prestador', 'Quiero ofrecer mis servicios']] as const).map(([valor, titulo, detalle]) => (
              <label key={valor} className={`cursor-pointer rounded-2xl border p-3 text-sm ${tipo === valor ? 'border-[#2bc4c4] bg-[#eef7f5]' : 'border-[#dbe8e5]'}`}>
                <input type="radio" name="tipo" value={valor} checked={tipo === valor} onChange={() => setTipo(valor)} className="sr-only" />
                <span className="block font-semibold">{titulo}</span>
                <span className="text-xs text-[#6d858b]">{detalle}</span>
              </label>
            ))}
          </fieldset>
        )}
        {registro && <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" autoComplete="name" className="field-input" />}
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className="field-input" />
        <input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña (mínimo 8 caracteres)" autoComplete={registro ? 'new-password' : 'current-password'} className="field-input" />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full rounded-full bg-[#123d51]">{loading ? 'Procesando…' : registro ? 'Registrarme' : 'Ingresar'}</Button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-[#7d969b]"><span className="h-px flex-1 bg-[#dbe8e5]" />o<span className="h-px flex-1 bg-[#dbe8e5]" /></div>
      {googleEnabled ? (
        <Button type="button" variant="outline" onClick={conGoogle} className="w-full rounded-full">Continuar con Google</Button>
      ) : (
        <div>
          <Button type="button" variant="outline" disabled className="w-full rounded-full">Continuar con Google</Button>
          <p className="mt-2 text-center text-xs text-[#7d969b]">El ingreso con Google todavía no está disponible. Usá tu email y contraseña.</p>
        </div>
      )}
      {cambiar}
    </>
  )
}
