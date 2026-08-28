# AGENTS de backend

Estas reglas complementan las del `AGENTS.md` raíz y aplican a todo `backend/`.

- Backend Node.js, TypeScript, ESM, Express, PostgreSQL/PostGIS y Socket.IO.
- Los errores públicos deben ser claves de i18n; no expongas mensajes internos, SQL ni secretos.
- Evita `any`; modela entradas y salidas con tipos explícitos o `unknown` validado.
- Las migraciones SQL son append-only. Comprueba idempotencia, transacciones, índices y compatibilidad con datos existentes.
- En mensajería verifica autenticación, autorización por conversación, salas, reconexión, cursores, deduplicación y persistencia antes de emitir eventos.
- El bot persistido se crea mediante la migración vigente y la conversación se obtiene de forma idempotente; el canal legacy no debe confundirse con esa conversación.

Comandos habituales desde la raíz:

```bash
npm run test:backend
npm run typecheck:backend
npm run lint:backend
npm run format:backend
npm run build:backend
npm run migrate
```

Si una prueba requiere PostgreSQL, documenta la dependencia y limpia los datos de prueba sin modificar migraciones aplicadas.
