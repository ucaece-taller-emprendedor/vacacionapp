import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { crearEntorno } from './ayuda'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await crearEntorno('demo-vacacionapp-reglas')
})
afterAll(async () => env.cleanup())

const comercio = (ownerId: string, status: string, name: string) => ({
  ownerId, name, category: 'Carpas y sombrillas', description: 'Comercio de prueba para las reglas', contactName: 'Contacto', email: `${ownerId}@test.com`,
  phone: '2230000000', address: 'Calle 123', city: 'Mar del Plata', province: 'Buenos Aires', status, isDemo: true, createdAt: new Date(),
})
const servicio = (ownerId: string, commerceName: string, extra: Record<string, unknown> = {}) => ({
  ownerId, commerceName, title: 'Carpa de prueba', description: 'Una carpa para las pruebas de reglas', category: 'Carpas y sombrillas', location: 'Playa Grande',
  price: 40000, unit: 'por día', rating: 4.5, reviews: 10, image: '/hero.webp', tag: 'Nuevo', duration: 'Día completo', includes: ['Carpa'], policy: 'Cancelación gratis.', active: true, isDemo: true, createdAt: new Date(), ...extra,
})

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore()
    const base = { isDemo: true, createdAt: new Date() }
    await setDoc(doc(db, 'users/turista1'), { ...base, email: 'turista1@test.com', displayName: 'Turista Uno', role: 'turista', status: 'activo' })
    await setDoc(doc(db, 'users/turista2'), { ...base, email: 'turista2@test.com', displayName: 'Turista Dos', role: 'turista', status: 'activo' })
    await setDoc(doc(db, 'users/prestador1'), { ...base, email: 'prestador1@test.com', displayName: 'Prestador Uno', role: 'prestador', status: 'activo' })
    await setDoc(doc(db, 'users/prestador2'), { ...base, email: 'prestador2@test.com', displayName: 'Prestador Dos', role: 'prestador', status: 'activo' })
    await setDoc(doc(db, 'users/pendiente1'), { ...base, email: 'pendiente1@test.com', displayName: 'Prestador Pend', role: 'prestador', status: 'pendiente' })
    await setDoc(doc(db, 'commerces/prestador1'), comercio('prestador1', 'aprobado', 'Balneario Uno'))
    await setDoc(doc(db, 'commerces/prestador2'), comercio('prestador2', 'aprobado', 'Balneario Dos'))
    await setDoc(doc(db, 'commerces/pendiente1'), comercio('pendiente1', 'pendiente', 'Comercio Pend'))
    await setDoc(doc(db, 'services/svc1'), servicio('prestador1', 'Balneario Uno'))
    await setDoc(doc(db, 'services/svc-inactivo'), servicio('prestador1', 'Balneario Uno', { active: false }))
    await setDoc(doc(db, 'services/svc-surf'), servicio('prestador2', 'Balneario Dos', { category: 'Actividades acuáticas', price: 30000, unit: 'por persona' }))
    await setDoc(doc(db, 'bookings/b1'), {
      userId: 'turista1', userName: 'Turista Uno', userEmail: 'turista1@test.com', serviceId: 'svc1', ownerId: 'prestador1', serviceTitle: 'Carpa de prueba', commerceName: 'Balneario Uno',
      location: 'Playa Grande', fromDate: '2027-01-10', toDate: '2027-01-11', people: 2, shift: 'Día completo', total: 40000, status: 'confirmada',
      payment: { metodo: 'Tarjeta', estado: 'simulado', monto: 40000 }, createdAt: new Date(),
    })
  })
})

const como = (uid: string, claims: Record<string, unknown> = {}) => env.authenticatedContext(uid, { email: `${uid}@test.com`, ...claims }).firestore()
const anonimo = () => env.unauthenticatedContext().firestore()
const admin = () => como('admin1', { admin: true })

describe('users', () => {
  it('registro: turista activo y prestador pendiente', async () => {
    await assertSucceeds(setDoc(doc(como('nuevo'), 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'turista', status: 'activo', isDemo: false, createdAt: serverTimestamp() }))
    await assertSucceeds(setDoc(doc(como('nuevo2'), 'users/nuevo2'), { email: 'nuevo2@test.com', displayName: 'Nuevo Dos', role: 'prestador', status: 'pendiente', isDemo: false, createdAt: serverTimestamp() }))
  })
  it('registro: un prestador NO puede crearse activo, ni nadie como admin', async () => {
    const db = como('nuevo')
    await assertFails(setDoc(doc(db, 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'prestador', status: 'activo', isDemo: false, createdAt: serverTimestamp() }))
    await assertFails(setDoc(doc(db, 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'admin', status: 'activo', isDemo: false, createdAt: serverTimestamp() }))
    await assertFails(setDoc(doc(db, 'users/nuevo'), { email: 'nuevo@test.com', displayName: 'Nuevo', role: 'turista', status: 'activo', isDemo: false, createdAt: serverTimestamp(), admin: true }))
  })
  it('registro: no se puede crear el perfil de otro uid', async () => {
    await assertFails(setDoc(doc(como('nuevo'), 'users/otro'), { email: 'nuevo@test.com', displayName: 'Otro', role: 'turista', status: 'activo', isDemo: false, createdAt: serverTimestamp() }))
  })
  it('un usuario NO puede escalar su rol ni su estado', async () => {
    const db = como('turista1')
    await assertFails(updateDoc(doc(db, 'users/turista1'), { role: 'admin' }))
    await assertFails(updateDoc(doc(db, 'users/turista1'), { role: 'prestador' }))
    await assertFails(updateDoc(doc(db, 'users/turista1'), { status: 'suspendido' }))
    await assertSucceeds(updateDoc(doc(db, 'users/turista1'), { displayName: 'Otro Nombre' }))
  })
  it('un prestador pendiente NO puede aprobarse solo', async () => {
    await assertFails(updateDoc(doc(como('pendiente1'), 'users/pendiente1'), { status: 'activo' }))
  })
  it('no lee perfiles ajenos ni lista usuarios; anónimo tampoco', async () => {
    await assertFails(getDoc(doc(como('turista1'), 'users/turista2')))
    await assertFails(getDoc(doc(anonimo(), 'users/turista1')))
    await assertFails(getDocs(collection(como('turista1'), 'users')))
    await assertSucceeds(getDoc(doc(como('turista1'), 'users/turista1')))
  })
  it('el admin (claim) lee todos y aprueba, pero no puede crear otro admin ni borrar', async () => {
    const db = admin()
    await assertSucceeds(getDocs(collection(db, 'users')))
    await assertSucceeds(updateDoc(doc(db, 'users/pendiente1'), { status: 'activo' }))
    await assertFails(updateDoc(doc(db, 'users/turista1'), { role: 'admin' }))
    await assertFails(deleteDoc(doc(db, 'users/turista1')))
  })
  it('role "admin" escrito en el documento SIN el claim no da poderes', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'users/falso'), { email: 'falso@test.com', displayName: 'Falso', role: 'admin', status: 'activo', isDemo: false, createdAt: new Date() }))
    await assertFails(getDocs(collection(como('falso'), 'users')))
    await assertFails(updateDoc(doc(como('falso'), 'commerces/prestador1'), { status: 'suspendido' }))
  })
})

describe('commerces', () => {
  const nuevoComercio = (uid: string, extra: Record<string, unknown> = {}) => ({ ...comercio(uid, 'pendiente', 'Nuevo Comercio'), isDemo: false, createdAt: serverTimestamp(), ...extra })

  it('un prestador pendiente puede cargar su comercio, solo como pendiente', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'users/nuevoprest'), { email: 'nuevoprest@test.com', displayName: 'Nuevo Prest', role: 'prestador', status: 'pendiente', isDemo: false, createdAt: new Date() }))
    const db = como('nuevoprest')
    await assertFails(setDoc(doc(db, 'commerces/nuevoprest'), nuevoComercio('nuevoprest', { status: 'aprobado' })))
    await assertSucceeds(setDoc(doc(db, 'commerces/nuevoprest'), nuevoComercio('nuevoprest')))
  })
  it('un turista no puede crear un comercio; nadie crea el comercio de otro', async () => {
    await assertFails(setDoc(doc(como('turista1'), 'commerces/turista1'), nuevoComercio('turista1')))
    await assertFails(setDoc(doc(como('pendiente1'), 'commerces/prestador2'), nuevoComercio('prestador2')))
  })
  it('el dueño edita datos pero NO su estado; el admin sí cambia el estado', async () => {
    await assertSucceeds(updateDoc(doc(como('prestador1'), 'commerces/prestador1'), { phone: '2231111111' }))
    await assertFails(updateDoc(doc(como('pendiente1'), 'commerces/pendiente1'), { status: 'aprobado' }))
    await assertFails(updateDoc(doc(como('prestador1'), 'commerces/prestador1'), { isDemo: false, ownerId: 'x' }))
    await assertSucceeds(updateDoc(doc(admin(), 'commerces/pendiente1'), { status: 'aprobado' }))
    await assertFails(updateDoc(doc(admin(), 'commerces/pendiente1'), { name: 'Cambiado por admin' }))
  })
  it('los datos de contacto no son públicos ni de otros prestadores', async () => {
    await assertFails(getDoc(doc(anonimo(), 'commerces/prestador1')))
    await assertFails(getDoc(doc(como('prestador2'), 'commerces/prestador1')))
    await assertSucceeds(getDoc(doc(como('prestador1'), 'commerces/prestador1')))
    await assertSucceeds(getDoc(doc(admin(), 'commerces/prestador1')))
  })
})

describe('services', () => {
  const nuevo = (uid: string, nombre: string, extra: Record<string, unknown> = {}) => ({ ...servicio(uid, nombre), rating: 0, reviews: 0, isDemo: false, createdAt: serverTimestamp(), ...extra })

  it('el catálogo activo es público; lo inactivo solo del dueño/admin', async () => {
    await assertSucceeds(getDocs(query(collection(anonimo(), 'services'), where('active', '==', true))))
    await assertFails(getDocs(collection(anonimo(), 'services')))
    await assertFails(getDoc(doc(como('turista1'), 'services/svc-inactivo')))
    await assertSucceeds(getDoc(doc(como('prestador1'), 'services/svc-inactivo')))
    await assertSucceeds(getDocs(collection(admin(), 'services')))
  })
  it('un prestador activo con comercio aprobado publica a su nombre', async () => {
    await assertSucceeds(setDoc(doc(como('prestador1'), 'services/nuevo'), nuevo('prestador1', 'Balneario Uno')))
  })
  it('un prestador PENDIENTE (comercio sin aprobar) no puede publicar', async () => {
    await assertFails(setDoc(doc(como('pendiente1'), 'services/nuevo'), nuevo('pendiente1', 'Comercio Pend')))
  })
  it('un prestador activo con comercio suspendido tampoco', async () => {
    await env.withSecurityRulesDisabled(async ctx => updateDoc(doc(ctx.firestore(), 'commerces/prestador1'), { status: 'suspendido' }))
    await assertFails(setDoc(doc(como('prestador1'), 'services/nuevo'), nuevo('prestador1', 'Balneario Uno')))
  })
  it('un turista no puede publicar; no se publica a nombre de otro ni con datos inválidos', async () => {
    await assertFails(setDoc(doc(como('turista1'), 'services/n1'), nuevo('turista1', 'X')))
    const db = como('prestador1')
    await assertFails(setDoc(doc(db, 'services/n2'), nuevo('prestador2', 'Balneario Dos')))
    await assertFails(setDoc(doc(db, 'services/n3'), nuevo('prestador1', 'Balneario Uno', { price: -5 })))
    await assertFails(setDoc(doc(db, 'services/n4'), nuevo('prestador1', 'Balneario Uno', { price: '100' })))
    await assertFails(setDoc(doc(db, 'services/n5'), nuevo('prestador1', 'Balneario Uno', { category: 'Inventada' })))
    await assertFails(setDoc(doc(db, 'services/n6'), nuevo('prestador1', 'Balneario Uno', { image: 'javascript:alert(1)' })))
    await assertFails(setDoc(doc(db, 'services/n7'), nuevo('prestador1', 'Balneario Uno', { rating: 5 })))
    await assertFails(setDoc(doc(db, 'services/n8'), nuevo('prestador1', 'Balneario Uno', { admin: true })))
    await assertFails(setDoc(doc(db, 'services/n9'), nuevo('prestador1', 'Otro Nombre')))
  })
  it('solo el dueño edita/borra; no puede tocar rating ni dueño', async () => {
    await assertFails(updateDoc(doc(como('prestador2'), 'services/svc1'), { title: 'Hackeado' }))
    await assertFails(deleteDoc(doc(como('turista1'), 'services/svc1')))
    await assertFails(updateDoc(doc(como('prestador1'), 'services/svc1'), { rating: 5 }))
    await assertFails(updateDoc(doc(como('prestador1'), 'services/svc1'), { ownerId: 'prestador2' }))
    await assertSucceeds(updateDoc(doc(como('prestador1'), 'services/svc1'), { price: 45000 }))
    await assertSucceeds(deleteDoc(doc(como('prestador1'), 'services/svc-inactivo')))
  })
  it('el admin solo activa/desactiva, y puede borrar', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'services/svc1'), { active: false }))
    await assertFails(updateDoc(doc(admin(), 'services/svc1'), { price: 1 }))
    await assertSucceeds(deleteDoc(doc(admin(), 'services/svc1')))
  })
})

describe('favorites', () => {
  it('el turista guarda y quita sus favoritos', async () => {
    const db = como('turista1')
    await assertSucceeds(setDoc(doc(db, 'favorites/turista1_svc1'), { userId: 'turista1', serviceId: 'svc1', createdAt: serverTimestamp() }))
    await assertSucceeds(getDoc(doc(db, 'favorites/turista1_svc1')))
    await assertSucceeds(getDocs(query(collection(db, 'favorites'), where('userId', '==', 'turista1'))))
    await assertSucceeds(deleteDoc(doc(db, 'favorites/turista1_svc1')))
  })
  it('no se escribe/lee el favorito de otro', async () => {
    await assertFails(setDoc(doc(como('turista1'), 'favorites/turista2_svc1'), { userId: 'turista2', serviceId: 'svc1', createdAt: serverTimestamp() }))
    await assertFails(setDoc(doc(como('turista1'), 'favorites/turista1_svc1'), { userId: 'turista1', serviceId: 'svc-otro', createdAt: serverTimestamp() }))
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'favorites/turista2_svc1'), { userId: 'turista2', serviceId: 'svc1', createdAt: new Date() }))
    await assertFails(getDoc(doc(como('turista1'), 'favorites/turista2_svc1')))
    await assertFails(deleteDoc(doc(como('turista1'), 'favorites/turista2_svc1')))
  })
})

describe('bookings', () => {
  const reserva = (extra: Record<string, unknown> = {}) => ({
    userId: 'turista1', userName: 'Turista Uno', userEmail: 'turista1@test.com', serviceId: 'svc-surf', ownerId: 'prestador2', serviceTitle: 'Carpa de prueba', commerceName: 'Balneario Dos',
    location: 'Playa Grande', fromDate: '2027-02-01', toDate: '2027-02-01', people: 3, shift: '09:00 · 2 h', total: 90000, status: 'confirmada',
    payment: { metodo: 'Mercado Pago', estado: 'simulado', monto: 90000 }, createdAt: serverTimestamp(), ...extra,
  })

  it('el turista reserva con el total correcto (por persona)', async () => {
    await assertSucceeds(setDoc(doc(como('turista1'), 'bookings/r1'), reserva()))
  })
  it('el total manipulado, el pago real o datos inconsistentes se rechazan', async () => {
    const db = como('turista1')
    await assertFails(setDoc(doc(db, 'bookings/r2'), reserva({ total: 1, payment: { metodo: 'Mercado Pago', estado: 'simulado', monto: 1 } })))
    await assertFails(setDoc(doc(db, 'bookings/r3'), reserva({ payment: { metodo: 'Mercado Pago', estado: 'aprobado', monto: 90000 } })))
    await assertFails(setDoc(doc(db, 'bookings/r4'), reserva({ ownerId: 'prestador1' })))
    await assertFails(setDoc(doc(db, 'bookings/r5'), reserva({ userId: 'turista2' })))
    await assertFails(setDoc(doc(db, 'bookings/r6'), reserva({ people: 0 })))
    await assertFails(setDoc(doc(db, 'bookings/r7'), reserva({ status: 'completada' })))
    await assertFails(setDoc(doc(db, 'bookings/r8'), reserva({ serviceId: 'svc-inactivo', ownerId: 'prestador1' })))
    await assertFails(setDoc(doc(db, 'bookings/r9'), reserva({ toDate: '2027-01-01' })))
  })
  it('una carpa se cobra por día (no por persona)', async () => {
    await assertSucceeds(setDoc(doc(como('turista1'), 'bookings/r10'), reserva({ serviceId: 'svc1', ownerId: 'prestador1', commerceName: 'Balneario Uno', people: 4, total: 40000, payment: { metodo: 'Tarjeta', estado: 'simulado', monto: 40000 } })))
  })
  it('un prestador o un anónimo no pueden reservar', async () => {
    await assertFails(setDoc(doc(como('prestador1'), 'bookings/r11'), reserva({ userId: 'prestador1', userName: 'Prestador Uno', userEmail: 'prestador1@test.com' })))
    await assertFails(setDoc(doc(anonimo(), 'bookings/r12'), reserva()))
  })
  it('lectura: el turista ve las suyas, el prestador las de su comercio, nadie las de otros', async () => {
    await assertSucceeds(getDoc(doc(como('turista1'), 'bookings/b1')))
    await assertSucceeds(getDoc(doc(como('prestador1'), 'bookings/b1')))
    await assertSucceeds(getDoc(doc(admin(), 'bookings/b1')))
    await assertFails(getDoc(doc(como('turista2'), 'bookings/b1')))
    await assertFails(getDoc(doc(como('prestador2'), 'bookings/b1')))
    await assertSucceeds(getDocs(query(collection(como('turista1'), 'bookings'), where('userId', '==', 'turista1'))))
    await assertSucceeds(getDocs(query(collection(como('prestador1'), 'bookings'), where('ownerId', '==', 'prestador1'))))
    await assertFails(getDocs(collection(como('turista1'), 'bookings')))
  })
  it('el turista solo puede cancelar la suya; no cambiar importes', async () => {
    await assertFails(updateDoc(doc(como('turista2'), 'bookings/b1'), { status: 'cancelada', cancelledAt: serverTimestamp() }))
    await assertFails(updateDoc(doc(como('turista1'), 'bookings/b1'), { total: 1 }))
    await assertFails(updateDoc(doc(como('turista1'), 'bookings/b1'), { status: 'completada' }))
    await assertSucceeds(updateDoc(doc(como('turista1'), 'bookings/b1'), { status: 'cancelada', cancelledAt: serverTimestamp() }))
  })
  it('el prestador dueño completa; otro prestador no', async () => {
    await assertFails(updateDoc(doc(como('prestador2'), 'bookings/b1'), { status: 'completada' }))
    await assertSucceeds(updateDoc(doc(como('prestador1'), 'bookings/b1'), { status: 'completada' }))
  })
  it('las reservas no se borran', async () => {
    await assertFails(deleteDoc(doc(como('turista1'), 'bookings/b1')))
    await assertFails(deleteDoc(doc(admin(), 'bookings/b1')))
  })
})

describe('general', () => {
  it('colecciones no declaradas están denegadas, incluso para el admin', async () => {
    await assertFails(setDoc(doc(admin(), 'otra/x'), { a: 1 }))
    await assertFails(getDoc(doc(admin(), 'otra/x')))
  })
})
