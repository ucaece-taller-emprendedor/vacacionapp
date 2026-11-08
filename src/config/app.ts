// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE VACACIONAPP — marca, roles y textos.
// Los colores se cambian en src/styles/tema.css.
// Si agregás o renombrás roles/categorías, hay que cambiarlos TAMBIÉN en firestore.rules.
// ──────────────────────────────────────────────────────────────────────────

export const MARCA = {
  nombre: 'VacacionApp',
  eslogan: 'Organizá tus vacaciones. Disfrutá el viaje.',
  logo: '/logo.webp',
  contacto: 'hola@vacacionapp.test',
}

export type Rol = 'turista' | 'prestador' | 'admin'
export type Estado = 'activo' | 'pendiente' | 'suspendido'

export const ESTADOS: Estado[] = ['activo', 'pendiente', 'suspendido']

export type RolRegistrable = Exclude<Rol, 'admin'>

export const ROLES_REGISTRABLES: {
  rol: RolRegistrable
  etiqueta: string
  descripcion: string
  /** Si es true el usuario queda "pendiente" hasta que el admin lo aprueba. */
  requiereAprobacion: boolean
  /** Panel al que va después de ingresar. */
  panel: string
}[] = [
  { rol: 'turista', etiqueta: 'Turista', descripcion: 'Explorá, guardá favoritos y reservá servicios para tu viaje.', requiereAprobacion: false, panel: '/app/turista' },
  { rol: 'prestador', etiqueta: 'Prestador (comercio)', descripcion: 'Publicá tus servicios y recibí reservas. Tu comercio lo aprueba el equipo de VacacionApp.', requiereAprobacion: true, panel: '/app/prestador' },
]

export const ETIQUETA_ROL: Record<Rol, string> = { turista: 'Turista', prestador: 'Prestador', admin: 'Administrador' }

export function panelDe(rol: Rol): string {
  if (rol === 'admin') return '/admin'
  return ROLES_REGISTRABLES.find(r => r.rol === rol)?.panel ?? '/app'
}

// ── Catálogo ──────────────────────────────────────────────────────────────
export const CATEGORIAS = ['Carpas y sombrillas', 'Actividades acuáticas', 'Bienestar y spa', 'Gastronomía'] as const
export type Categoria = (typeof CATEGORIAS)[number]
export const ZONAS = ['Playa Grande', 'Varese', 'La Perla', 'Bristol', 'Punta Iglesia', 'Puerto'] as const
export const METODOS_PAGO = ['Mercado Pago', 'Tarjeta', 'Transferencia'] as const
export const IMAGEN_POR_DEFECTO = '/hero.webp'

/** Turnos según la categoría. */
export const turnos = (categoria: string) =>
  categoria === 'Carpas y sombrillas'
    ? ['Día completo']
    : categoria === 'Actividades acuáticas'
      ? ['09:00 · 2 h', '11:00 · 2 h', '15:00 · 2 h']
      : categoria === 'Bienestar y spa'
        ? ['10:00 · 60 min', '13:00 · 60 min', '17:00 · 60 min']
        : ['12:00–13:30', '13:30–15:00', '20:30–22:00']

/** Las carpas se cobran por día; el resto, por persona. firestore.rules calcula lo mismo para validar el total. */
export const totalReserva = (categoria: string, precio: number, personas: number) => (categoria === 'Carpas y sombrillas' ? precio : precio * Math.max(1, personas))

export const dinero = (n: number) => `$${n.toLocaleString('es-AR')}`
export const hoy = () => new Date().toISOString().split('T')[0] as string

/** Landing pública: textos editables. */
export const LANDING = {
  problema: { titulo: 'Reservar servicios turísticos locales es un lío', texto: 'La información está dispersa en redes y llamados, los precios son difíciles de comparar y reservar suele ser informal. Del otro lado, los prestadores no tienen un canal simple para ofrecerse.' },
  solucion: { titulo: 'Un solo lugar para encontrar, comparar y reservar', texto: 'VacacionApp reúne balnearios, actividades, bienestar y gastronomía de Mar del Plata. Los turistas reservan en pocos pasos y los prestadores administran sus servicios y reservas desde un panel propio.' },
  beneficios: [
    { titulo: 'Reservá con confianza', texto: 'Comercios aprobados por nuestro equipo antes de publicarse.' },
    { titulo: 'Experiencias reales', texto: 'Precios, valoraciones y detalles claros para comparar.' },
    { titulo: 'Todo organizado', texto: 'Tus reservas y favoritos en un solo lugar.' },
  ],
  pasos: [
    { titulo: 'Explorá y compará', texto: 'Carpas, actividades acuáticas, spa y gastronomía, con precios y valoraciones.' },
    { titulo: 'Reservá online', texto: 'Elegí fecha y horario, y gestioná tus reservas desde tu cuenta.' },
    { titulo: 'Sumá tu comercio', texto: 'Si sos prestador, publicás tus servicios y recibís reservas en un panel simple.' },
  ],
  cta: { titulo: 'Empezá a organizar tus vacaciones', texto: 'Creá tu cuenta gratis, o sumá tu comercio para recibir reservas.' },
}

export const AVISO_PAGO_SIMULADO = 'Pago simulado: esto es una demostración y no se realiza ningún cobro real. No ingreses datos reales de tu tarjeta.'
