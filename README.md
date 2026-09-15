# EntreLibros

Aplicación web para compartir y descubrir libros, explorar rincones y conectar
lectores.

## Requisitos

- Node.js `>=22.19.0 <23` y npm.
- Docker con Docker Compose.

## Iniciar en local

Desde la raíz del repositorio:

```bash
npm install
cp backend/.env.example backend/.env
docker compose -f docker-compose.postgis.yml up -d
npm run migrate
npm run dev
```

Espera a que PostgreSQL esté listo antes de ejecutar las migraciones. La
configuración de ejemplo conecta con la base local `entrelibros` que inicia
Docker Compose. Para otro entorno, ajusta `DATABASE_URL` en `backend/.env`.

La aplicación queda disponible en:

- Web: <http://localhost:3000>
- API: <http://localhost:4000>

Para detener la aplicación, pulsa `Ctrl+C`. Para detener la base de datos:

```bash
docker compose -f docker-compose.postgis.yml down
```

## Comandos útiles

```bash
npm run test:backend
npm run test:frontend
npm run build:backend
npm run build:frontend
```
