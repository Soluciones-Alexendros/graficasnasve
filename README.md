# graficasnasve.art

### Propósito de este documento

- **Objetivos:** Presentar el e-commerce de Gráficas NASVE, el stack y los contratos de repo (P1+P2).
- **Estructura:** Badges → producto → stack → desarrollo/Makefile → CI (`quality`/`test`/`build`/`smoke`) → documentación.
- **Contenido a integrar según contexto:** Conserva producto, deploy Vercel y contenido de marketing. No copies un README de CLI. El catálogo es estático en código.

[![CI/CD](https://img.shields.io/github/actions/workflow/status/Soluciones-Alexendros/ecommerce-graficasnasve/ci.yml?branch=main&logo=github)][ci-link]
[![Vercel](https://img.shields.io/badge/Vercel-deploy-black?logo=vercel)][vercel-link]
[![Website](https://img.shields.io/website?url=https://ecommerce-graficasnasve.vercel.app)][website-url]
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript)][ts-link]
[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js)][next-link]
[![Playwright](https://img.shields.io/badge/Playwright-4B47D4?logo=playwright)][pw-link]

**Web e-commerce de Gráficas NASVE** — imprenta offset y digital en Torrent (Valencia) desde 1982.

---

## Stack

| Capa      | Tecnología                                                                              |
| --------- | --------------------------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)                               |
| UI        | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) strict |
| Estilos   | [Tailwind CSS v4](https://tailwindcss.com/) + Design System NASVE                       |
| Backend   | [Supabase](https://supabase.com/) (PostgreSQL + RLS + Storage)                          |
| Email     | [Resend](https://resend.com/)                                                           |
| Hosting   | [Vercel](https://vercel.com/) (cdg1+fra1) + [Cloudflare](https://www.cloudflare.com/)   |
| Tests     | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)                   |

## Desarrollo

```bash
corepack enable
pnpm install
cp .env.example .env.local   # rellenar variables
pnpm dev                     # http://localhost:3000
```

### Comandos

| Comando          | Acción                       |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Servidor de desarrollo       |
| `pnpm build`     | Build producción (SSG/ISR)   |
| `pnpm typecheck` | `tsc --noEmit`               |
| `pnpm lint`      | ESLint                       |
| `pnpm test`      | Tests unitarios (Vitest)     |
| `pnpm test:e2e`  | Tests E2E (Playwright)       |
| `make lint`      | typecheck + lint + format    |
| `make test`      | Vitest                       |
| `make smoke`     | Playwright                   |
| `make validate`  | lint + test + meta-secciones |

## CI/CD

GitHub Actions (workflow **CI/CD**) ejecuta en cada push/PR los jobs canónicos:

1. **quality** — `typecheck` + `lint` + `format:check` + meta-secciones
2. **test** — Vitest
3. **build** — `pnpm build` (artefacto `.next`)
4. **smoke** — Playwright/Chromium
5. **secrets** — gitleaks (binario v8.30.1)
6. **sca** — `pnpm audit --prod --audit-level=high` + OSV-Scanner (high)
7. **Production** — integración Git de Vercel al mergear en `main` (ver `DEPLOYMENT.md`)

## Contratos

- [`SECURITY.md`](./SECURITY.md) — avisos privados
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — setup y PR
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) · [`SUPPORT.md`](./SUPPORT.md)
- [`AGENTS.md`](./AGENTS.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`docs/`](./docs/) — architecture, guides, runbooks

## Documentación de producto

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Diseño del sistema, routing, modelo de datos
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — Guía de despliegue y configuración
- [`ROADMAP.md`](./ROADMAP.md) — Fases y funcionalidades planificadas
- [`CHECKLIST-PROD.md`](./CHECKLIST-PROD.md) — Checklist pre-lanzamiento
- [`CHANGELOG.md`](./CHANGELOG.md) — Historial de versiones

## Uso como plantilla

```bash
# Clonar y renombrar
git clone https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve.git mi-proyecto
cd mi-proyecto

# Configuración inicial
pnpm install
cp .env.example .env.local
pnpm supabase db push
pnpm dev
```

Ver checklist completa en [`CHECKLIST-PROD.md`](./CHECKLIST-PROD.md).

[ci-link]: https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve/actions
[vercel-link]: https://ecommerce-graficasnasve.vercel.app
[website-url]: https://ecommerce-graficasnasve.vercel.app
[ts-link]: https://www.typescriptlang.org/
[next-link]: https://nextjs.org/
[pw-link]: https://playwright.dev/
