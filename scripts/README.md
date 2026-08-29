# Scripts del repositorio

Los scripts auxiliares se ejecutan desde la raíz y no forman parte del runtime de la aplicación.

## `update-backlog-prs.js`

Actualiza la sección de PRs mergeadas de `docs/backlog.md` usando la API de GitHub. Revisa el diff antes de conservar el resultado: las secciones manuales deben mantenerse y el script no debe ejecutarse con un token impreso en consola.

```bash
GITHUB_TOKEN=tu_token node scripts/update-backlog-prs.js
```

El token es opcional, pero GitHub aplica límites más bajos sin autenticación. Verifica las dependencias reales del script antes de usarlo; la documentación no asume que `@octokit/rest` esté instalado si no aparece en `package.json`.

Los scripts de build, migración y OpenAPI pertenecen al paquete backend y se documentan en [`../backend/README.md`](../backend/README.md). Para cambios de scripts actualiza también [`AGENTS.md`](AGENTS.md) y ejecuta `git diff --check`.
