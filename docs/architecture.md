# Architecture

```text
Browser
  React / Rsbuild -- HTTP /api ----> Express routes --> services/repositories
  React / Rsbuild -- Socket.IO ----> Socket rooms/events        |
                                                          PostgreSQL/PostGIS
```

El runtime local empieza en `frontend/src/App.tsx` y `backend/src/index.ts`.
`backend/src/app.ts` monta rutas HTTP, CORS, CSRF, Helmet, OpenAPI y el manejo
de errores; `backend/src/socket.ts` autoriza rooms y entrega eventos. Los
repositories son la frontera de SQL y `backend/migrations/` es la historia
append-only del esquema.

Docker, Compose y GitHub Actions describen empaquetado y verificación. MSW es
una alternativa de frontend para demo, no otro backend. AWS, S3, OpenID,
rate-limiting, MFA, backup/restore probado y moderación avanzada aparecen en el
TFG como objetivo, contexto o futuro; no son afirmaciones de este runtime.
