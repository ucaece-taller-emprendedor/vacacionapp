/**
 * Datos de DEMO de VacacionApp (todo marcado isDemo: true).
 *
 *  Emuladores (usuarios con clave pública + catálogo + una reserva):
 *    1) npm run emuladores   (en otra terminal)
 *    2) npm run seed
 *
 *  Producción (SOLO el catálogo de ejemplo, SIN usuarios ni claves — para que el sitio no quede vacío):
 *    FIREBASE_PROJECT_ID=... GOOGLE_APPLICATION_CREDENTIALS=... npm run seed -- --produccion --yes
 *
 * Es idempotente: se puede correr varias veces.
 */
import { pathToFileURL } from 'node:url'
import { iniciarAdmin } from './lib/admin-sdk'

export const CLAVE_DEMO = 'Demo-Clave-2026' // pública, solo existe en los emuladores

export const USUARIOS_DEMO = [
  { uid: 'demo-turista', email: 'turista.demo@vacacionapp.test', displayName: 'Turista Demo', role: 'turista', status: 'activo' },
  { uid: 'demo-prestador', email: 'prestador.demo@vacacionapp.test', displayName: 'Prestador Demo', role: 'prestador', status: 'activo' },
  { uid: 'demo-prestador-pendiente', email: 'pendiente.demo@vacacionapp.test', displayName: 'Prestador Pendiente Demo', role: 'prestador', status: 'pendiente' },
  { uid: 'demo-admin', email: 'admin.demo@vacacionapp.test', displayName: 'Admin Demo', role: 'admin', status: 'activo' },
] as const

type C = 'Carpas y sombrillas' | 'Actividades acuáticas' | 'Bienestar y spa' | 'Gastronomía'
const comercio = (ownerId: string, name: string, category: C, status = 'aprobado') => ({
  ownerId, name, category, status, isDemo: true,
  description: `${name}: comercio de ejemplo (datos de demo, no es un comercio real).`,
  contactName: 'Contacto Demo', email: `${ownerId}@vacacionapp.test`, phone: '223 000-0000', address: 'Dirección de ejemplo 123', city: 'Mar del Plata', province: 'Buenos Aires',
})

const COMERCIOS = [
  comercio('demo-prestador', 'Balneario Alfonsina', 'Carpas y sombrillas'),
  comercio('demo-owner-torreon', 'Torreón del Monje', 'Carpas y sombrillas'),
  comercio('demo-owner-balneario-23', 'Balneario 23 de Punta Mogotes', 'Carpas y sombrillas'),
  comercio('demo-owner-plenara', 'Plenara Surf School', 'Actividades acuáticas'),
  comercio('demo-owner-nautilus', 'Nautilus MDP', 'Actividades acuáticas'),
  comercio('demo-owner-alma', 'Alma Spa & Wellness', 'Bienestar y spa'),
  comercio('demo-owner-viento', 'Restó Viento en Popa', 'Gastronomía'),
  comercio('demo-owner-balneario-12', 'Balneario 12 de Punta Mogotes', 'Carpas y sombrillas'),
  comercio('demo-owner-mdq', 'MDQ Water Club', 'Actividades acuáticas'),
  comercio('demo-owner-varese', 'Espacio Varese Wellness', 'Bienestar y spa'),
  comercio('demo-owner-perla', 'Local La Perla del Mar', 'Gastronomía'),
  // Pendiente: sirve para mostrar cómo el admin aprueba un comercio en clase.
  comercio('demo-prestador-pendiente', 'Sol y Arena (pendiente)', 'Carpas y sombrillas', 'pendiente'),
]

type S = { id: string; owner: string; slug: string; title: string; location: string; price: number; unit: string; rating: number; reviews: number; tag: string; duration: string; category: C; description: string; includes: string[]; policy: string }
const SERVICIOS: S[] = [
  { id: 'demo-carpa-premium', owner: 'demo-prestador', slug: 'carpa-premium', title: 'Carpa Premium', location: 'Playa Grande', price: 45000, unit: 'por día', rating: 4.9, reviews: 128, tag: 'Más reservado', duration: 'Día completo', category: 'Carpas y sombrillas', description: 'Espacio exclusivo frente al mar con sombra, seguridad y atención personalizada.', includes: ['Carpa', '2 reposeras', 'Mesa auxiliar'], policy: 'Cancelación gratis hasta 24 h antes.' },
  { id: 'demo-carpa-familiar-cubierta', owner: 'demo-owner-torreon', slug: 'carpa-familiar-cubierta', title: 'Carpa familiar cubierta', location: 'Varese', price: 39000, unit: 'por día', rating: 4.8, reviews: 74, tag: 'Familiar', duration: 'Día completo', category: 'Carpas y sombrillas', description: 'Carpa amplia para disfrutar la playa en familia con mesa y reposeras.', includes: ['Carpa cubierta', '4 reposeras', 'Baulera'], policy: 'Reprogramación según clima.' },
  { id: 'demo-sombrilla-2-reposeras', owner: 'demo-owner-balneario-23', slug: 'sombrilla-2-reposeras', title: 'Sombrilla + 2 reposeras', location: 'La Perla', price: 22000, unit: 'por día', rating: 4.8, reviews: 97, tag: 'Oferta', duration: 'Día completo', category: 'Carpas y sombrillas', description: 'La opción simple para instalarte en la playa sin preocuparte por nada.', includes: ['Sombrilla', '2 reposeras', 'Atención en playa'], policy: 'Cancelación gratis hasta 24 h antes.' },
  { id: 'demo-clase-surf-inicial', owner: 'demo-owner-plenara', slug: 'clase-surf-inicial', title: 'Clase de surf inicial', location: 'Varese', price: 32000, unit: 'por persona', rating: 4.8, reviews: 86, tag: 'Cupos limitados', duration: '2 horas', category: 'Actividades acuáticas', description: 'Aprendé a surfear con instructores certificados y equipamiento incluido.', includes: ['Tabla', 'Instructor', 'Seguro'], policy: 'Reprogramación por clima.' },
  { id: 'demo-paseo-en-kayak', owner: 'demo-owner-nautilus', slug: 'paseo-en-kayak', title: 'Paseo en kayak', location: 'Playa Grande', price: 28000, unit: 'por persona', rating: 4.7, reviews: 64, tag: 'Nuevo', duration: '2 horas', category: 'Actividades acuáticas', description: 'Una aventura costera tranquila para descubrir la bahía desde el agua.', includes: ['Kayak', 'Chaleco', 'Guía'], policy: 'Reprogramación por clima.' },
  { id: 'demo-masaje-frente-al-mar', owner: 'demo-owner-alma', slug: 'masaje-frente-al-mar', title: 'Masaje frente al mar', location: 'Playa Grande', price: 38000, unit: 'por sesión', rating: 5, reviews: 42, tag: 'Mejor valorado', duration: '60 minutos', category: 'Bienestar y spa', description: 'Sesión de relajación profunda con sonido de olas.', includes: ['Masaje 60 min', 'Aromaterapia', 'Sala privada'], policy: 'Cancelación gratis hasta 24 h antes.' },
  { id: 'demo-almuerzo-vista-al-mar', owner: 'demo-owner-viento', slug: 'almuerzo-vista-al-mar', title: 'Almuerzo con vista al mar', location: 'Puerto', price: 24500, unit: 'por persona', rating: 4.6, reviews: 213, tag: 'Imperdible', duration: 'A elección', category: 'Gastronomía', description: 'Sabores frescos, productos locales y una vista privilegiada del puerto.', includes: ['Menú de 3 pasos', 'Bebida', 'Vista al mar'], policy: 'Cancelación hasta 12 h antes.' },
  { id: 'demo-carpa-clasica', owner: 'demo-owner-balneario-12', slug: 'carpa-clasica', title: 'Carpa clásica', location: 'Playa Grande', price: 34000, unit: 'por día', rating: 4.7, reviews: 58, tag: 'Nuevo', duration: 'Día completo', category: 'Carpas y sombrillas', description: 'Sombra y comodidad a metros del mar.', includes: ['Carpa', '2 reposeras', 'Mesa'], policy: 'Reprogramación según clima.' },
  { id: 'demo-clase-paddle-surf', owner: 'demo-owner-mdq', slug: 'clase-paddle-surf', title: 'Clase de paddle surf', location: 'Playa Grande', price: 36000, unit: 'por persona', rating: 4.8, reviews: 39, tag: 'Nuevo', duration: '2 horas', category: 'Actividades acuáticas', description: 'Introducción al paddle surf con instructor y equipo.', includes: ['Tabla', 'Instructor', 'Chaleco'], policy: 'Reprogramación por clima.' },
  { id: 'demo-yoga-y-respiracion', owner: 'demo-owner-varese', slug: 'yoga-y-respiracion', title: 'Yoga y respiración', location: 'Varese', price: 18000, unit: 'por persona', rating: 4.9, reviews: 31, tag: 'Bienestar', duration: '60 minutos', category: 'Bienestar y spa', description: 'Una práctica suave para empezar el día frente al mar.', includes: ['Clase', 'Mat', 'Infusión'], policy: 'Cancelación hasta 12 h antes.' },
  { id: 'demo-cena-de-mariscos', owner: 'demo-owner-perla', slug: 'cena-de-mariscos', title: 'Cena de mariscos', location: 'La Perla', price: 32000, unit: 'por persona', rating: 4.7, reviews: 76, tag: 'Nuevo', duration: 'A elección', category: 'Gastronomía', description: 'Cocina de mar con productos frescos de la costa.', includes: ['Menú degustación', 'Bebida', 'Mesa reservada'], policy: 'Cancelación hasta 12 h antes.' },
]

export async function sembrar({ conUsuarios = true }: { conUsuarios?: boolean } = {}, opciones: { produccion?: boolean } = {}) {
  const { auth, db } = iniciarAdmin(opciones)
  const ahora = Date.now()

  if (conUsuarios) {
    for (const u of USUARIOS_DEMO) {
      const datos = { email: u.email, displayName: u.displayName, password: CLAVE_DEMO, emailVerified: true }
      await auth.updateUser(u.uid, datos).catch(() => auth.createUser({ uid: u.uid, ...datos }))
      await auth.setCustomUserClaims(u.uid, u.role === 'admin' ? { admin: true } : {})
      await db.doc(`users/${u.uid}`).set({ email: u.email, displayName: u.displayName, role: u.role, status: u.status, isDemo: true, createdAt: new Date() })
    }
  }
  if (!conUsuarios) {
    // En producción: perfiles de ejemplo en Firestore, SIN cuenta para ingresar (no hay claves públicas).
    for (const u of USUARIOS_DEMO.filter(u => u.role !== 'admin')) {
      await db.doc(`users/${u.uid}`).set({ email: u.email, displayName: u.displayName, role: u.role, status: u.status, isDemo: true, createdAt: new Date() })
    }
  }
  // Titulares de los comercios de ejemplo: solo perfil en Firestore, SIN cuenta para ingresar.
  for (const c of COMERCIOS.filter(c => c.ownerId.startsWith('demo-owner-'))) {
    await db.doc(`users/${c.ownerId}`).set({ email: `${c.ownerId}@vacacionapp.test`, displayName: `Titular de ${c.name}`, role: 'prestador', status: 'activo', isDemo: true, createdAt: new Date() })
  }
  for (const c of COMERCIOS) await db.doc(`commerces/${c.ownerId}`).set({ ...c, createdAt: new Date() })

  for (const [i, s] of SERVICIOS.entries()) {
    const comercioDe = COMERCIOS.find(c => c.ownerId === s.owner)
    await db.doc(`services/${s.id}`).set({
      ownerId: s.owner, commerceName: comercioDe?.name ?? '', title: s.title, description: s.description, category: s.category, location: s.location, price: s.price, unit: s.unit,
      rating: s.rating, reviews: s.reviews, image: `/servicios/${s.slug}.webp`, tag: s.tag, duration: s.duration, includes: s.includes, policy: s.policy, active: true, isDemo: true, createdAt: new Date(ahora + i * 1000),
    })
  }

  if (conUsuarios) {
    const s = SERVICIOS[0]!
    await db.doc('bookings/demo-reserva-1').set({
      userId: 'demo-turista', userName: 'Turista Demo', userEmail: 'turista.demo@vacacionapp.test', serviceId: s.id, ownerId: s.owner, serviceTitle: s.title, commerceName: 'Balneario Alfonsina', location: s.location,
      fromDate: '2027-01-15', toDate: '2027-01-15', people: 2, shift: 'Día completo', total: s.price, status: 'confirmada', payment: { metodo: 'Mercado Pago', estado: 'simulado', monto: s.price }, createdAt: new Date(),
    })
    await db.doc('favorites/demo-turista_demo-paseo-en-kayak').set({ userId: 'demo-turista', serviceId: 'demo-paseo-en-kayak', createdAt: new Date() })
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const produccion = process.argv.includes('--produccion')
  if (produccion && !process.argv.includes('--yes')) {
    console.error('Esto escribe el catálogo de ejemplo en PRODUCCIÓN. Si estás seguro, agregá --yes.')
    process.exit(1)
  }
  sembrar({ conUsuarios: !produccion }, { produccion })
    .then(() => {
      if (produccion) return console.log('✔ Catálogo de demo cargado en producción (sin usuarios).')
      console.log('✔ Seed de demo listo (emuladores). Usuarios DEMO (clave pública de demo):')
      for (const u of USUARIOS_DEMO) console.log(`  ${u.role.padEnd(10)} ${u.email}  /  ${CLAVE_DEMO}`)
    })
    .catch((e: unknown) => {
      console.error(`✖ ${e instanceof Error ? e.message : String(e)}`)
      process.exit(1)
    })
}
