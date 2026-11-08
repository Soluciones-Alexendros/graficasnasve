import { defineConfig, devices } from '@playwright/test'

// Configuración de Playwright para Next.js 16.
// Guía: node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md
// Los E2E se ejecutan contra el build de producción (`pnpm start`) y no
// requieren secretos: cubren home, validación del formulario y el guard de
// /admin (que sin Supabase redirige a /admin/login).
const PORT = 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // En CI el build se hace en un paso previo; en local se construye al vuelo.
    // ID de prueba para e2e de consentimiento (se inlinea en el build; no es prod).
    // En local usamos el binario de Next (evita fallos de pnpm si el workspace
    // solo tiene overrides). En CI el job ya hizo `pnpm build` y arranca con pnpm.
    command: process.env.CI ? 'pnpm start' : './node_modules/.bin/next build && ./node_modules/.bin/next start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-TEST000000',
    },
  },
})
