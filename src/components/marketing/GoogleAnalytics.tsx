/**
 * graficasnasve.art — Carga GA4 solo tras consentimiento (Consent Mode v2).
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

'use client'

import { useEffect } from 'react'
import { gaMeasurementId, leerConsentimiento } from '@/lib/analytics/consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function cargarGtag(id: string): void {
  if (typeof window === 'undefined') return
  if (document.querySelector(`script[data-nasve-ga="${id}"]`)) return

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  // Consent Mode v2: denegado por defecto al arrancar el tag; luego analytics.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  })
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
  })
  window.gtag('js', new Date())
  window.gtag('config', id, { anonymize_ip: true })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  script.dataset.nasveGa = id
  document.head.appendChild(script)
}

/**
 * Suscribe a cambios de consentimiento (custom event) y carga el tag si ya
 * había aceptación previa. Sin ID configurado no hace nada.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    const id = gaMeasurementId()
    if (!id) return

    const sync = () => {
      if (leerConsentimiento() === 'accepted') {
        cargarGtag(id)
      }
    }

    sync()
    window.addEventListener('nasve-consent-change', sync)
    return () => window.removeEventListener('nasve-consent-change', sync)
  }, [])

  return null
}
