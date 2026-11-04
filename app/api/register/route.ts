import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { parseBody, route } from '@/lib/api'
import { registroSchema } from '@/lib/validations/auth'

// Registro público de turistas y prestadores. Nunca crea administradores.
export const POST = route(async (request: Request) => {
  const { name, email, password, tipo } = await parseBody(request, registroSchema)
  const respuesta = await auth.api.signUpEmail({ body: { name, email, password }, headers: request.headers, asResponse: true })
  if (!respuesta.ok) {
    return NextResponse.json({ error: 'No pudimos crear la cuenta. Revisá los datos o probá con otro email.' }, { status: 400 })
  }
  const creado = (await respuesta.json()) as { user?: { id: string } }
  if (tipo === 'provider' && creado.user) await db.update(user).set({ role: 'provider' }).where(eq(user.id, creado.user.id))
  const salida = NextResponse.json({ ok: true, tipo })
  for (const cookie of respuesta.headers.getSetCookie()) salida.headers.append('set-cookie', cookie)
  return salida
})
