import { z } from 'zod'

// '' en el .env cuenta como "sin definir" (por ejemplo GOOGLE_CLIENT_ID=)
const opcional = z.preprocess(valor => (valor === '' ? undefined : valor), z.string().min(1).optional())

const esquema = z
  .object({
    DATABASE_URL: z
      .string({ error: 'falta' })
      .regex(/^postgres(ql)?:\/\//, 'debe empezar con postgresql://'),
    BETTER_AUTH_SECRET: z.string({ error: 'falta' }).min(32, 'debe tener al menos 32 caracteres (generá uno con: openssl rand -base64 32)'),
    BETTER_AUTH_URL: z.url({ error: 'debe ser una URL completa, por ejemplo http://localhost:3000' }),
    GOOGLE_CLIENT_ID: opcional,
    GOOGLE_CLIENT_SECRET: opcional,
    ADMIN_EMAILS: z
      .string()
      .optional()
      .transform(valor =>
        (valor ?? '')
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(Boolean),
      ),
  })
  .refine(datos => Boolean(datos.GOOGLE_CLIENT_ID) === Boolean(datos.GOOGLE_CLIENT_SECRET), {
    message: 'GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET se configuran juntos (o ninguno de los dos)',
    path: ['GOOGLE_CLIENT_ID'],
  })

const resultado = esquema.safeParse(process.env)

if (!resultado.success) {
  const detalle = resultado.error.issues
    .map(issue => `  - ${issue.path.join('.') || 'configuración'}: ${issue.message}`)
    .join('\n')
  throw new Error(
    `Variables de entorno inválidas o faltantes:\n${detalle}\n\nCopiá .env.example a .env y completá los valores (ver README).`,
  )
}

export const env = {
  ...resultado.data,
  googleEnabled: Boolean(resultado.data.GOOGLE_CLIENT_ID && resultado.data.GOOGLE_CLIENT_SECRET),
}
