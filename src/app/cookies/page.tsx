/**
 * graficasnasve.art
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */

import type { Metadata } from 'next'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = {
  title: 'Política de Cookies — Gráficas NASVE',
  description: 'Política de cookies del sitio web de Gráficas NASVE, S.L.',
  robots: { index: false, follow: false },
}

interface CookieInfo {
  nombre: string
  proveedor: string
  finalidad: string
  duracion: string
  tipo: 'esencial' | 'analitica' | 'terceros'
}

const cookies: CookieInfo[] = [
  {
    nombre: 'sb-*-auth-token',
    proveedor: 'Supabase (NASVE)',
    finalidad: 'Gestión de sesión autenticada en el panel de administración',
    duracion: 'Sesión',
    tipo: 'esencial',
  },
  {
    nombre: '_ga, _ga_*',
    proveedor: 'Google Analytics 4',
    finalidad: 'Análisis estadístico del tráfico web (páginas visitadas, tiempo de sesión)',
    duracion: '2 años',
    tipo: 'analitica',
  },
  {
    nombre: '__stripe_*',
    proveedor: 'Stripe',
    finalidad: 'Prevención del fraude en transacciones de pago',
    duracion: 'Sesión',
    tipo: 'terceros',
  },
]

const tipoCookie = {
  esencial: { etiqueta: 'Esencial', color: 'bg-negro/10 text-negro' },
  analitica: { etiqueta: 'Analítica', color: 'bg-ambar/20 text-ambar-700' },
  terceros: { etiqueta: 'Terceros', color: 'bg-fondo-alt text-gris' },
}

export default function PaginaCookies() {
  return (
    <div className="py-24">
      <div className="contenedor max-w-3xl">
        <SectionLabel>Legal</SectionLabel>
        <h1 className="mt-4 font-display font-extrabold text-4xl text-key mb-8">Política de Cookies</h1>
        <p className="font-mono text-xs text-gris mb-12">Última actualización: enero de 2026</p>

        <div className="space-y-10">
          {/* Qué son las cookies */}
          <section>
            <h2 className="font-display text-2xl font-bold text-negro mb-4">¿Qué son las cookies?</h2>
            <p className="font-sans text-base text-gris leading-relaxed">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.
              Nos permiten recordar tus preferencias, analizar el tráfico de forma anónima y, en algunos casos,
              habilitar funcionalidades de terceros. Puedes controlar y eliminar las cookies a través de la
              configuración de tu navegador.
            </p>
          </section>

          {/* Tipos de cookies */}
          <section>
            <h2 className="font-display text-2xl font-bold text-negro mb-6">Cookies que utilizamos</h2>

            {/* Esenciales */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-sans font-semibold text-negro">Cookies esenciales</h3>
                <span className="font-mono text-xs uppercase tracking-wide px-2 py-0.5 bg-negro/10 text-negro">
                  Siempre activas
                </span>
              </div>
              <p className="font-sans text-sm text-gris leading-relaxed mb-4">
                Son necesarias para el funcionamiento básico del sitio web y no pueden desactivarse. No almacenan
                información de identificación personal.
              </p>
            </div>

            {/* Analíticas */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-sans font-semibold text-negro">Cookies analíticas</h3>
                <span className="font-mono text-xs uppercase tracking-wide px-2 py-0.5 bg-ambar/20 text-ambar-700">
                  Solo con consentimiento
                </span>
              </div>
              <p className="font-sans text-sm text-gris leading-relaxed mb-4">
                Utilizamos Google Analytics 4 para comprender cómo los visitantes interactúan con el sitio web. La
                información se recopila de forma anónima y agregada. El script de Google no se carga hasta que aceptas
                en el banner (Consent Mode v2); si rechazas, no hay peticiones a Google Analytics.
              </p>
            </div>

            {/* Terceros */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-sans font-semibold text-negro">Cookies de terceros</h3>
                <span className="font-mono text-xs uppercase tracking-wide px-2 py-0.5 bg-fondo-alt text-gris">
                  Solo en tienda
                </span>
              </div>
              <p className="font-sans text-sm text-gris leading-relaxed mb-4">
                Stripe utiliza cookies para la prevención del fraude en los procesos de pago. Solo se activan cuando se
                realizan transacciones online.
              </p>
            </div>

            {/* Tabla de cookies */}
            <div className="overflow-x-auto border border-borde">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-fondo-alt border-b border-borde">
                    <th className="text-left py-3 px-4 font-mono text-xs text-gris uppercase tracking-wide">Cookie</th>
                    <th className="text-left py-3 px-4 font-mono text-xs text-gris uppercase tracking-wide">
                      Proveedor
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs text-gris uppercase tracking-wide">
                      Finalidad
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs text-gris uppercase tracking-wide">
                      Duración
                    </th>
                    <th className="text-left py-3 px-4 font-mono text-xs text-gris uppercase tracking-wide">Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {cookies.map((cookie) => (
                    <tr key={cookie.nombre}>
                      <td className="py-3 px-4 font-mono text-xs text-negro">{cookie.nombre}</td>
                      <td className="py-3 px-4 text-gris">{cookie.proveedor}</td>
                      <td className="py-3 px-4 text-gris">{cookie.finalidad}</td>
                      <td className="py-3 px-4 text-gris whitespace-nowrap">{cookie.duracion}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block font-mono text-xs uppercase tracking-wide px-2 py-0.5 ${tipoCookie[cookie.tipo].color}`}
                        >
                          {tipoCookie[cookie.tipo].etiqueta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Gestión de cookies */}
          <section>
            <h2 className="font-display text-2xl font-bold text-negro mb-4">Cómo gestionar las cookies</h2>
            <p className="font-sans text-base text-gris leading-relaxed mb-4">
              Puedes configurar las cookies en cualquier momento desde las opciones de tu navegador. Ten en cuenta que
              deshabilitar ciertas cookies puede afectar al funcionamiento del sitio:
            </p>
            <ul className="font-sans text-sm text-gris space-y-2 list-disc list-inside">
              <li>
                <strong className="text-negro">Chrome:</strong> Configuración → Privacidad y seguridad → Cookies
              </li>
              <li>
                <strong className="text-negro">Firefox:</strong> Opciones → Privacidad y seguridad → Cookies
              </li>
              <li>
                <strong className="text-negro">Safari:</strong> Preferencias → Privacidad → Cookies
              </li>
              <li>
                <strong className="text-negro">Edge:</strong> Configuración → Privacidad y servicios → Cookies
              </li>
            </ul>
          </section>

          {/* Más info */}
          <section>
            <h2 className="font-display text-2xl font-bold text-negro mb-4">Más información</h2>
            <p className="font-sans text-base text-gris leading-relaxed">
              Para cualquier consulta sobre nuestra política de cookies o el tratamiento de tus datos personales, puedes
              contactar con nuestra Delegada de Protección de Datos, Alicia Armas, en{' '}
              <a href="mailto:alicia@nasve.com" className="text-negro underline hover:text-ambar transition-colors">
                alicia@nasve.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
