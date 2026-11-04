import { redirect } from 'next/navigation'
import { AdminLogin } from '@/components/admin/admin-login'
import { AuthPage } from '@/components/auth/auth-page'
import { getSessionUser } from '@/lib/auth/guards'
import { env } from '@/lib/env'

export default async function AdminLoginPage() {
  const actual = await getSessionUser()
  if (actual?.role === 'admin') redirect('/admin')
  return (
    <AuthPage kicker="Acceso restringido" titulo="Administración">
      <AdminLogin googleEnabled={env.googleEnabled} />
    </AuthPage>
  )
}
