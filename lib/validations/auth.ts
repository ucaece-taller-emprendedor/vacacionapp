import { z } from 'zod'
import { texto } from './common'

export const registroSchema = z.object({
  name: texto('El nombre', 100),
  email: z.email('El email no es válido').max(200).transform(valor => valor.toLowerCase()),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
  tipo: z.enum(['client', 'provider']).default('client'),
})
export type RegistroInput = z.infer<typeof registroSchema>
