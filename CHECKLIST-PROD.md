# CHECKLIST PRE-PRODUCCIÓN — web a producción

> Lista reutilizable para sacar **cualquier** web a producción. La columna **Estado**
> refleja `ecommerce-graficasnasve` a **2026-10-25** (Ronda 2). Leyenda: ✅ hecho · 🟡 parcial/manual · ⬜ pendiente.
> Hermanos: [`DEPLOYMENT.md`](./DEPLOYMENT.md) · [`ROADMAP.md`](./ROADMAP.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Evidencia Ronda 2 (PRs)

| Tema                                               | PR                                                                              | Estado                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Un solo deploy Production (Git) + smoke HTTP       | [#21](https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve/pull/21) | Abierto · required CI verde · merge bloqueado (solo squash)             |
| Jobs `secrets` + `sca`                             | [#23](https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve/pull/23) | Abierto · `secrets`/`sca` verdes                                        |
| Licencia propietario / UNLICENSED en README        | [#24](https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve/pull/24) | Abierto                                                                 |
| Preflight archivos (MIME real, tamaño, resolución) | [#25](https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve/pull/25) | Abierto · required CI verde                                             |
| Consent GA4 (banner + Consent Mode v2 + e2e)       | [#26](https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve/pull/26) | Abierto                                                                 |
| Checklist evidencia Ronda 2                        | [#27](https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve/pull/27) | Abierto                                                                 |
| Precios reales NASVE                               | —                                                                               | **No hay PR**: sin tarifa cerrada; no se inventan importes (2026-10-25) |

URL prod: `https://ecommerce-graficasnasve.vercel.app` → HTTP 200 (verificado en Ronda 1 / smoke). Preview Vercel: rate limit Hobby (24 h) en varios PRs.

## 1. Calidad de código

| Ítem                                            | Estado                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `typecheck` sin errores                         | ✅                                                                                              |
| `lint` sin errores                              | ✅                                                                                              |
| Tests unitarios verdes (Vitest)                 | ✅ (54 en `main`; +10 preflight en #25)                                                         |
| E2E verdes (Playwright)                         | ✅ (+ consent en #26)                                                                           |
| `build` de producción correcto (SSG/ISR)        | ✅                                                                                              |
| Sin `console.log`/`debugger`/TODO bloqueantes   | ✅                                                                                              |
| Dependencias sin vulnerabilidades critical/high | 🟡 job `sca` en #23 (`pnpm audit --prod --audit-level=high` + OSV); Dependabot 1 medium abierto |

## 2. Git / repositorio

| Ítem                                                   | Estado                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| Rama `main` protegida (PR obligatorio + checks)        | ✅                                                         |
| CI en cada PR/push (quality·test·build·smoke)          | ✅ (+ `secrets`/`sca` en #23; marcar required = Alejandro) |
| `.gitignore` cubre `.env*`, `node_modules`, artefactos | ✅                                                         |
| Sin secretos reales en el árbol                        | ✅ (gitleaks #23; historial de plantillas allowlist)       |
| `LICENSE` / declaración propietario                    | ✅ + README en #24 (`UNLICENSED`)                          |
| README/AGENTS con arranque y convenciones              | ✅                                                         |

## 3. Configuración y secretos

| Ítem                                                      | Estado                                       |
| --------------------------------------------------------- | -------------------------------------------- |
| `.env.example` con todas las variables                    | ✅ (+ GA4 en #26)                            |
| Variables definidas en el host (Vercel prod + preview)    | ⬜ al desplegar / GA4 ID pendiente Alejandro |
| Secretos solo server-side (no `NEXT_PUBLIC_` lo sensible) | ✅                                           |
| Claves de pago como stub hasta elegir proveedor (Fase 5)  | ✅                                           |

## 4. Seguridad

| Ítem                                                 | Estado                                       |
| ---------------------------------------------------- | -------------------------------------------- |
| Cabeceras de seguridad (CSP, HSTS, X-Frame-Options…) | 🟡 verificar en Vercel/`next.config`         |
| RLS activa en Supabase + bucket `arte-files` privado | ✅ (migración) · ⬜ aplicar en proyecto real |
| Rutas admin tras guard de auth                       | ✅                                           |
| Rate-limit / antispam en formularios públicos        | ⬜ recomendable                              |
| HTTPS forzado + redirect 301 dominio viejo→nuevo     | ✅ (`next.config.ts`)                        |
| Preflight MIME/tamaño/resolución en servidor         | ✅ código en #25                             |

## 5. SEO e indexación

| Ítem                                                    | Estado     |
| ------------------------------------------------------- | ---------- |
| `metadata`, Open Graph, Twitter cards                   | ✅         |
| Schema.org (`LocalBusiness`/`Product`/`BreadcrumbList`) | ✅         |
| `sitemap.xml` + `robots.txt`                            | ✅         |
| Canonical URLs correctas                                | ✅         |
| Search Console: verificar + enviar sitemap              | ⬜ go-live |
| `manifest` + favicon/iconos                             | ✅         |

## 6. Accesibilidad

| Ítem                                            | Estado              |
| ----------------------------------------------- | ------------------- |
| Navegación por teclado + focus visible          | ✅                  |
| `aria-label`/roles en controles e iconos        | ✅                  |
| Contraste AA del Design System                  | ✅                  |
| `prefers-reduced-motion` respetado (incl. tour) | ✅                  |
| Banner cookies accesible (dialog + foco)        | ✅ en #26           |
| Lighthouse Accesibilidad ≥ 90                   | ⬜ medir en go-live |

## 7. Rendimiento (Core Web Vitals)

| Ítem                                                   | Estado                     |
| ------------------------------------------------------ | -------------------------- |
| LCP < 2,5 s · CLS < 0,1 · INP < 200 ms                 | ⬜ medir                   |
| Imágenes optimizadas (`next/image`, formatos modernos) | 🟡 placeholders pendientes |
| Fuentes self-hosted sin FOUT                           | ✅                         |
| SSG/ISR donde aplica                                   | ✅                         |
| Lighthouse Performance ≥ 90                            | ⬜ medir                   |

## 8. UX / contenido

| Ítem                                              | Estado                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Onboarding / visita guiada para nuevos visitantes | ✅ (driver.js)                                                                                   |
| Páginas de error (404 / 500)                      | ✅ (`not-found`, `error`)                                                                        |
| Estados de carga y vacío                          | ✅                                                                                               |
| Textos legales (aviso legal, privacidad, cookies) | ✅                                                                                               |
| Banner de cookies + Consent Mode (si analítica)   | ✅ código en #26 · ID GA4 en Vercel pendiente                                                    |
| Precios reales (tarifa NASVE)                     | ⬜ **justificado 2026-10-25**: sin tarifa cerrada; no se inventan importes; ADR 0001 se mantiene |
| Contenido/imágenes reales (no placeholders)       | 🟡 pendiente del cliente                                                                         |

## 9. Datos y email

| Ítem                                           | Estado                   |
| ---------------------------------------------- | ------------------------ |
| Migración SQL aplicada en el proyecto real     | ⬜ al desplegar          |
| Dominio de email verificado (DKIM/SPF)         | ⬜ al desplegar          |
| Envío real de formulario → fila en BD + email  | ⬜ smoke en prod         |
| Backups / point-in-time recovery del proveedor | ✅ (Supabase gestionado) |

## 10. Observabilidad y operación

| Ítem                                         | Estado                                           |
| -------------------------------------------- | ------------------------------------------------ |
| Monitor de errores (Sentry o equiv.)         | ⬜ deuda técnica                                 |
| Analítica de producto (GA4)                  | 🟡 código #26 · Measurement ID pendiente         |
| Uptime/alertas                               | ⬜ recomendable                                  |
| Runbook de despliegue y rollback documentado | ✅ (`DEPLOYMENT.md`; Instant Rollback `fc0cfce`) |
| Una sola vía Production por merge            | 🟡 código #21 · verificar tras merge             |

## 11. Go-live final

- [ ] Smoke manual de los flujos críticos en producción
- [ ] DNS `graficasnasve.art` apuntando + propagado + redirect viejo dominio
- [ ] Variables de entorno verificadas en prod (incl. GA4)
- [ ] Lighthouse en verde (SEO/A11y/Perf ≥ 90)
- [ ] UAT con el cliente final
- [ ] Anuncio (redes / reseñas)
- [ ] Alejandro: habilitar merge commits (hoy solo squash + linear history)
- [ ] Alejandro: required checks `secrets` + `sca`
- [ ] Alejandro: borrar `plantilla-base` y `fix/deploy-vercel-dlx`
- [ ] Alejandro: aportación tarifa NASVE (ciclo posterior)
