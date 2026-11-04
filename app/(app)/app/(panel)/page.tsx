import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { requirePageRole } from '@/lib/auth/guards'

// /app decide a qué panel va cada rol. Con ?tipo=prestador (registro con Google) el usuario nuevo pasa a ser prestador.
export default async function AppHome({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams
  const actual = await requirePageRole(['client', 'provider'])
  let rol = actual.role
  if (tipo === 'prestador' && rol === 'client') {
    await db.update(user).set({ role: 'provider' }).where(eq(user.id, actual.id))
    rol = 'provider'
  }
  redirect(rol === 'provider' ? '/app/prestador' : '/app/cuenta')
}
