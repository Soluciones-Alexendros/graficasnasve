# Política de seguridad

### Propósito de este documento

- **Objetivos:** Declarar versiones soportadas, el canal privado de avisos y la superficie de la tienda (presupuesto, Storage, panel).
- **Estructura:** Versiones soportadas → cómo reportar → superficie relevante → alcance (e-commerce público, no desk de comunidad).
- **Contenido a integrar según contexto:** Adapta versiones de Next.js/pnpm y secretos de Supabase/Resend. No copies la política de una CLI. No commitees `.env.local` ni claves; no abras un issue público con datos de clientes.

## Versiones soportadas

| Versión                         | Soportada      |
| ------------------------------- | -------------- |
| `main` (0.2.x / 0.3.x, Next 16) | Sí             |
| Ramas y tags anteriores         | Solo histórico |

## Cómo reportar una vulnerabilidad

**No abras un issue público** si el hallazgo puede filtrar secretos, datos de presupuestos o archivos de arte.

1. Preferible: [GitHub Security Advisory](https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve/security/advisories/new) en este repositorio.
2. Alternativa: correo a [operaciones@alexendros.dev](mailto:operaciones@alexendros.dev).

Incluye: versión o commit, ruta o comando reproducido, y un caso **mínimo sintético** (nunca claves reales ni PDFs de clientes). Responderemos en un plazo máximo de 7 días naturales.

## Superficie relevante

- Formulario y API de presupuesto (`/presupuesto`, `/api/presupuesto`) — multipart, Storage `arte-files`, Resend.
- Panel `/admin` (guard en `src/proxy.ts`). El login queda fuera del guard.
- Webhook `/api/webhooks/stripe` es **stub 501**; no hay pagos en producción todavía.
- Secretos en `.env.local` (Supabase, Resend, Stripe, `APP_URL`). El fichero no se versiona; usa `.env.example`.
- Renovate (`.github/renovate.json`) cubre presets de flota (npm + acciones). No hay Dependabot de version-updates.
- CI (`ci.yml`): jobs **`secrets`** (gitleaks v8.30.1 binario, sin `gitleaks-action`) y **`sca`** (`pnpm audit --prod --audit-level=high` + OSV-Scanner high sobre el lockfile). Sin `continue-on-error`.

## Alcance

Este repositorio es la web pública de Gráficas NASVE. Las incidencias de un pedido o de un archivo de arte se gestionan por el canal comercial ([SUPPORT.md](SUPPORT.md)), no por un issue de GitHub.
