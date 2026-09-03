# Guia de documentacion

La documentacion describe el producto que existe hoy y los limites comprobables.
No conserva instrucciones para rutas, scripts, variables o servicios inexistentes.

## Al cambiar una funcionalidad

1. Revisa las instrucciones del repositorio y del paquete afectado.
2. Confirma el comportamiento en codigo, contratos, migraciones, pruebas y UI.
3. Actualiza README local, estado actual, backlog y roadmap cuando cambie el alcance.
4. Registra rutas HTTP, eventos Socket.IO, migraciones, variables `PUBLIC_*` y
   semantica de metricas cuando corresponda.
5. Declara privacidad, retencion, fuera de alcance y riesgos residuales.
6. Comprueba enlaces Markdown, nombres de scripts y datos de demo.
7. Ejecuta verificaciones proporcionales, `git diff --check` y validacion OpenSpec.

## Lista de revision

- [ ] Las rutas, variables, migraciones y comandos existen.
- [ ] Los estados de carga, vacio y error estan descritos.
- [ ] API real, modo demo, dataset sintetico y persistencia estan diferenciados.
- [ ] Los errores publicos usan claves de traduccion.
- [ ] No aparecen secretos, tokens, dumps, direcciones ni datos personales.
- [ ] Los enlaces Markdown apuntan a archivos existentes.
- [ ] Las capacidades futuras no aparecen como disponibles.
- [ ] Las instrucciones se pueden ejecutar desde un entorno limpio.

## Fuentes de verdad

- Codigo y `package.json`: comportamiento y comandos.
- `backend/migrations/`: esquema aplicado.
- `backend/openapi.json`: contrato HTTP publicado.
- `docs/estado-actual.md`: capacidades verificadas.
- `docs/backlog.md`: trabajo pendiente.
- `docs/roadmap.md`: evolucion posterior.
- `docs/tfg-browser-checklist.md`: evidencia manual y pendientes.
