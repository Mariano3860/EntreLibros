# Frontend de EntreLibros

Cliente React 19 construido con Rsbuild. Se sirve en desarrollo en el puerto `3000` y consume el backend a través de los proxies `/api` y `/socket.io`.

## Ejecutar

Desde la raíz:

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

## Variables públicas

Las variables del navegador usan el prefijo `PUBLIC_` y se resuelven al iniciar Rsbuild o al construir el bundle. Para probar mocks:

```env
PUBLIC_API_USE_MOCKS=true
```

Reinicia el servidor después de modificar `.env`/`.env.local`. Comprueba en la consola:

```js
document.documentElement.dataset.apiMode
```

`mock` indica MSW; `real` indica API/Socket.IO. Un valor `undefined` significa que el bundle no expuso la configuración esperada, no que el backend haya cambiado de modo.

## Mensajes

En modo real, `/messages` necesita sesión, backend, migraciones y `GET /api/messages` disponible. El bot persistente se crea por migración y aparece como “Bot”; al abrirlo se consulta la conversación guardada. En modo mock, el flujo de demostración no persiste en PostgreSQL.

## Tests y calidad

```bash
npm run test:frontend
npm run typecheck:frontend
npm run format:frontend
npm run complete-check:frontend
```

Vitest/Testing Library prueba componentes y handlers MSW. Para validar el navegador real, revisa proxy, cookies, caché, variables y WebSocket con [`docs/recovery-baseline.md`](../docs/recovery-baseline.md).

## Documentación relacionada

- [`../docs/arquitectura.md`](../docs/arquitectura.md)
- [`../docs/messaging-bubbles.md`](../docs/messaging-bubbles.md)
- [`../docs/troubleshooting.md`](../docs/troubleshooting.md)
- [`../docs/guia-documentacion.md`](../docs/guia-documentacion.md)
