'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthForm, type ModoAuth, type Tipo } from '@/components/auth/auth-form'

/** Ingreso/registro sin salir de la pantalla (por ejemplo al querer reservar). */
export function AuthModal({ onClose, onSuccess, googleEnabled, next }: { onClose: () => void; onSuccess: () => void; googleEnabled: boolean; next: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<ModoAuth>('login')

  function listo(tipo: Tipo | null) {
    onClose()
    if (tipo === 'provider') router.push('/app/prestador/comercio')
    else onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#073d52]/70 px-5 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-[#147e88]">Cuenta segura</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#183b4d]">{mode === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl text-[#6d858b]">×</button>
        </div>
        <AuthForm key={mode} mode={mode} googleEnabled={googleEnabled} next={next} onSuccess={listo} onSwitchMode={() => setMode(mode === 'login' ? 'register' : 'login')} />
      </div>
    </div>
  )
}
