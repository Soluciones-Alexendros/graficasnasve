/**
 * graficasnasve.art — Banner de cookies accesible (Consent Mode v2).
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

'use client'

import { useEffect, useId, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  type Consentimiento,
  CONSENT_STORAGE_KEY,
  guardarConsentimiento,
  leerConsentimiento,
} from '@/lib/analytics/consent'

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const onChange = () => onStoreChange()
  window.addEventListener('nasve-consent-change', onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener('nasve-consent-change', onChange)
    window.removeEventListener('storage', onChange)
  }
}

function getSnapshot(): Consentimiento | null {
  return leerConsentimiento()
}

function getServerSnapshot(): Consentimiento | null {
  // En SSR no mostramos el banner (evita hydration mismatch).
  return 'rejected'
}

function emitirCambio(): void {
  window.dispatchEvent(new Event('nasve-consent-change'))
}

export function BannerCookies() {
  const tituloId = useId()
  const descId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const consentimiento = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const visible = consentimiento === null

  useEffect(() => {
    if (!visible) return
    const primerBoton = dialogRef.current?.querySelector<HTMLButtonElement>('button')
    primerBoton?.focus()
  }, [visible])

  function decidir(valor: Consentimiento) {
    guardarConsentimiento(valor)
    emitirCambio()
  }

  if (!visible) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={tituloId}
      aria-describedby={descId}
      data-consent-key={CONSENT_STORAGE_KEY}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-taupe bg-paper-50 p-4 shadow-[0_-8px_24px_rgba(26,26,23,0.12)] sm:p-5"
    >
      <div className="contenedor flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h2 id={tituloId} className="font-display text-lg font-bold text-key">
            Cookies y analítica
          </h2>
          <p id={descId} className="font-sans text-sm leading-relaxed text-gris">
            Usamos cookies esenciales para el sitio. La analítica (Google Analytics 4) solo se activa si aceptas. Puedes
            rechazar sin perder el uso del sitio.{' '}
            <Link href="/cookies" className="underline underline-offset-2 hover:text-key">
              Política de cookies
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => decidir('rejected')}
            className="rounded-card border border-key px-4 py-2.5 font-sans text-sm font-medium text-key transition-colors hover:bg-paper-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => decidir('accepted')}
            className="rounded-card border border-key bg-key px-4 py-2.5 font-sans text-sm font-medium text-paper-50 transition-colors hover:bg-negro focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
