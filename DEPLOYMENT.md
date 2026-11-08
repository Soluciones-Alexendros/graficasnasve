# DEPLOYMENT — graficasnasve.art

### Propósito de este documento

- **Objetivos:** Documentar el despliegue real (Vercel + Cloudflare + secretos) sin reescribir el pipeline.
- **Estructura:** Requisitos → env → Supabase/Resend → Vercel/Cloudflare → CI.
- **Contenido a integrar según contexto:** Conserva `deploy.yml` y el nombre de workflow **CI/CD**. El runbook corto está en `docs/runbooks/ci-deploy.md`.

> Guía de despliegue y configuración. Hermanos: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`ROADMAP.md`](./ROADMAP.md).

## 1. Requisitos

- **Node.js ≥ 20.9** y **pnpm 11** (`corepack enable`).
- Cuentas: **Supabase**, **Resend**, **Vercel**, **Cloudflare** (DNS del dominio).

## 2. Variables de entorno

Copiar `.env.example` → `.env.local` y rellenar (nunca subir `.env.local`):

| Variable                        | Ámbito       | Descripción                                                |
| ------------------------------- | ------------ | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | público      | URL del proyecto Supabase                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | público      | Clave anónima                                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | **servidor** | Solo server-side (upload + insert)                         |
| `RESEND_API_KEY`                | servidor     | API key de Resend                                          |
| `RESEND_FROM`                   | servidor     | Remitente verificado (p. ej. `no-reply@graficasnasve.art`) |
| `RESEND_PRESUPUESTO_TO`         | servidor     | Destinatario interno (p. ej. `alicia@nasve.com`)           |
| `NEXT_PUBLIC_APP_URL`           | público      | `https://graficasnasve.art`                                |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | público      | ID GA4 (`G-…`). Vacío = sin tag. Solo tras consentimiento  |

> Las claves de pasarela de pago (Stripe/Redsys/…) se añadirán en la **Fase 5** (ver §8).
> El Measurement ID de GA4 lo configura Alejandro en Vercel (preview + production); no va en el repo.

## 3. Supabase

1. Crear proyecto (región **UE**, p. ej. `eu-west-1` Irlanda — latencia + RGPD).
2. Aplicar el esquema **real** (tablas, RLS y bucket) — fuente de verdad
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql):
   - Con CLI: `pnpm supabase db push`
   - O pegar el SQL en **SQL Editor**.
3. Verificar el bucket privado **`arte-files`** y las políticas RLS creadas por la migración.
4. (Al cambiar el esquema) regenerar tipos:
   ```bash
   pnpm supabase gen types typescript --project-id XXXX > src/types/supabase.ts
   ```
5. Crear el usuario admin (Authentication → Users) para acceder a `/admin`.

> **La tienda no usa Supabase.** El catálogo de productos/preformatos vive en código
> (`src/lib/catalogoTienda.ts`) y el motor de precio en `src/lib/precioTienda.ts`; no requiere
> migración ni _seed_. ⚠️ Los **precios son orientativos**: para producción, sustituir los
> coeficientes de `precioTienda.ts` (precio base por producto, tramos de volumen y factores de
> gramaje/acabado) por la tarifa real de NASVE.

## 4. Resend (email)

1. Verificar el dominio `graficasnasve.art` en Resend.
2. Añadir los registros **DKIM/SPF** que indique Resend en **Cloudflare DNS**.
3. Configurar `RESEND_FROM` con un remitente del dominio verificado.

## 5. Vercel

1. Importar el repo. Región **`fra1`** (Fráncfort) — ver `vercel.json`.
2. Definir todas las variables de §2 en **Project → Settings → Environment Variables**
   (producción y _preview_).
3. Build: `pnpm build` (Turbopack por defecto en Next 16).
4. **Única vía de Production:** la integración Git de Vercel (push/merge a `main`).
   No hay segundo deploy por CLI.

## 6. Cloudflare (DNS)

1. Apuntar `graficasnasve.art` a Vercel (CNAME/A según panel de Vercel).
2. Mantener `graficasnasve.com` activo: el `next.config.ts` ya hace **301** hacia `.art`.
3. DKIM/SPF de Resend (§4).

## 7. CI/CD

`.github/workflows/ci.yml` (nombre **CI/CD**) ejecuta en cada PR/push:

- **quality** — typecheck + lint + format + meta-secciones
- **test** — Vitest
- **build** — `pnpm build`
- **smoke** — Playwright/Chromium, sin secretos

**Production:** la publica solo la **integración Git de Vercel** al mergear en `main`
(tras CI verde, según la protección de rama). Un merge → un deployment de Production.

**Smoke post-deploy** (`.github/workflows/deploy.yml`): tras CI/CD en verde sobre `main`,
el job `smoke-prod` comprueba con `curl` (reintentos) que
`https://ecommerce-graficasnasve.vercel.app` responde **200**. No despliega, no usa
`VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`. Si el HTTP falla, el job queda
rojo (sin `exit 0` que enmascare).

> Antes coexistían dos deploys (Git + CLI). El CLI se retiró a propósito para dejar una
> sola vía. Rollback: Instant Rollback de Vercel al deployment anterior (p. ej. `fc0cfce`).

## 8. Pagos (futuro — Fase 5)

La pasarela **no** está activada: `/api/webhooks/stripe` responde **501**. Antes de integrar,
decidir proveedor (ver comparativa en [`ROADMAP.md`](./ROADMAP.md) › Fase 5):

- **Redsys + Bizum** — TPV del banco; barato en tarjeta nacional; integración por redirección + firma.
- **Stripe** — mejor DX (Checkout + wallets); comisión mayor (peor en tickets pequeños).
- **Mollie** — Bizum + tarjeta, DX intermedia.

Pasos genéricos para activar (cuando se elija proveedor):

1. Crear cuenta y obtener claves API + secreto de webhook.
2. Registrar el endpoint del webhook (`https://graficasnasve.art/api/webhooks/stripe` o equivalente).
3. Añadir las claves en **Vercel → Environment Variables**.
4. Implementar el handler real (sustituir el stub 501) y conectar con el pipeline `pedidos`.
5. Probar en modo test antes de pasar a producción.

## 9. Checklist pre-lanzamiento

- [ ] Variables de entorno en Vercel (prod + preview)
- [ ] Migración SQL aplicada y bucket `arte-files` privado
- [ ] Usuario admin creado · login OK en `/admin`
- [ ] Dominio DKIM/SPF verificado (email de prueba recibido)
- [ ] `pnpm build` + CI en verde
- [ ] **Precios de la tienda revisados** (sustituir los orientativos de `precioTienda.ts` por la tarifa real)
- [ ] Envío real de presupuesto → fila en Supabase + emails (interno + acuse)
- [ ] Lighthouse SEO/Accesibilidad ≥ 90

## 10. Solución de problemas

- **`next build` falla en el prerender con `Cannot read properties of null (reading 'useContext')`.**
  Casi siempre es por ejecutar el build con `NODE_ENV=development` en el shell (Next lo avisa con
  «non-standard NODE_ENV»). `next build` debe usar `production`. Soluciónalo lanzando el build con
  el entorno limpio, p. ej. `env -u NODE_ENV pnpm build`. En CI (GitHub Actions) y Vercel `NODE_ENV`
  no es `development`, por lo que el build funciona sin más.
