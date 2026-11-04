import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { commerce, user } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { HttpError, requireRole } from '@/lib/auth/guards'
import { comercioSchema } from '@/lib/validations/commerce'

// Alta de comercio: queda "pending" hasta que un admin lo apruebe.
export const POST = route(async (request: Request) => {
  const actual = await requireRole(['client', 'provider'])
  const datos = await parseBody(request, comercioSchema)
  const [existente] = await db.select({ id: commerce.id }).from(commerce).where(eq(commerce.ownerId, actual.id))
  if (existente) throw new HttpError(409, 'Ya tenés un comercio registrado.')
  const fila = { id: crypto.randomUUID(), ownerId: actual.id, ...datos }
  await db.insert(commerce).values(fila)
  if (actual.role === 'client') await db.update(user).set({ role: 'provider' }).where(eq(user.id, actual.id))
  return NextResponse.json({ ...fila, status: 'pending' }, { status: 201 })
})
