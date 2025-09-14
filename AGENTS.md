# AGENTS

Estas instrucciones aplican a todo el repositorio.

## Flujo de trabajo
1. Realiza tus cambios en la rama actual (no crees nuevas ramas).
2. Si trabajas solo en **backend**, ejecuta los tests correspondientes:
   ```bash
   npm run test:backend
   ```
   Si trabajas solo en **frontend**, ejecuta:
   ```bash
   npm run test:frontend
   ```
3. Antes de commitear y crear la PR, corre las verificaciones generales:
   ```bash
   npm run test:backend
   npm run test:frontend
   npm run format:backend
   npm run format:frontend
   ```
4. Actualiza el backlog de documentación antes de abrir la PR:
   - Revisa `docs/backlog.md` y comprueba si ya existe una entrada para la funcionalidad.
   - Si existe, marca la fila como `Hecho` y describe brevemente lo realizado.
   - Si solo está parcialmente implementada, actualiza la descripción y crea una nueva fila para lo pendiente.
   - Si no existe, agrega una nueva entrada manteniendo el estilo y evitando duplicados.
5. Verifica que el árbol de trabajo esté limpio con `git status --short`.
6. Si algún comando falla, corrige los errores y vuelve a ejecutar.

## Estilo y herramientas
- Usa `rg` para buscar en el código en lugar de `grep` o `ls -R`.
- Los archivos se formatean automáticamente con Prettier; evita editar el formato manualmente.
- Los mensajes de commit deben ser claros, en tiempo presente y concisos.

## AGENTS anidados
Si modificas archivos dentro de un directorio que contenga su propio `AGENTS.md`, respeta las instrucciones adicionales de ese archivo.

## En caso de duda
- Prefiere código simple y legible.
- Si añades TODOs, explícalos claramente.
- Ejecuta siempre los comandos de verificación indicados antes de solicitar un PR.
