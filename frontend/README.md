# Frontend de EntreLibros

Cliente React 19 construido con Rsbuild. Se sirve en el puerto `3000` y consume
el backend mediante los proxies `/api` y `/socket.io`.

## Ejecutar

Desde la raiz:

```bash
npm install
npm run dev:frontend
```

O dentro de `frontend/`:

```bash
npm run dev
npm run build
npm run start
```

## Variables publicas

Las variables del navegador usan el prefijo `PUBLIC_` y se resuelven al iniciar
Rsbuild o al construir el bundle:

```env
PUBLIC_API_USE_MOCKS=false
PUBLIC_API_BASE_URL=http://localhost:4000/api
```

`mock` indica MSW y `real` indica API/Socket.IO. Comprueba
`document.documentElement.dataset.apiMode` y reinicia tras cambiar variables.

## Acceso publico y rutas privadas

Inicio, libros, detalles, Comunidad, Mapa, Ayuda y perfiles publicos se pueden
leer sin sesion. Las mutaciones muestran la modal comun de autenticacion y
conservan un `returnTo` local seguro al ir a login o registro. Las rutas
`/books/new`, `/books/mine`, `/messages`, `/profile` y `/stats` requieren sesion
y redirigen a login mientras explican el motivo del acceso.

## Recorridos MVP

Las rutas `/profile/:id`, `/messages`, `/map`, `/community` y `/stats` consumen
datos reales cuando mocks estan desactivados. El contacto desde publicacion/perfil
reutiliza conversaciones; reportes y outcomes se envian por sus rutas autenticadas.
El detalle y los resultados privados no exponen correo, calle, altura ni
coordenadas exactas.

## Tests y calidad

```bash
npm run test:frontend
npm run typecheck -w frontend
npm run format:frontend
npm run complete-check:frontend
```

Para el navegador real revisa [`../docs/tfg-browser-checklist.md`](../docs/tfg-browser-checklist.md)
y [`../docs/recovery-baseline.md`](../docs/recovery-baseline.md).
