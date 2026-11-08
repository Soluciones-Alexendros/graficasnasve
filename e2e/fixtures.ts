import { test as base, expect } from '@playwright/test'

// Fixture por defecto para los E2E que NO prueban tour ni consentimiento:
// - tour visto → driver.js no se autolanza ni intercepta clics
// - cookies rechazadas → el banner no tapa el botón flotante del tour
export const test = base.extend({
  page: async ({ page }, run) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('nasve:tour-visto:v1', '1')
        window.localStorage.setItem('nasve-cookie-consent', 'rejected')
      } catch {
        /* almacenamiento no disponible en este contexto */
      }
    })
    await run(page)
  },
})

export { expect }
