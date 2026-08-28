# Guía de actualización de documentación

## Al cambiar una funcionalidad

1. Revisa `AGENTS.md` raíz y el agente más cercano.
2. Busca nombres antiguos con `rg` en código, README, docs, workflows y OpenSpec.
3. Confirma la fuente de verdad: scripts, rutas, variables, migraciones y tests.
4. Actualiza README local, documento técnico, troubleshooting y backlog según el alcance.
5. Separa comportamiento actual de historia y anota fecha/hash solo cuando sea útil.
6. Verifica enlaces relativos y comandos desde la raíz.
7. Ejecuta formato, tests proporcionales y `git diff --check`.

## Checklist de entrega

- [ ] No quedan rutas, variables o scripts inexistentes.
- [ ] Las migraciones documentadas coinciden con `backend/migrations/`.
- [ ] Mock, demo, legacy y persistencia están diferenciados.
- [ ] Se actualizó `docs/backlog.md` sin duplicados.
- [ ] El OpenSpec tiene tareas marcadas y valida en modo estricto.
- [ ] El diff no contiene secretos ni cambios runtime accidentales.
- [ ] `git status --short` queda limpio después del commit.
