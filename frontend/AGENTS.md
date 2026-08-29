# AGENTS de frontend

Estas reglas complementan las del `AGENTS.md` raíz y aplican a todo `frontend/`.

- La aplicación se construye con React y Rsbuild. Las variables públicas se sustituyen en build/dev y usan el prefijo `PUBLIC_`.
- Después de cambiar `.env` o `.env.local`, reinicia el servidor de desarrollo y confirma el bundle generado; `document.documentElement.dataset.apiMode` muestra el modo resuelto.
- `PUBLIC_API_USE_MOCKS=true` activa MSW/mock para el flujo compatible. Con `false` se usa API y Socket.IO reales mediante el proxy `/api` y `/socket.io`.
- Mantén las traducciones sincronizadas y no hardcodees errores visibles.
- Vitest/Testing Library no sustituye una comprobación en navegador: para cookies, caché, proxy y variables públicas usa la guía de recuperación.

Comandos desde la raíz:

```bash
npm run test:frontend
npm run typecheck -w frontend
npm run lint -w frontend
npm run stylelint -w frontend
npm run format:frontend
npm run build -w frontend
```
