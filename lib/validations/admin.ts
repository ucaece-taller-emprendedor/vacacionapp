import { z } from 'zod'
import { BOOKING_STATUSES, COMMERCE_STATUSES, ROLES, USER_STATUSES } from '@/lib/roles'
import { id } from './common'

export const adminUsuarioSchema = z
  .object({ id, role: z.enum(ROLES).optional(), status: z.enum(USER_STATUSES).optional() })
  .refine(datos => datos.role !== undefined || datos.status !== undefined, { message: 'No hay cambios para aplicar' })

export const adminComercioSchema = z.object({ id, status: z.enum(COMMERCE_STATUSES) })
export const adminServicioSchema = z.object({ id, active: z.boolean() })
export const adminReservaSchema = z.object({ id, status: z.enum(BOOKING_STATUSES) })
