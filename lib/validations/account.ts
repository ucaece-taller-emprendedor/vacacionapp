import { z } from 'zod'
import { fechaISO, id, texto } from './common'

export const metodosDePago = ['Mercado Pago', 'Tarjeta', 'Transferencia'] as const

export const cuentaPostSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('favorite'), serviceId: id }),
  z.object({
    type: z.literal('booking'),
    serviceId: id,
    fromDate: fechaISO,
    toDate: fechaISO,
    people: z.number().int().min(1, 'Elegí al menos una persona').max(50),
    shift: texto('El horario', 60),
    paymentMethod: z.enum(metodosDePago).default('Mercado Pago'),
  }),
])

export const cuentaFavoritoDeleteSchema = z.object({ serviceId: id })
export const cuentaCancelarSchema = z.object({ bookingId: id, action: z.literal('cancel') })

export const perfilSchema = z.object({
  name: texto('El nombre', 100),
  phone: z.string().trim().max(40).optional().default(''),
})
