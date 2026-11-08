# Runbook: CI y deploy

### Propósito de este documento

- **Objetivos:** Diagnosticar un CI rojo o una promoción de Production que no es la revisión esperada, sin tocar branch protection ni org.
- **Estructura:** Jobs del CI → vía única de Production (Git) → comprobación del SHA promovido → fallos frecuentes.
- **Contenido a integrar según contexto:** Adapta runners `ubuntu-latest` (canon), la URL de Production y el deployment de retorno de este repo. No copies semantic-release de una CLI.

## Pipeline

1. **CI/CD** (`.github/workflows/ci.yml`): `quality` → `test` → `build` (artefacto `.next`) → `smoke` (Playwright). Ese verde no es la promoción.
2. **Production:** integración Git de Vercel (merge a `main`). Una sola vía; `deploy.yml` no llama a `vercel pull`, `vercel build` ni `vercel deploy`.
3. **Deploy → Producción** (`.github/workflows/deploy.yml`): solo si CI/CD en `main` concluye `success`. Job `smoke-prod`: lee el alias, exige `source=git`, `readyState=READY` y `meta.githubCommitSha` igual a `github.event.workflow_run.head_sha`, y después HTTP 200 de la URL de ese deployment y de `https://ecommerce-graficasnasve.vercel.app`. Reintenta mientras Git termina. Si faltan `VERCEL_TOKEN`, `VERCEL_ORG_ID` o `VERCEL_PROJECT_ID`, sale 1. No imprime secretos ni hace `exit 0`.

El `name:` del workflow de CI debe seguir siendo **CI/CD**. Si lo cambias, el `workflow_run` de smoke deja de dispararse. Un job skipped no cuenta como éxito.

## Fallos frecuentes

| Síntoma               | Qué mirar                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `quality` rojo        | `pnpm typecheck` / `lint` / `format:check` / `make validate-docs`                                                                                |
| `test` rojo           | Vitest en `src/**/*.test.*`                                                                                                                      |
| `build` rojo          | `pnpm build` (Next 16; ver `node_modules/next/dist/docs/`)                                                                                       |
| `smoke` rojo          | Playwright; artefactos `playwright-report`                                                                                                       |
| `smoke-prod` rojo     | SHA, `source` y HTTP del deployment del alias. Cuota `api-deployments-free-per-day` o `build-rate-limit`: parar, sin reintento ni cambio de plan |
| Production sin deploy | ¿Integración Git activa en el proyecto Vercel? ¿rama `main`?                                                                                     |

Runners de `quality`, `test` y `build`: `ubuntu-latest`. El job `smoke` usa `ubuntu-24.04` porque Playwright 1.60 no instala Chromium en `ubuntu-latest` (26.04). `deploy.yml` permanece aparte (solo lectura y smoke del SHA).

> Nota (2026-10-25): se retiró el deploy por Vercel CLI. El run [40192958620](https://github.com/Soluciones-Alexendros/graficasnasve/actions/runs/40192958620) falló en la promoción CLI por cuota, con el artefacto ya construido.
> Rollback de emergencia, mientras el alias no cambie: Instant Rollback al deployment `dpl_7FHxNXCVC82spic8HWEsqDHGsVGW` (SHA `dffb7faefe3b935fe86dbded035782509c4e8238`).
