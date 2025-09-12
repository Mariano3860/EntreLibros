# EntreLibros Monorepo

Este repositorio contiene el frontend y backend del proyecto EntreLibros.

## Desarrollo sin Docker

1. **Instalar dependencias**
   ```bash
   npm install
   ```
2. **Configurar variables de entorno**
   - Copiar `backend/.env.example` a `backend/.env` y ajustar `DATABASE_URL`.
   - Copiar `backend/.env.test.example` a `backend/.env.test` para las pruebas.
   - Revisar `frontend/.env.example` para configurar el frontend.
3. **Preparar base de datos y migraciones**
   ```bash
   npm run migrate
   ```
   Crea la base definida en `backend/.env` y aplica las migraciones.
4. **Levantar servidores**
   ```bash
   npm run dev:backend   # backend
   npm run dev:frontend  # frontend
   # o para levantar ambos en paralelo:
   npm run dev
   ```
El frontend obtiene la URL del backend desde `PUBLIC_API_BASE_URL`.

## Desarrollo con Docker Compose

El proyecto puede ejecutarse con [Docker Compose](https://docs.docker.com/compose/) para levantar base de datos, backend y frontend con un solo comando.

1. Copiar los archivos de entorno como se describe en la sección anterior.
2. Crear un archivo `docker-compose.yml` como el siguiente:

```yaml
version: '3.8'
services:
  db:
    image: postgres:14
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

Esto expondrá el backend en `http://localhost:4000`, el frontend en `http://localhost:3000` y PostgreSQL en `localhost:5432`.

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

- `DATABASE_URL`: Cadena de conexión de PostgreSQL utilizada por el backend. Ejemplo: `postgres://postgres:postgres@localhost:5432/entrelibros`.
- `FRONTEND_URL`: URL del frontend que el backend permite para CORS. Ejemplo: `http://localhost:3000`.
- `PUBLIC_API_BASE_URL`: URL del backend que el frontend consulta. Ejemplo: `http://localhost:4000`.
- `PORT`: Puerto en el que se expone el backend (opcional, por defecto `4000`). Ejemplo: `4000`.
