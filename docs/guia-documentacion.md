# Guía de documentación

La documentación debe explicar el producto que existe hoy y los límites que una persona puede comprobar en el repositorio. No debe conservar instrucciones para rutas, scripts, variables o servicios que ya no existen.

## Al cambiar una funcionalidad

1. Revisa las instrucciones del repositorio y del paquete afectado.
2. Confirma el comportamiento en código, contratos, migraciones, pruebas y UI.
3. Actualiza el README local si cambian comandos o variables.
4. Actualiza `docs/estado-actual.md` si cambia una capacidad disponible.
5. Actualiza `docs/backlog.md` y `docs/roadmap.md` solo si cambia el alcance.
6. Añade la ruta, evento, migración o procedimiento correspondiente.
7. Ejecuta comprobaciones proporcionales y `git diff --check`.

## Lista de revisión

- [ ] Las rutas, variables, migraciones y comandos existen.
- [ ] Los estados de carga, vacío y error están descritos.
- [ ] API real, modo demo, datos sintéticos y persistencia están diferenciados.
- [ ] Los errores públicos usan claves de traducción.
- [ ] No aparecen secretos, tokens, dumps, direcciones ni datos personales.
- [ ] Los enlaces Markdown apuntan a archivos existentes.
- [ ] La documentación no presenta capacidades futuras como disponibles.
- [ ] Las instrucciones se pueden ejecutar desde un entorno limpio.

## Fuentes de verdad

- Código y `package.json`: comportamiento y comandos.
- `backend/migrations/`: esquema aplicado.
- `backend/openapi.json`: contrato HTTP publicado.
- `docs/estado-actual.md`: capacidades verificadas.
- `docs/backlog.md`: trabajo pendiente.
- `docs/roadmap.md`: evolución posterior.
