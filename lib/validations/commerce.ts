import { z } from 'zod'
import { texto } from './common'

export const comercioSchema = z.object({
  name: texto('El nombre del comercio', 120),
  category: texto('La categoría', 80),
  description: texto('La descripción', 1000),
  contactName: texto('El nombre de contacto', 120),
  email: z.email('El email no es válido').max(200),
  phone: texto('El teléfono', 40),
  address: texto('La dirección', 200),
  city: texto('La ciudad', 100),
  province: texto('La provincia', 100),
})
