import { NextResponse } from 'next/server'
import { z } from 'zod'
import { HttpError } from '@/lib/auth/guards'

/** Envuelve un route handler: traduce errores de autorización y validación a respuestas JSON. */
export function route<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status })
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.issues[0]?.message ?? 'Datos inválidos.' }, { status: 400 })
      }
      console.error(error)
      return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
    }
  }
}

/** Lee el body JSON y lo valida con Zod (lanza ZodError si no cumple). */
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  let cuerpo: unknown
  try {
    cuerpo = await request.json()
  } catch {
    cuerpo = undefined
  }
  return schema.parse(cuerpo)
}
