# Deployment and Operation

## Desarrollo local

1. Configura `backend/.env` con una base PostgreSQL/PostGIS aislada.
2. Ejecuta `npm run migrate`.
3. Ejecuta `npm run seed:local` para cargar el recorrido persistido de defensa.
4. Ejecuta `npm run seed:local:verify` para comprobar conteos, relaciones e
   imágenes primarias.
5. Ejecuta `npm run dev`.

La aplicación usa la API y Socket.IO reales. MSW solo se inicia en el bundle de
tests; `PUBLIC_API_USE_MOCKS` no debe usarse para reemplazar datos en ejecución.
Para retirar el recorrido de demostración sin borrar otros datos, ejecuta
`npm run seed:local:cleanup`. Ambos comandos aceptan por defecto únicamente
`entrelibros`, `entrelibros_dev` y `entrelibros_local`; se puede ampliar esa
lista con `ENTRELIBROS_LOCAL_DATABASE_NAMES`.

## Verificación

```bash
npm run test:backend
npm run test:frontend
npm run typecheck:backend
npm run typecheck:frontend
npm run build:backend
npm run build:frontend
```

El stack E2E usa `docker-compose.e2e.yml`, PostgreSQL/PostGIS aislado en 55432,
backend en 4400 y frontend en 4300. Ejecuta `npm run e2e:db:up` y
`npm run verify:e2e`; nunca apuntes esas variables a la base de desarrollo.

## Imágenes y datos sembrados

Las imágenes del dataset son referencias HTTPS públicas a Open Library,
Unsplash y Random User. No contienen secretos ni coordenadas privadas exactas.
El producto conserva la URL y muestra el fallback existente si el proveedor no
responde; el seed no descarga ni almacena imágenes binarias. Una red sin acceso
externo puede dejar las portadas o fotos en fallback, sin afectar la
persistencia ni las relaciones del dataset.

## Recuperación y despliegue

Ante problemas, confirma la base seleccionada, migraciones, proxy `/api` y
`/socket.io`, cookies y logs del backend. No edites migraciones aplicadas.
Antes de usar una base compartida, realiza y prueba backup/restauración fuera
del repositorio. Dockerfiles y `deploy-main.yml` describen el despliegue; sus
secretos, backups y la infraestructura objetivo son responsabilidad del
entorno operativo.
