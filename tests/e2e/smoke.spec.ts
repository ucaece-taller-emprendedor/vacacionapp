import { expect, test } from '@playwright/test'
import { irA, unico } from './ayudas'

// Credenciales de DEMO definidas en scripts/seed-demo.ts (no son datos reales).
const ADMIN = { email: 'admin.demo@vacacionapp.test', password: 'DemoVacacion2026!' }

test('la landing pública muestra el mensaje y los botones de acceso', async ({ page }) => {
  await irA(page, '/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Organizá tus vacaciones')
  await expect(page.getByRole('link', { name: 'Ingresar' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Registrarme' }).first()).toBeVisible()
  await expect(page.getByText('El problema')).toBeVisible()
})

test('un turista se registra, cierra sesión y vuelve a ingresar', async ({ page }) => {
  const email = `turista.${unico()}@example.com`
  const password = 'clave-segura-123'

  await irA(page, '/app/registro')
  await page.getByPlaceholder('Nombre').fill('Turista de Prueba')
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder(/Contraseña/).fill(password)
  await page.getByRole('button', { name: 'Registrarme' }).click()
  await expect(page).toHaveURL(/\/app\/cuenta$/)
  await expect(page.getByRole('heading', { name: 'Mi cuenta' })).toBeVisible()

  await page.getByRole('button', { name: 'Cerrar sesión' }).first().click()
  await expect(page).toHaveURL('/')

  await irA(page, '/app/ingresar')
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder(/Contraseña/).fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL(/\/app\/cuenta$/)
})

test('el panel de administración exige ser admin y deja entrar al admin de demo', async ({ page }) => {
  await irA(page, '/admin')
  await expect(page).toHaveURL(/\/admin\/login$/)
  await expect(page.getByRole('link', { name: /registr/i })).toHaveCount(0)

  await page.getByPlaceholder('Email').fill(ADMIN.email)
  await page.getByPlaceholder('Contraseña').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible()
})

test('un turista no puede entrar al panel de administración', async ({ page }) => {
  await irA(page, '/app/registro')
  await page.getByPlaceholder('Nombre').fill('Turista Curioso')
  await page.getByPlaceholder('Email').fill(`curioso.${unico()}@example.com`)
  await page.getByPlaceholder(/Contraseña/).fill('clave-segura-123')
  await page.getByRole('button', { name: 'Registrarme' }).click()
  await expect(page).toHaveURL(/\/app\/cuenta$/)

  await irA(page, '/admin')
  await expect(page).not.toHaveURL(/\/admin$/)
  const respuesta = await page.request.get('/api/admin/session')
  expect(respuesta.status()).toBe(403)
})
