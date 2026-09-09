# Deployment and Operation

Para desarrollo, configura el backend local, ejecuta `npm run migrate` sobre una
base aislada y usa `npm run dev`. `PUBLIC_API_USE_MOCKS=true` activa demo MSW;
omitida o `false` usa backend y Socket.IO reales. Cambiar variables públicas
requiere reiniciar Rsbuild.

El stack E2E usa `docker-compose.e2e.yml`, PostgreSQL/PostGIS aislado en 55432,
backend en 4400 y frontend en 4300. Ejecuta `npm run e2e:db:up`, reset y
`npm run verify:e2e`; nunca apuntes esas variables a la base de desarrollo.

Ante problemas, confirma modo resuelto, proxy `/api` y `/socket.io`, cookie,
migraciones y logs E2E. No edites migraciones aplicadas. Antes de una base
compartida, realiza y prueba backup/restauración fuera del repositorio. Docker
images y deploy se describen en Dockerfiles y `deploy-main.yml`; sus secretos e
infraestructura son responsabilidad del entorno de despliegue.
