import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth/auth-form'
import { AuthPage } from '@/components/auth/auth-page'
import { getSessionUser } from '@/lib/auth/guards'
import { env } from '@/lib/env'

export const metadata = { title: 'Ingresar | VacacionApp' }

export default async function IngresarPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  if (await getSessionUser()) redirect('/app')
  return (
    <AuthPage kicker="Cuenta segura" titulo="Iniciá sesión">
      <AuthForm mode="login" googleEnabled={env.googleEnabled} next={next} switchHref="/app/registro" />
    </AuthPage>
  )
}
