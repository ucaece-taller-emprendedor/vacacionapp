import { z } from 'zod'

export const texto = (campo: string, max = 200) =>
  z.string({ error: `${campo} es obligatorio` }).trim().min(1, `${campo} es obligatorio`).max(max, `${campo} es demasiado largo`)

export const id = z.string().trim().min(1).max(100)

export const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha no es válida')
