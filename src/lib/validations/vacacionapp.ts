import { z } from 'zod'
import { CATEGORIAS, IMAGEN_POR_DEFECTO, METODOS_PAGO, ZONAS } from '@/config/app'

const texto = (campo: string, min: number, max: number) =>
  z.string().trim().min(min, `${campo}: mínimo ${min} caracteres.`).max(max, `${campo}: máximo ${max} caracteres.`)

export const comercioSchema = z.object({
  name: texto('El nombre', 2, 80),
  category: z.enum(CATEGORIAS, { error: 'Elegí una categoría.' }),
  description: texto('La descripción', 10, 600),
  contactName: texto('El contacto', 2, 80),
  email: z.string().trim().toLowerCase().pipe(z.email('Ingresá un email válido.')),
  phone: texto('El teléfono', 6, 30),
  address: texto('La dirección', 3, 120),
  city: texto('La ciudad', 2, 60),
  province: texto('La provincia', 2, 60),
})
export type ComercioForm = z.infer<typeof comercioSchema>

export const servicioSchema = z.object({
  title: texto('El título', 3, 100),
  description: texto('La descripción', 10, 1000),
  category: z.enum(CATEGORIAS, { error: 'Elegí una categoría.' }),
  location: z.enum(ZONAS, { error: 'Elegí una zona.' }),
  price: z.coerce.number({ error: 'Ingresá un precio.' }).int('El precio debe ser un número entero.').min(100, 'El precio mínimo es $100.').max(10_000_000, 'El precio es demasiado alto.'),
  unit: z.enum(['por día', 'por persona', 'por sesión'], { error: 'Elegí cómo se cobra.' }),
  duration: texto('La duración', 2, 40),
  tag: texto('La etiqueta', 2, 30).default('Nuevo'),
  includes: z.string().transform(s => s.split('\n').map(x => x.trim()).filter(Boolean)).pipe(z.array(z.string().max(60, 'Cada ítem: máximo 60 caracteres.')).max(10, 'Máximo 10 ítems.')),
  policy: texto('La política de cancelación', 5, 300),
  image: z
    .string()
    .trim()
    .max(500, 'La URL es demasiado larga.')
    .refine(v => v === '' || v.startsWith('https://') || v.startsWith('/'), 'La imagen debe ser una URL https:// o una ruta del sitio.')
    .transform(v => v || IMAGEN_POR_DEFECTO),
  active: z.preprocess(v => v === 'on' || v === 'true' || v === true, z.boolean()),
})
export type ServicioForm = z.infer<typeof servicioSchema>

export const busquedaReservaSchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elegí la fecha de inicio.'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elegí la fecha de fin.'),
    people: z.coerce.number({ error: 'Indicá la cantidad de personas.' }).int().min(1, 'Mínimo 1 persona.').max(20, 'Máximo 20 personas.'),
    shift: z.string().min(3, 'Elegí un horario.'),
  })
  .refine(d => d.to >= d.from, { path: ['to'], message: 'La fecha de fin no puede ser anterior a la de inicio.' })

export const pagoSchema = z.object({
  metodo: z.enum(METODOS_PAGO, { error: 'Elegí un método de pago.' }),
  confirmo: z.literal('on', { error: 'Confirmá que los datos son correctos.' }),
})
