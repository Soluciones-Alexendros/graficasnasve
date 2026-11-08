/**
 * graficasnasve.art
 * © 2026 Soluciones Alexendros S.L.U. — Todos los derechos reservados.
 */
import type { Metadata } from 'next'
import { BannerCookies } from '@/components/marketing/BannerCookies'
import { GoogleAnalytics } from '@/components/marketing/GoogleAnalytics'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://graficasnasve.art'),
  title: {
    template: '%s | Gráficas NASVE',
    default: 'Gráficas NASVE — Imprenta en Torrent desde 1982',
  },
  description:
    'Imprenta offset y digital en Torrent (Valencia). Encuadernación artesanal, acabados premium (stamping, UVI, relieves), personalización y impresión sobre madera. Más de 40 años de experiencia. Presupuesto sin compromiso.',
  keywords: [
    'imprenta Torrent',
    'imprenta Valencia',
    'imprenta offset',
    'encuadernación artesanal',
    'acabados stamping',
    'tarjetas de visita',
    'folletos',
    'impresión digital',
    'Gráficas NASVE',
  ],
  authors: [{ name: 'Gráficas NASVE, S.L.' }],
  creator: 'Soluciones Alexendros S.L.U.',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://graficasnasve.art',
    siteName: 'Gráficas NASVE',
    title: 'Gráficas NASVE — Imprenta en Torrent desde 1982',
    description:
      'Imprenta offset y digital en Torrent (Valencia). Acabados premium, encuadernación artesanal, personalización. +40 años. Presupuesto sin compromiso.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gráficas NASVE — Imprenta en Torrent desde 1982',
    description: 'Imprenta offset y digital en Torrent (Valencia). +40 años de experiencia.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-papel text-tinta font-sans antialiased">
        {children}
        <BannerCookies />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
