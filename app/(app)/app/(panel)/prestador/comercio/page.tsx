import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { CommerceForm } from '@/components/commerce-form'
import { requirePageRole } from '@/lib/auth/guards'
import { db } from '@/lib/db'
import { commerce } from '@/lib/db/schema'

export const metadata = { title: 'Sumar mi comercio | VacacionApp' }

export default async function ComercioPage() {
  const actual = await requirePageRole(['client', 'provider'])
  const [existente] = await db.select({ id: commerce.id }).from(commerce).where(eq(commerce.ownerId, actual.id))
  if (existente) redirect('/app/prestador')
  return <CommerceForm />
}
