import { test, expect } from '@playwright/test'

// No usa el fixture por defecto: ese siembra consent=rejected y ocultaría el banner.
const GOOGLE_HOST = /google-analytics\.com|googletagmanager\.com|google\.com\/ccm|www\.google\.com\/ads/

test.describe('consentimiento GA4', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
    await context.addInitScript(() => {
      try {
        window.localStorage.removeItem('nasve-cookie-consent')
        // Evita que el tour tape el banner sin marcar consentimiento.
        window.localStorage.setItem('nasve:tour-visto:v1', '1')
      } catch {
        /* ignore */
      }
    })
  })

  test('sin aceptar no hay peticiones a Google Analytics', async ({ page }) => {
    const googleHits: string[] = []
    page.on('request', (req) => {
      if (GOOGLE_HOST.test(req.url())) googleHits.push(req.url())
    })

    await page.goto('/')
    await expect(page.getByRole('dialog', { name: /cookies y analítica/i })).toBeVisible()
    await page.waitForTimeout(800)
    expect(googleHits, `Peticiones inesperadas: ${googleHits.join(', ')}`).toEqual([])
  })

  test('tras rechazar sigue sin peticiones a Google', async ({ page }) => {
    const googleHits: string[] = []
    page.on('request', (req) => {
      if (GOOGLE_HOST.test(req.url())) googleHits.push(req.url())
    })

    await page.goto('/')
    await expect(page.getByRole('dialog', { name: /cookies y analítica/i })).toBeVisible()
    await page.getByRole('button', { name: /^rechazar$/i }).click()
    await expect(page.getByRole('dialog', { name: /cookies y analítica/i })).toHaveCount(0)
    await page.waitForTimeout(800)
    expect(googleHits).toEqual([])
  })

  test('tras aceptar se solicita gtag', async ({ page }) => {
    const gtagPromise = page.waitForRequest((req) => /googletagmanager\.com\/gtag\/js/.test(req.url()), {
      timeout: 10_000,
    })

    await page.goto('/')
    await expect(page.getByRole('dialog', { name: /cookies y analítica/i })).toBeVisible()
    await page.getByRole('button', { name: /^aceptar$/i }).click()
    const req = await gtagPromise
    expect(req.url()).toMatch(/G-TEST000000/)
  })
})
