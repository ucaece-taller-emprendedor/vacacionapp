/**
 * Datos de DEMO para clase. No es parte de la app real.
 * Uso: npm run db:seed:demo   (si la base no es local, agregá -- --yes)
 * Es idempotente: se puede correr varias veces sin duplicar nada.
 */
import 'dotenv/config'
import { hashPassword } from 'better-auth/crypto'
import { sql } from 'drizzle-orm'
import { db, pool } from '@/lib/db'
import { account, booking, commerce, payment, service, user } from '@/lib/db/schema'
import { env } from '@/lib/env'

const DEMO_PASSWORD = 'DemoVacacion2026!'
const IMG = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com'

const usuariosDemo = [
  { id: 'demo-user-turista', name: 'Turista Demo', email: 'turista.demo@vacacionapp.test', role: 'client' },
  { id: 'demo-user-prestador', name: 'Prestador Demo', email: 'prestador.demo@vacacionapp.test', role: 'provider' },
  { id: 'demo-user-pendiente', name: 'Prestador Pendiente Demo', email: 'pendiente.demo@vacacionapp.test', role: 'provider' },
  { id: 'demo-user-admin', name: 'Admin Demo', email: 'admin.demo@vacacionapp.test', role: 'admin' },
]

const comercio = (id: string, ownerId: string, name: string, category: string, status = 'approved') => ({
  id,
  ownerId,
  name,
  category,
  description: `${name}: comercio de ejemplo (datos de demo, no es un comercio real).`,
  contactName: 'Contacto Demo',
  email: `${id}@vacacionapp.test`,
  phone: '223 000-0000',
  address: 'Dirección de ejemplo 123',
  city: 'Mar del Plata',
  province: 'Buenos Aires',
  status,
  demo: true,
})

type ServicioSeed = {
  id: string
  commerceId: string
  title: string
  location: string
  price: number
  unit: string
  rating: number
  reviews: number
  image: string
  tag: string
  duration: string
  category: string
  description: string
  includes: string[]
  policy: string
}

const comercios = [
  comercio('demo-balneario-alfonsina', 'demo-user-prestador', 'Balneario Alfonsina', 'Carpas y sombrillas'),
  comercio('demo-torreon-del-monje', 'demo-owner-torreon', 'Torreón del Monje', 'Carpas y sombrillas'),
  comercio('demo-balneario-23', 'demo-owner-balneario-23', 'Balneario 23 de Punta Mogotes', 'Carpas y sombrillas'),
  comercio('demo-plenara-surf', 'demo-owner-plenara', 'Plenara Surf School', 'Actividades acuáticas'),
  comercio('demo-nautilus-mdp', 'demo-owner-nautilus', 'Nautilus MDP', 'Actividades acuáticas'),
  comercio('demo-alma-spa', 'demo-owner-alma', 'Alma Spa & Wellness', 'Bienestar y spa'),
  comercio('demo-viento-en-popa', 'demo-owner-viento', 'Restó Viento en Popa', 'Gastronomía'),
  comercio('demo-balneario-12', 'demo-owner-balneario-12', 'Balneario 12 de Punta Mogotes', 'Carpas y sombrillas'),
  comercio('demo-mdq-water-club', 'demo-owner-mdq', 'MDQ Water Club', 'Actividades acuáticas'),
  comercio('demo-espacio-varese', 'demo-owner-varese', 'Espacio Varese Wellness', 'Bienestar y spa'),
  comercio('demo-la-perla-del-mar', 'demo-owner-perla', 'Local La Perla del Mar', 'Gastronomía'),
  // Pendiente: sirve para mostrar cómo el admin aprueba un comercio en clase.
  comercio('demo-sol-y-arena', 'demo-user-pendiente', 'Sol y Arena (pendiente)', 'Carpas y sombrillas', 'pending'),
]

const servicios: ServicioSeed[] = [
  { id: 'demo-carpa-premium', commerceId: 'demo-balneario-alfonsina', title: 'Carpa Premium', location: 'Playa Grande', price: 45000, unit: 'por día', rating: 4.9, reviews: 128, image: `${IMG}/balneario%20alfonsina-tmtgXmM00TjCqMbkMQCV6Cb3XHjLCV.png`, tag: 'Más reservado', duration: 'Día completo', category: 'Carpas y sombrillas', description: 'Espacio exclusivo frente al mar con sombra, seguridad y atención personalizada.', includes: ['Carpa', '2 reposeras', 'Mesa auxiliar'], policy: 'Cancelación gratis hasta 24 h antes.' },
  { id: 'demo-carpa-familiar-cubierta', commerceId: 'demo-torreon-del-monje', title: 'Carpa familiar cubierta', location: 'Varese', price: 39000, unit: 'por día', rating: 4.8, reviews: 74, image: `${IMG}/torreon%20del%20monje-Rf3gFLPgaUUiGj2ZJhwqaiZT3wP9Nb.jpg`, tag: 'Familiar', duration: 'Día completo', category: 'Carpas y sombrillas', description: 'Carpa amplia para disfrutar la playa en familia con mesa y reposeras.', includes: ['Carpa cubierta', '4 reposeras', 'Baulera'], policy: 'Reprogramación según clima.' },
  { id: 'demo-sombrilla-2-reposeras', commerceId: 'demo-balneario-23', title: 'Sombrilla + 2 reposeras', location: 'La Perla', price: 22000, unit: 'por día', rating: 4.8, reviews: 97, image: `${IMG}/baneario%2023-9TlZg50MrEnJpMsziRyj40i1Tv1U8m.jpeg`, tag: 'Oferta', duration: 'Día completo', category: 'Carpas y sombrillas', description: 'La opción simple para instalarte en la playa sin preocuparte por nada.', includes: ['Sombrilla', '2 reposeras', 'Atención en playa'], policy: 'Cancelación gratis hasta 24 h antes.' },
  { id: 'demo-clase-surf-inicial', commerceId: 'demo-plenara-surf', title: 'Clase de surf inicial', location: 'Varese', price: 32000, unit: 'por persona', rating: 4.8, reviews: 86, image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=900&q=80', tag: 'Cupos limitados', duration: '2 horas', category: 'Actividades acuáticas', description: 'Aprendé a surfear con instructores certificados y equipamiento incluido.', includes: ['Tabla', 'Instructor', 'Seguro'], policy: 'Reprogramación por clima.' },
  { id: 'demo-paseo-en-kayak', commerceId: 'demo-nautilus-mdp', title: 'Paseo en kayak', location: 'Playa Grande', price: 28000, unit: 'por persona', rating: 4.7, reviews: 64, image: `${IMG}/paseo%20en%20kayak-J1qb3oS5GxDLw3joJjh14qV04YRwn2.jpeg`, tag: 'Nuevo', duration: '2 horas', category: 'Actividades acuáticas', description: 'Una aventura costera tranquila para descubrir la bahía desde el agua.', includes: ['Kayak', 'Chaleco', 'Guía'], policy: 'Reprogramación por clima.' },
  { id: 'demo-masaje-frente-al-mar', commerceId: 'demo-alma-spa', title: 'Masaje frente al mar', location: 'Playa Grande', price: 38000, unit: 'por sesión', rating: 5, reviews: 42, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=80', tag: 'Mejor valorado', duration: '60 minutos', category: 'Bienestar y spa', description: 'Sesión de relajación profunda con sonido de olas.', includes: ['Masaje 60 min', 'Aromaterapia', 'Sala privada'], policy: 'Cancelación gratis hasta 24 h antes.' },
  { id: 'demo-almuerzo-vista-al-mar', commerceId: 'demo-viento-en-popa', title: 'Almuerzo con vista al mar', location: 'Puerto', price: 24500, unit: 'por persona', rating: 4.6, reviews: 213, image: `${IMG}/almuerzo%20vista%20al%20mar-FAL6uEP1Zuy7CkkRJzKTuYiPlnpQ7f.jpg`, tag: 'Imperdible', duration: 'A elección', category: 'Gastronomía', description: 'Sabores frescos, productos locales y una vista privilegiada del puerto.', includes: ['Menú de 3 pasos', 'Bebida', 'Vista al mar'], policy: 'Cancelación hasta 12 h antes.' },
  { id: 'demo-carpa-clasica', commerceId: 'demo-balneario-12', title: 'Carpa clásica', location: 'Playa Grande', price: 34000, unit: 'por día', rating: 4.7, reviews: 58, image: `${IMG}/balneario%2012-62REl5TUKx8w06wJwcXwWKOwhbopAB.jpg`, tag: 'Nuevo', duration: 'Día completo', category: 'Carpas y sombrillas', description: 'Sombra y comodidad a metros del mar.', includes: ['Carpa', '2 reposeras', 'Mesa'], policy: 'Reprogramación según clima.' },
  { id: 'demo-clase-paddle-surf', commerceId: 'demo-mdq-water-club', title: 'Clase de paddle surf', location: 'Playa Grande', price: 36000, unit: 'por persona', rating: 4.8, reviews: 39, image: `${IMG}/paddel%20surf-u8qqLnNBZkc31wj1Emnf3KMTfjN92W.jpg`, tag: 'Nuevo', duration: '2 horas', category: 'Actividades acuáticas', description: 'Introducción al paddle surf con instructor y equipo.', includes: ['Tabla', 'Instructor', 'Chaleco'], policy: 'Reprogramación por clima.' },
  { id: 'demo-yoga-y-respiracion', commerceId: 'demo-espacio-varese', title: 'Yoga y respiración', location: 'Varese', price: 18000, unit: 'por persona', rating: 4.9, reviews: 31, image: `${IMG}/clase%20de%20yoga-rufFT4L5migzXKRQUIBK0vopOB5zxQ.jpeg`, tag: 'Bienestar', duration: '60 minutos', category: 'Bienestar y spa', description: 'Una práctica suave para empezar el día frente al mar.', includes: ['Clase', 'Mat', 'Infusión'], policy: 'Cancelación hasta 12 h antes.' },
  { id: 'demo-cena-de-mariscos', commerceId: 'demo-la-perla-del-mar', title: 'Cena de mariscos', location: 'La Perla', price: 32000, unit: 'por persona', rating: 4.7, reviews: 76, image: `${IMG}/cena%20de%20mariscos-EkwSt3IL6UOFQC2uBb7Dgs9CnsBqIu.jpg`, tag: 'Nuevo', duration: 'A elección', category: 'Gastronomía', description: 'Cocina de mar con productos frescos de la costa.', includes: ['Menú degustación', 'Bebida', 'Mesa reservada'], policy: 'Cancelación hasta 12 h antes.' },
]

async function main() {
  const host = new URL(env.DATABASE_URL).hostname
  const esLocal = ['localhost', '127.0.0.1', '::1'].includes(host)
  if (!esLocal && !process.argv.includes('--yes')) {
    console.error(`La base (${host}) no es local. Los datos de demo incluyen usuarios con contraseña pública.\nSi estás seguro, corré: npm run db:seed:demo -- --yes`)
    process.exit(1)
  }

  const ahora = Date.now()
  const hash = await hashPassword(DEMO_PASSWORD)

  // Usuarios que pueden ingresar (con contraseña) y titulares de comercios de ejemplo (sin acceso).
  const titulares = comercios
    .filter(c => c.ownerId.startsWith('demo-owner-'))
    .map(c => ({ id: c.ownerId, name: `Titular de ${c.name}`, email: `${c.ownerId}@vacacionapp.test`, role: 'provider' }))
  for (const u of [...usuariosDemo, ...titulares]) {
    await db.insert(user).values({ ...u, emailVerified: true, demo: true }).onConflictDoNothing()
  }
  for (const u of usuariosDemo) {
    await db.insert(account).values({ id: `${u.id}-credential`, accountId: u.id, providerId: 'credential', userId: u.id, password: hash }).onConflictDoNothing()
  }

  await db.insert(commerce).values(comercios).onConflictDoNothing()
  await db
    .insert(service)
    .values(servicios.map((s, i) => ({ ...s, demo: true, createdAt: new Date(ahora + i * 1000) })))
    .onConflictDoNothing()

  // Una reserva de ejemplo del turista demo en el comercio del prestador demo (pago simulado).
  const reserva = servicios[0]
  await db
    .insert(booking)
    .values({ id: 'demo-reserva-1', userId: 'demo-user-turista', serviceId: reserva.id, commerceId: reserva.commerceId, serviceTitle: reserva.title, provider: 'Balneario Alfonsina', location: reserva.location, fromDate: '2027-01-15', toDate: '2027-01-16', people: 2, shift: 'Día completo', total: reserva.price, status: 'confirmed' })
    .onConflictDoNothing()
  await db.insert(payment).values({ id: 'demo-pago-1', userId: 'demo-user-turista', bookingId: 'demo-reserva-1', amount: reserva.price, method: 'Mercado Pago', status: 'simulated' }).onConflictDoNothing()

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(service)
  console.log(`Seed de demo listo. Servicios en la base: ${total}.`)
  console.log('Usuarios de demo (contraseña de todos: ver README):')
  for (const u of usuariosDemo) console.log(`  ${u.role.padEnd(8)} ${u.email}`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
