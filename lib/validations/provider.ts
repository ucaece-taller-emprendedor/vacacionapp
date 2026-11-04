import { z } from 'zod'
import { BOOKING_STATUSES } from '@/lib/roles'
import { CATEGORIES, LOCATIONS } from '@/lib/catalog'
import { id, texto } from './common'

const categoriasServicio = CATEGORIES.slice(1) as [string, ...string[]]
const zonas = LOCATIONS.slice(1) as [string, ...string[]]

export const servicioCrearSchema = z.object({
  title: texto('El nombre del servicio', 120),
  description: texto('La descripción', 1000),
  category: z.enum(categoriasServicio, { error: 'Elegí una categoría válida' }),
  location: z.enum(zonas, { error: 'Elegí una zona válida' }),
  price: z.number({ error: 'El precio no es válido' }).int().min(0).max(100_000_000),
  unit: texto('La unidad', 40).default('por día'),
})

export const servicioActualizarSchema = z.object({
  id,
  title: texto('El nombre del servicio', 120).optional(),
  description: texto('La descripción', 1000).optional(),
  price: z.number().int().min(0).max(100_000_000).optional(),
  active: z.boolean().optional(),
})

export const reservaEstadoSchema = z.object({
  id,
  status: z.enum(BOOKING_STATUSES.filter(estado => estado !== 'pending') as ['confirmed', 'completed', 'cancelled']),
})
