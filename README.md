# EntreLibros Monorepo

Este repositorio contiene el frontend y backend del proyecto EntreLibros.

## Chat Bot

El sistema incluye un bot de chat básico. Para hablarle:

- Abre el chat **Bot** en la vista de mensajes (es la primera opción y se selecciona por defecto).
- También puedes mencionar al bot escribiendo `@bot` al inicio de un mensaje.

El backend enviará una respuesta automática en el mismo canal usando el usuario `{ id: 0, name: 'Bot' }`.

### Guía rápida para testers

1. Inicia el backend y el frontend con `npm run dev`.
2. Abre la página de mensajes y verifica que el chat **Bot** esté seleccionado.
3. Envía un mensaje y confirma que el bot responde de inmediato.

## Desarrollo sin Docker

1. **Instalar dependencias**
   ```bash
   npm install
   ```
2. **Configurar variables de entorno**
   - Copiar `backend/.env.example` a `backend/.env` y ajustar `DATABASE_URL`.
   - (Opcional) Copiar `backend/.env.test.example` a `backend/.env.test` para las pruebas. Este archivo se genera automáticamente si no existe.
   - Revisar `frontend/.env.example` para configurar el frontend.
3. **Levantar PostGIS con Docker**
   ```bash
   docker compose -f docker-compose.postgis.yml up -d
   ```
   Para detenerlo:
   ```bash
   docker compose -f docker-compose.postgis.yml down
   ```
4. **Preparar base de datos y migraciones**
   ```bash
   npm run migrate
   ```
   Crea la base definida en `backend/.env` y aplica las migraciones.
5. **Levantar servidores**
   ```bash
   npm run dev:backend   # backend
   npm run dev:frontend  # frontend
   # o para levantar ambos en paralelo:
   npm run dev
   ```
   El frontend obtiene la URL del backend desde `PUBLIC_API_BASE_URL`.

Luego de iniciar el backend, puedes visitar `http://localhost:4000/api-docs` para ver la documentación interactiva de la API generada con Swagger.

## Modo producción local

Para probar el sistema completo en modo producción:

```bash
npm run prod
```

Esto compila el frontend y backend y levanta ambos servidores usando los builds resultantes.

## Desarrollo con Docker Compose

El proyecto puede ejecutarse con [Docker Compose](https://docs.docker.com/compose/) para levantar base de datos, backend y frontend con un solo comando.

1. Copiar los archivos de entorno como se describe en la sección anterior.
2. Crear un archivo `docker-compose.yml` como el siguiente:

```yaml
version: "3.8"
services:
  db:
    image: postgis/postgis:16-3.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: entrelibros

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/entrelibros
      FRONTEND_URL: http://localhost:3000
      JWT_SECRET: devsecret
    ports:
      - "4000:4000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    environment:
      PUBLIC_API_BASE_URL: http://localhost:4000
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

3. Ejecutar los servicios:

```bash
docker-compose up --build
```

Esto expondrá el backend en `http://localhost:4000`, el frontend en `http://localhost:3000` y PostGIS en `localhost:5432`.

## Entornos de producción y desarrollo

Para cada entorno crea un archivo de variables en la raíz del proyecto:

- `.env.production` para producción
- `.env.development` para desarrollo

Estos archivos no se versionan (revisa `.env.production.example` y `.env.development.example` como guía) e incluyen valores como `DOCKERHUB_USER`, `JWT_SECRET`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `FRONTEND_URL` y `PUBLIC_API_BASE_URL`.

Ejemplos de Docker Compose:

```yaml
# docker-compose.production.yml
version: "3.8"
services:
  backend:
    image: ${DOCKERHUB_USER}/entrelibros-backend:prod
    env_file: .env.production
  frontend:
    image: ${DOCKERHUB_USER}/entrelibros-frontend:prod
    env_file: .env.production
  db:
    image: postgis/postgis:16-3.4
    env_file: .env.production
```

```yaml
# docker-compose.development.yml
version: "3.8"
services:
  backend:
    image: ${DOCKERHUB_USER}/entrelibros-backend:dev
    env_file: .env.development
  frontend:
    image: ${DOCKERHUB_USER}/entrelibros-frontend:dev
    env_file: .env.development
  db:
    image: postgis/postgis:16-3.4
    env_file: .env.development
```

Para levantar cada entorno:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d
docker compose --env-file .env.development -f docker-compose.development.yml up -d
```

## Tests

```bash
npm test               # ejecuta backend y frontend
npm run test:backend   # prepara DB + pruebas backend
npm run test:frontend  # pruebas frontend
```

Las pruebas del backend ejecutan las migraciones antes de correr y cada test usa una transacción con rollback para no dejar datos residuales.

## Migraciones

Para ejecutar manualmente las migraciones del backend:

```bash
npm run migrate
```

## CI

Los pull requests ejecutan un flujo de CI que:

1. Instala dependencias.
2. Instala y levanta Postgres.
3. Crea una base de datos de pruebas y corre las migraciones.
4. Ejecuta `npm test`.

El flujo falla si falta una migración o si las pruebas dejan datos sin limpiar.

## Variables de entorno

No se deben commitear credenciales reales. Usa `backend/.env.example` y `frontend/.env.example` como guía y provee valores reales mediante variables de entorno del entorno de ejecución o del runner de CI.

Principales variables:

- `DATABASE_URL`: Cadena de conexión de PostGIS utilizada por el backend. Ejemplo: `postgres://postgres:postgres@localhost:5432/entrelibros`.
- `JWT_SECRET`: clave secreta para firmar y verificar tokens JWT.
- `FRONTEND_URL`: URL del frontend que el backend permite para CORS. Ejemplo: `http://localhost:3000`.
- `PUBLIC_API_BASE_URL`: URL del backend que el frontend consulta. Ejemplo: `http://localhost:4000`.
- `API_BASE_URL`: URL base de la API utilizada en la documentación de Swagger (opcional, por defecto `http://localhost:4000` o `http://localhost:<PORT>`).
- `PORT`: Puerto en el que se expone el backend (opcional, por defecto `4000`). Ejemplo: `4000`.
