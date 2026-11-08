/**
 * graficasnasve.art — Claves de consentimiento de cookies / GA4.
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

export const CONSENT_STORAGE_KEY = 'nasve-cookie-consent'

export type Consentimiento = 'accepted' | 'rejected'

export function leerConsentimiento(): Consentimiento | null {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (v === 'accepted' || v === 'rejected') return v
  } catch {
    /* private mode */
  }
  return null
}

export function guardarConsentimiento(valor: Consentimiento): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, valor)
  } catch {
    /* private mode */
  }
}

/** Measurement ID de GA4 (vacío = sin analítica). */
export function gaMeasurementId(): string {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? ''
}
