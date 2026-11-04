import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { requireRole } from '@/lib/auth/guards'
import { perfilSchema } from '@/lib/validations/account'

const columnas = { id: user.id, name: user.name, email: user.email, phone: user.phone }

export const GET = route(async () => {
  const actual = await requireRole(['client', 'provider'])
  const [fila] = await db.select(columnas).from(user).where(eq(user.id, actual.id))
  return NextResponse.json(fila)
})

export const PATCH = route(async (request: Request) => {
  const actual = await requireRole(['client', 'provider'])
  const { name, phone } = await parseBody(request, perfilSchema)
  const [fila] = await db.update(user).set({ name, phone: phone || null, updatedAt: new Date() }).where(eq(user.id, actual.id)).returning(columnas)
  return NextResponse.json(fila)
})
