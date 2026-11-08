# Contribuir a ecommerce-graficasnasve

### Propósito de este documento

- **Objetivos:** Explicar setup, flujo de rama/PR y reglas locales para contribuir sin romper catálogo, precios ni el deploy a Vercel.
- **Estructura:** Idioma → setup → flujo de trabajo → comprobaciones antes del PR → reglas (catálogo, coverage, secretos).
- **Contenido a integrar según contexto:** Adapta scripts pnpm, husky y umbrales de este repo. No copies un flujo npm/CLI. El catálogo de tienda vive en código (`src/lib/catalogoTienda.ts`), no en Supabase.

Idioma: este fichero, `README.md` y `docs/guides|runbooks` en español. Lee también [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md) y [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Setup

```bash
corepack enable
pnpm install
cp .env.example .env.local   # rellenar; no commitear
pnpm dev                     # http://localhost:3000
```

## Flujo de trabajo

Rama `feat/*` / `fix/*` / `docs/*` / `chore/*` (agentes Cloud: `cursor/…`) → PR contra `main` → CI verde → merge. `main` está protegida; Production la despliega la integración Git de Vercel. `deploy.yml` no despliega: comprueba que el alias sea ese SHA (`source=git`) y que la URL de ese deployment responda 200. Un HTTP 200 del alias con otro SHA no basta.

Los hooks `husky` (si están activos en local) corren lint-staged en pre-commit.

## Antes de un PR

```bash
make validate    # lint + test + meta-secciones
pnpm build       # si tocas App Router, catálogo o next.config
make smoke       # E2E Playwright (construye si no hay .next)
```

## Reglas

- El catálogo y el motor de precio son **estáticos en código**. No busques productos en Supabase. Cambios de contrato → ADR en [`docs/architecture/decisions/`](docs/architecture/decisions/).
- Coverage: mínimo de flota **≥ 70 %** documentado en [`docs/guides/calidad.md`](docs/guides/calidad.md). Vitest cubre `src/lib/**`, `src/components/**` y `src/proxy.ts`.
- No commitees `.env.local`, `.next/`, `coverage/`, `playwright-report/` ni archivos de arte de clientes.
- Vulnerabilidades: [SECURITY.md](SECURITY.md), no un issue público.
- Pedidos y presupuestos de clientes: [SUPPORT.md](SUPPORT.md), no GitHub Issues.
