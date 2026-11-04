'use client'

import { useState, type FormEvent } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function SecureAuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (name: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if ((event.nativeEvent as KeyboardEvent).isComposing || (event as unknown as KeyboardEvent).keyCode === 229) return
    setError(''); setLoading(true)
    const result = mode === 'login'
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ email, password, name: name.trim() || 'Viajero' })
    setLoading(false)
    if (result.error) { setError('No pudimos completar la operación. Revisá tus datos e intentá nuevamente.'); return }
    onSuccess(mode === 'register' ? name.trim() || 'Viajero' : email.split('@')[0] || 'Viajero')
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#073d52]/70 px-5 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-[#147e88]">Cuenta segura</p><h2 className="mt-1 text-2xl font-semibold text-[#183b4d]">{mode === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}</h2></div><button onClick={onClose} aria-label="Cerrar" className="text-2xl text-[#6d858b]">×</button></div><form onSubmit={submit} className="mt-6 space-y-4">{mode === 'register' && <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="field-input"/>}<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="field-input"/><input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña (mínimo 8 caracteres)" className="field-input"/>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Button disabled={loading} className="w-full rounded-full bg-[#123d51]">{loading ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Registrarme'}</Button></form><button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} className="mt-5 w-full text-sm text-[#147e88]">{mode === 'login' ? '¿No tenés cuenta? Registrate' : 'Ya tengo una cuenta'}</button></div></div>
}
