# EntreLibros Monorepo

Este repositorio contiene el frontend y backend del proyecto EntreLibros.

## Desarrollo sin Docker

1. **Instalar dependencias**
   ```bash
   npm install
   ```
2. **Preparar base de datos y migraciones**
   ```bash
   npm run migrate -w backend
   ```
   Crea la base definida en `backend/.env` y aplica las migraciones.
3. **Levantar servidores**
   ```bash
   npm run dev -w backend
   npm run dev -w frontend
   ```
   El frontend obtiene la URL del backend desde `PUBLIC_API_BASE_URL` (ver `frontend/.env.example`).

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
npm run migrate -w backend
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
