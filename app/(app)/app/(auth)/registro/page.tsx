import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthPage } from '@/components/auth/auth-page'
import { getSessionUser } from '@/lib/auth/guards'
import { env } from '@/lib/env'

export const metadata = { title: 'Registrarme | VacacionApp' }

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams
  if (await getSessionUser()) redirect('/app')
  return (
    <AuthPage kicker="Cuenta segura" titulo="Creá tu cuenta">
      <AuthForm mode="register" googleEnabled={env.googleEnabled} defaultTipo={tipo === 'provider' || tipo === 'prestador' ? 'provider' : 'client'} switchHref="/app/ingresar" />
    </AuthPage>
  )
}
