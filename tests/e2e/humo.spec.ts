import { expect, test, type Page } from '@playwright/test'

const CLAVE = 'Demo-Clave-2026'

async function ingresar(page: Page, email: string, ruta = '/app/ingresar') {
  await page.goto(ruta)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
}

async function registrar(page: Page, { nombre, email, tipo }: { nombre: string; email: string; tipo: RegExp }) {
  await page.goto('/app/registro')
  await page.getByLabel(tipo).check()
  await page.getByLabel('Nombre').fill(nombre)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Registrarme' }).click()
}

test('la landing pública se ve con sus llamados a la acción', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Organizá tus vacaciones')
  await expect(page.getByRole('link', { name: 'Ingresar' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Registrarme' }).first()).toBeVisible()
  await expect(page.getByText('El problema')).toBeVisible()
})

test('el catálogo público lista los servicios de demo y filtra', async ({ page }) => {
  await page.goto('/explorar')
  const tarjetas = page.getByTestId('servicio-card')
  await expect(tarjetas.first()).toBeVisible()
  expect(await tarjetas.count()).toBeGreaterThanOrEqual(11) // otros tests pueden haber publicado más
  await page.getByLabel('Categoría').selectOption('Gastronomía')
  await expect(page.getByRole('link', { name: 'Cena de mariscos' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Clase de paddle surf' })).toHaveCount(0)
})

test('registro de un turista, sesión persistente y nuevo login', async ({ page }, info) => {
  const email = `turista.${info.project.name}.${Date.now()}@vacacionapp.test`
  await registrar(page, { nombre: 'Turista Nuevo', email, tipo: /Turista/ })
  await expect(page).toHaveURL(/\/app\/turista$/)
  await expect(page.getByRole('heading', { name: /Hola, Turista Nuevo/ })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: /Hola, Turista Nuevo/ })).toBeVisible()
  await page.getByRole('button', { name: 'Salir' }).click()
  await ingresar(page, email)
  await expect(page).toHaveURL(/\/app\/turista$/)
})

test('un turista reserva un servicio con pago simulado', async ({ page }) => {
  await ingresar(page, 'turista.demo@vacacionapp.test')
  await expect(page).toHaveURL(/\/app\/turista$/)
  await page.goto('/explorar')
  await page.getByRole('link', { name: 'Clase de paddle surf' }).click()
  await page.getByLabel('Personas').fill('3')
  await expect(page.getByText('$108.000')).toBeVisible() // 36.000 × 3
  await page.getByRole('button', { name: 'Reservar' }).click()
  await expect(page).toHaveURL(/\/app\/reservar\//)
  await expect(page.getByRole('note')).toContainText('Pago simulado')
  await page.getByLabel('Confirmo que los datos son correctos.').check()
  await page.getByRole('button', { name: /Confirmar reserva/ }).click()
  await expect(page.getByRole('heading', { name: '¡Reserva confirmada!' })).toBeVisible()
  await page.getByRole('link', { name: 'Ver mis reservas' }).click()
  await expect(page.getByTestId('reserva-fila').filter({ hasText: 'Clase de paddle surf' })).toBeVisible()
})

test('favoritos: guardar y ver en el panel', async ({ page }, info) => {
  const titulo = info.project.name === 'movil' ? 'Cena de mariscos' : 'Almuerzo con vista al mar'
  await ingresar(page, 'turista.demo@vacacionapp.test')
  await expect(page).toHaveURL(/\/app\/turista$/)
  await page.goto('/explorar')
  await page.getByRole('button', { name: `Guardar ${titulo} en favoritos` }).click()
  await expect(page.getByRole('button', { name: `Quitar ${titulo} de favoritos` })).toBeVisible() // espera a que Firestore confirme
  await page.goto('/app/turista/favoritos')
  await expect(page.getByRole('link', { name: titulo })).toBeVisible()
})

test('prestador nuevo queda pendiente, el admin aprueba y recién entonces publica', async ({ page }, info) => {
  const stamp = `${info.project.name}${Date.now()}`
  const email = `prestador.${stamp}@vacacionapp.test`
  await registrar(page, { nombre: 'Prestador Nuevo', email, tipo: /Prestador/ })
  await expect(page).toHaveURL(/\/app\/prestador$/)
  await expect(page.getByText(/Todavía no cargaste tu comercio/)).toBeVisible()

  await page.getByRole('link', { name: 'Mi comercio' }).click()
  await page.getByLabel('Nombre del comercio').fill(`Comercio ${stamp}`)
  await page.getByLabel('Categoría').selectOption('Gastronomía')
  await page.getByLabel('Descripción').fill('Un comercio de prueba para los tests de humo.')
  await page.getByLabel('Persona de contacto').fill('Contacto Test')
  await page.getByLabel('Email de contacto').fill(email)
  await page.getByLabel('Teléfono').fill('2231234567')
  await page.getByLabel('Dirección').fill('Calle Falsa 123')
  await page.getByRole('button', { name: 'Enviar para aprobación' }).click()
  await expect(page.getByText(/pendiente de aprobación/)).toBeVisible()
  await page.getByRole('link', { name: 'Mis servicios' }).click()
  await expect(page.getByText(/cuando tu comercio esté aprobado/)).toBeVisible()
  await page.getByRole('button', { name: 'Salir' }).click()

  await ingresar(page, 'admin.demo@vacacionapp.test', '/admin/login')
  await expect(page).toHaveURL(/\/admin$/)
  await page.getByRole('link', { name: 'Comercios' }).click()
  await page.getByTestId(`comercio-Comercio ${stamp}`).getByRole('button', { name: 'Aprobar' }).click()
  await expect(page.getByTestId(`comercio-Comercio ${stamp}`).getByText('aprobado', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Salir' }).click()

  await ingresar(page, email)
  await page.getByRole('link', { name: 'Mis servicios' }).click()
  await page.getByRole('button', { name: 'Nuevo servicio' }).click()
  await page.getByLabel('Título').fill(`Servicio ${stamp}`)
  await page.getByLabel('Descripción').fill('Descripción del servicio de prueba para el humo.')
  await page.getByLabel('Categoría').selectOption('Gastronomía')
  await page.getByLabel('Zona').selectOption('Puerto')
  await page.getByLabel('Precio (ARS)').fill('15000')
  await page.getByLabel('Qué incluye (uno por línea)').fill('Entrada\nPlato principal')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByTestId('mi-servicio').filter({ hasText: `Servicio ${stamp}` })).toBeVisible()
  await page.goto('/explorar')
  await expect(page.getByRole('link', { name: `Servicio ${stamp}` })).toBeVisible()
})

test('el formulario del prestador valida con Zod antes de enviar', async ({ page }, info) => {
  await registrar(page, { nombre: 'Prestador Zod', email: `zod.${info.project.name}.${Date.now()}@vacacionapp.test`, tipo: /Prestador/ })
  await page.getByRole('link', { name: 'Mi comercio' }).click()
  await page.getByRole('button', { name: 'Enviar para aprobación' }).click()
  await expect(page.getByText('Elegí una categoría.')).toBeVisible()
  await expect(page.getByText('Ingresá un email válido.')).toBeVisible()
})

test('login de admin; un usuario común no entra al panel', async ({ page }) => {
  await ingresar(page, 'turista.demo@vacacionapp.test', '/admin/login')
  await expect(page.getByText('no tiene permisos de administrador')).toBeVisible()
  await page.getByLabel('Email').fill('admin.demo@vacacionapp.test')
  await page.getByLabel('Contraseña').fill(CLAVE)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Administración' })).toBeVisible()
  await page.getByRole('link', { name: 'Usuarios' }).click()
  await expect(page.getByTestId('usuario-turista.demo@vacacionapp.test')).toBeVisible()
})

test('/admin sin sesión manda al login y /app/prestador exige rol', async ({ page }) => {
  await page.goto('/admin/usuarios')
  await expect(page).toHaveURL(/\/admin\/login$/)
  await ingresar(page, 'turista.demo@vacacionapp.test')
  await expect(page).toHaveURL(/\/app\/turista$/)
  await page.goto('/app/prestador')
  await expect(page).toHaveURL(/\/app\/turista$/)
})
