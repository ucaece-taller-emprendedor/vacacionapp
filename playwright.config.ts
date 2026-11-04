import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.E2E_PORT ?? 3010)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure', locale: 'es-AR' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Levanta la app contra la base de DATABASE_URL (migrada y con el seed de demo ya cargado).
  webServer: {
    command: `npx next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { BETTER_AUTH_URL: baseURL },
  },
})
