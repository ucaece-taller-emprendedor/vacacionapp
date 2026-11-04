import { expect, test } from '@playwright/test'
import { irA, unico } from './ayudas'

const ADMIN = { email: 'admin.demo@vacacionapp.test', password: 'DemoVacacion2026!' }

// Recorrido completo: prestador pendiente → admin aprueba → turista reserva → prestador ve la reserva.
test('flujo completo entre prestador, admin y turista', async ({ browser }) => {
  const sufijo = unico()
  const nombreServicio = `Cena frente al mar ${sufijo}`
  const prestador = await (await browser.newContext()).newPage()
  const turista = await (await browser.newContext()).newPage()
  const admin = await (await browser.newContext()).newPage()

  // 1. El prestador se registra y carga su comercio y un servicio: queda pendiente.
  await irA(prestador, '/app/registro?tipo=provider')
  await prestador.getByPlaceholder('Nombre').fill('Prestador Nuevo')
  await prestador.getByPlaceholder('Email').fill(`prestador.${sufijo}@example.com`)
  await prestador.getByPlaceholder(/Contraseña/).fill('clave-segura-123')
  await prestador.getByRole('button', { name: 'Registrarme' }).click()
  await expect(prestador).toHaveURL(/\/app\/prestador$/)
  await prestador.getByRole('link', { name: 'Sumar mi comercio' }).first().click()
  const comercio = `Parrilla ${sufijo}`
  const valores = [comercio, 'Gastronomía', 'Parrilla de ejemplo', 'Contacto', `contacto.${sufijo}@example.com`, '223 111-1111', 'Calle 123']
  const campos = prestador.locator('form input, form textarea')
  for (let i = 0; i < valores.length; i++) await campos.nth(i).fill(valores[i])
  await prestador.getByRole('button', { name: 'Enviar solicitud' }).click()
  await expect(prestador.getByText('Solicitud enviada')).toBeVisible()
  await prestador.getByRole('link', { name: 'Ir a mi panel' }).click()
  await expect(prestador.getByText('Estado: pendiente de revisión')).toBeVisible()
  await prestador.getByRole('button', { name: 'Mis servicios' }).click()
  await prestador.getByPlaceholder('Nombre del servicio').fill(nombreServicio)
  await prestador.getByLabel('Categoría').selectOption('Gastronomía')
  await prestador.getByPlaceholder('Descripción').fill('Cena de ejemplo para la prueba')
  await prestador.getByPlaceholder('Precio').fill('15000')
  await prestador.getByPlaceholder(/Unidad/).fill('por persona')
  await prestador.getByRole('button', { name: 'Guardar servicio' }).click()
  await expect(prestador.getByText('Servicio creado y guardado.')).toBeVisible()

  // 2. Mientras está pendiente, el servicio no aparece en el catálogo.
  await irA(turista, '/app/registro')
  await turista.getByPlaceholder('Nombre').fill('Turista Flujo')
  await turista.getByPlaceholder('Email').fill(`turista.${sufijo}@example.com`)
  await turista.getByPlaceholder(/Contraseña/).fill('clave-segura-123')
  await turista.getByRole('button', { name: 'Registrarme' }).click()
  await expect(turista).toHaveURL(/\/app\/cuenta$/)
  await irA(turista, '/explorar')
  await expect(turista.getByText('Carpa Premium')).toBeVisible()
  await expect(turista.getByText(nombreServicio)).toHaveCount(0)

  // 3. El admin aprueba el comercio.
  await irA(admin, '/admin/login')
  await admin.getByPlaceholder('Email').fill(ADMIN.email)
  await admin.getByPlaceholder('Contraseña').fill(ADMIN.password)
  await admin.getByRole('button', { name: 'Ingresar' }).click()
  await expect(admin).toHaveURL(/\/admin$/)
  await irA(admin, '/admin/comercios')
  const tarjeta = admin.locator('article', { hasText: comercio })
  await tarjeta.getByRole('button', { name: 'Aprobar' }).click()
  await expect(tarjeta.getByText('Estado: aprobado')).toBeVisible()

  // 4. El turista ve el servicio y lo reserva.
  await irA(turista, '/explorar')
  await turista.locator('article', { hasText: nombreServicio }).getByRole('button', { name: /Ver detalle/ }).click()
  await turista.locator('input[type=date]').first().fill('2027-03-10')
  await turista.getByRole('button', { name: 'Reservar ahora' }).click()
  await turista.getByLabel('Confirmo que los datos son correctos.').check()
  await turista.getByRole('button', { name: 'Confirmar y pagar' }).click()
  await expect(turista.getByRole('heading', { name: 'Reserva confirmada' })).toBeVisible()

  // 5. El prestador ve la reserva en su panel.
  await prestador.reload()
  await prestador.getByRole('button', { name: 'Reservas', exact: true }).click()
  await expect(prestador.getByText(nombreServicio)).toBeVisible()
})
