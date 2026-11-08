<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — ecommerce-graficasnasve

### Propósito de este documento

- **Objetivos:** Fijar el contrato operativo para agentes de código y el rol Mantenedor: fuentes de verdad, autonomía, comandos y Definition of Done.
- **Estructura:** Destinatarios → fuentes de verdad → unidad de trabajo → autonomía → stack y comandos → convenciones → layout → Definition of Done.
- **Contenido a integrar según contexto:** Adapta layout, scripts pnpm y umbrales de este e-commerce. No copies un `AGENTS.md` de CLI ni muevas el catálogo a Supabase. Conserva producto, deploy (`deploy.yml`) y contenido de marketing.

**Destinatarios:** agentes de código y el rol Mantenedor.  
**Propósito:** contrato operativo. Homogeneizamos **nombres y contratos**, no el catálogo ni la UX.

## Fuentes de verdad (orden)

1. [README.md](./README.md)
2. Este archivo (y el aviso Next.js 16 de arriba)
3. [ARCHITECTURE.md](./ARCHITECTURE.md)
4. [docs/architecture/decisions/](./docs/architecture/decisions/) — ADRs; el stub [`DECISIONS.md`](./DECISIONS.md) apunta aquí
5. [CONTRIBUTING.md](./CONTRIBUTING.md)
6. [SECURITY.md](./SECURITY.md)
7. [CLAUDE.md](./CLAUDE.md) — contexto de producto para agentes

No reinventes requisitos. Si falta ancla, paras y preguntas.

## Unidad de trabajo

```
Objetivo: <resultado verificable>
Traza: <ADR / issue / ruta>
Alcance: <archivos>
Exclusiones: <qué no harás>
Pruebas: make test / make smoke
Criterio de cierre: CI quality + test + build + smoke verdes
```

Una sesión = una unidad cohesiva. PR pequeño. Mensajes al humano y commits en español (Conventional Commits).

## Autonomía

**Puedes sin preguntar**

- Tests que fijan comportamiento ya aceptado
- Corregir lint/format/typecheck causados por tu cambio
- Docs de guía/runbook en español
- Refactors locales que no cambien precios, catálogo público ni el deploy

**Requiere confirmación**

- Cambiar `src/lib/catalogoTienda.ts` o `src/lib/precioTienda.ts` (tarifa / SKUs)
- Tocar `.github/workflows/deploy.yml` o secretos de Vercel
- Dependencia runtime nueva
- Activar el webhook Stripe (hoy stub 501) o otro proveedor de pago

## Stack y comandos

- Node 22 (`.nvmrc`), **pnpm 11.5.2**, Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, Vitest, Playwright
- Coverage documentado: mínimo de flota **≥ 70 %** (`docs/guides/calidad.md`)

```bash
corepack enable && pnpm install
cp .env.example .env.local
make lint && make test
pnpm build && make smoke
make validate
```

CI principal (`.github/workflows/ci.yml`, nombre **CI/CD**): jobs `quality`, `test`, `build`, `smoke`. Production la publica la integración Git de Vercel. `deploy.yml` no despliega: tras CI/CD en `main` comprueba el SHA promovido (`source=git`) y el HTTP 200 de esa revisión. Si faltan los secretos de lectura, el job falla. No renombres el workflow **CI/CD**.

## Convenciones

- Ramas `feat/` `fix/` `docs/` `chore/` (Cloud: `cursor/…-4840` u homólogo)
- Idioma: README / CONTRIBUTING / docs de guía en español
- Catálogo de tienda **estático en código**, no tabla Supabase
- No commitees `.env.local`, `.next/`, `coverage/` ni secretos
- Consulta `node_modules/next/dist/docs/` antes de APIs de Next 16

## Layout

```
src/app/(marketing)/   páginas públicas (tienda, presupuesto, servicios)
src/app/admin/         panel (login fuera del guard)
src/app/api/           presupuesto + webhook stripe (stub)
src/lib/               catálogo, precio, supabase, validaciones Zod
e2e/                   Playwright
docs/                  architecture/, guides/, runbooks/
.github/workflows/     ci.yml (quality/test/build/smoke) + deploy.yml (smoke-prod)
```

## Definition of Done

- Criterios de la traza cumplidos
- Jobs `quality`, `test`, `build` y `smoke` verdes
- Docs canónicos actualizados si cambia el contrato
- Sin secretos en el diff
