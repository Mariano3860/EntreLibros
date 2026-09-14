# Deployment and Operation

## Desarrollo local

1. Conserva la base anterior con el ledger `001`–`037`; no la borres ni ejecutes
   el nuevo `npm run migrate` sobre ella.
2. Crea una base PostgreSQL/PostGIS distinta, por ejemplo
   `entrelibros_baseline`, y configura `backend/.env` con ese nombre. Si usas
   otro nombre, declara también
   `ENTRELIBROS_MIGRATION_DATABASE_NAMES=<nombre>` y
   `ENTRELIBROS_LOCAL_DATABASE_NAMES=<nombre>`.
3. Ejecuta `npm run migrate`. El runner rechaza un ledger retirado antes de DDL.
4. Ejecuta `npm run seed:local` para cargar el recorrido persistido de defensa.
5. Ejecuta `npm run seed:local:verify` para comprobar conteos, relaciones e
   imágenes primarias.
6. Ejecuta `npm run dev`.

La aplicación usa la API y Socket.IO reales. MSW solo se inicia en el bundle de
tests; `PUBLIC_API_USE_MOCKS` no debe usarse para reemplazar datos en ejecución.
Para retirar el recorrido de demostración sin borrar otros datos, ejecuta
`npm run seed:local:cleanup`. Ambos comandos aceptan por defecto únicamente
`entrelibros_baseline`, `entrelibros_dev` y `entrelibros_local`; se puede
ampliar esa lista con `ENTRELIBROS_LOCAL_DATABASE_NAMES`.

## Rollback del corte de baseline

El corte no tiene upgrade in-place. Si la nueva instalación no es aceptable,
detén el proceso, vuelve el `DATABASE_URL` de la aplicación a la base anterior
y usa la versión de backend compatible con su ledger. No ejecutes el migrador
del baseline contra esa base ni intentes editar hashes históricos.

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
