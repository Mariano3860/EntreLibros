# Baseline E2E real

Este documento describe el flujo reproducible de Playwright contra el frontend,
backend y PostgreSQL/PostGIS reales. No sustituye las pruebas Vitest,
Testing Library, MSW ni los E2E HTTP del backend.

## Requisitos

- Node `>=22.19.0 <23`, npm y Docker con Compose.
- Dependencias instaladas con `npm ci` o `npm install`.
- Chromium instalado con `npm run e2e:install`.

El flujo no usa la base de desarrollo. Por defecto crea el proyecto Compose
`entrelibros-e2e`, publica PostgreSQL en `127.0.0.1:55432`, levanta el backend en
`http://127.0.0.1:4400` y sirve el frontend en `http://127.0.0.1:4300`.

## Variables y seguridad

Las variables E2E tienen valores seguros por defecto:

```text
E2E_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/entrelibros_e2e
E2E_BACKEND_URL=http://127.0.0.1:4400
E2E_FRONTEND_URL=http://127.0.0.1:4300
E2E_DB_PORT=55432
E2E_COMPOSE_PROJECT=entrelibros-e2e
E2E_COMPOSE_FILE=docker-compose.e2e.yml
```

El nombre de la base debe contener `e2e` y el proyecto Compose debe comenzar
por `entrelibros-e2e`. Los scripts abortan antes de borrar o recrear una base
que no cumpla esas reglas. No apuntes `E2E_DATABASE_URL` a la base de desarrollo
ni reutilices sus datos. El runtime E2E configura automáticamente un JWT
exclusivo de pruebas; `E2E_JWT_SECRET` permite sobrescribirlo cuando el entorno
lo requiera, siempre con un valor que no se use en producción.

## Comandos

Desde la raiz del repositorio:

```bash
npm ci
npm run e2e:install
npm run e2e:db:up
npm run e2e:db:reset
npm run e2e:db:reset-empty
npm run e2e:test:backend
npm run e2e:test:frontend
npm run e2e:test:integration
npm run e2e
npm run e2e:headed
npm run verify:e2e
npm run verify:ci
npm run e2e:db:cleanup
```

`e2e:db:reset` recrea la base, aplica las migraciones existentes y carga el
seed del baseline. `e2e:db:reset-empty` deja la misma base solo con
migraciones, sin seed. `e2e:test:backend` usa una base E2E vacia despues de las
migraciones para ejecutar la suite backend existente; `e2e:test:integration`
es el alias de esa capa. `e2e` prepara su propia base con seed, construye los
dos paquetes, arranca ambos servidores, espera sus health checks y ejecuta
Playwright en un worker serial. El teardown destruye el proyecto Compose y su
volumen aunque la suite falle.

`verify:e2e` es la comprobacion usada por la pipeline E2E: ejecuta los tests
backend contra la base E2E aislada y Playwright. Los tests unitarios del
frontend se ejecutan exclusivamente en la pipeline de frontend, para no
duplicarlos. `verify:ci` es la comprobacion global no mutante: ejecuta formato en modo
check, lint sin `fix`, stylelint, typecheck, los tests backend existentes
contra la base E2E aislada, los tests frontend, builds y Playwright. Asi CI no
depende de un `.env.test` ni de una base manual preexistente. Los `complete-check` de cada paquete se
mantienen como comandos historicos de mantenimiento y pueden aplicar
`lint:fix`/`format:fix`; no forman parte de `verify:ci`.

No ejecutes `e2e:db:cleanup` mientras Playwright este usando la base. Para
limpiar manualmente una ejecucion interrumpida:

```bash
npm run e2e:db:cleanup
```

## Seed y limites

El seed versionado esta en [`../e2e/fixtures/seed.sql`](../e2e/fixtures/seed.sql)
y contiene solamente cuentas sinteticas: A, B, un tercer usuario no autorizado
y un administrador, con contrasena de prueba `Demo123!`. Tambien contiene
libros, publicaciones, relaciones, conversacion y acuerdo de caracterizacion.
No incluye credenciales reales ni datos personales.

El baseline fuerza `PUBLIC_API_USE_MOCKS=false` y usa el proveedor HTTP real.
La publicacion de prueba usa una imagen local minima y no llama a OpenLibrary;
el flujo actual no necesita geocodificacion externa. No se agregaron seams que
cambien el comportamiento productivo.

## Diagnostico

Ante un fallo, Playwright conserva en `test-results/e2e` el reporte y, cuando
corresponde, trace, screenshot y video. El orquestador escribe
`test-results/e2e/runtime/backend.log`, `frontend.log` y `stack.log`; los tests
los adjuntan al reporte solo cuando fallan. Un error de puerto o de Docker
normalmente se resuelve liberando `55432`, `4400` y `4300`, o sobrescribiendo
las variables E2E con destinos aislados.

La discrepancia de seguridad permitida actualmente es
`SEC-BOOK-VERIFY-ADMIN-GUARD`, documentada por el test y vinculada a
`openspec/changes/admin-book-verification-authorization`. Una discrepancia
nueva, o un cambio no documentado de esta, hace fallar la suite.
