# AGENTS de documentación

Estas reglas complementan las del `AGENTS.md` raíz y aplican a `docs/`.

- Separa hechos actuales de historia: etiqueta baselines, PRs y decisiones antiguas como históricos.
- Verifica nombres de rutas, variables, scripts, migraciones y enlaces contra el código antes de documentarlos.
- No llames “E2E de navegador” a Vitest, Testing Library o pruebas con MSW.
- Cada cambio funcional relevante debe actualizar el backlog y, si corresponde, estado actual, roadmap y procedimiento.
- No incluyas secretos, tokens, dumps de usuarios ni datos personales.
- Usa Markdown claro, títulos estables y enlaces relativos existentes. Comprueba `git diff --check` antes del commit.
