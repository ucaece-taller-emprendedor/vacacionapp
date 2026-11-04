import type { Page } from '@playwright/test'

/** Navega y espera a que React hidrate la página (si no, un clic puede enviar el formulario "a mano"). */
export async function irA(page: Page, ruta: string) {
  await page.goto(ruta)
  await page.waitForLoadState('networkidle')
}

export const unico = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`
