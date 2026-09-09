# Testing

- **Unit:** funciones y reglas aisladas.
- **Frontend:** Vitest, Testing Library y MSW prueban UI, estados y contratos
  simulados. MSW no demuestra PostgreSQL, cookies, Socket.IO real ni
  persistencia tras reinicio.
- **Backend/integration:** Vitest contra PostgreSQL aislado prueba rutas,
  repositories, autorización y transacciones.
- **Service E2E:** `e2e:test:backend` usa la base E2E aislada.
- **Playwright:** `npm run e2e` abre navegador real contra frontend, backend y
  PostGIS; cubre auth, catálogo, mapa, publicación, perfil, mensajería,
  acuerdos y seguridad.
- **CI:** workflows separados ejecutan backend, frontend y baseline E2E.

Usa `npm run verify:e2e` para backend aislado + Playwright. `npm run verify:ci`
agrega formato, lint, typecheck, builds y tests; necesita Docker/Chromium y su
entorno E2E. Diagnósticos E2E quedan en `test-results/e2e` solo ante fallos.
