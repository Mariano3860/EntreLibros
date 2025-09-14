# AGENTS

Estas instrucciones aplican a todo el repositorio.

## Flujo de trabajo
1. Realiza tus cambios en la rama actual (no crees nuevas ramas).
2. Ejecuta el chequeo completo antes de commitear:
   ```bash
   npm run complete-check
   ```
   Este comando ejecuta ESLint, Prettier, TypeScript y los tests tanto en **backend** como en **frontend**.
3. Verifica que el árbol de trabajo esté limpio con `git status --short`.
4. Si el chequeo falla, corrige los errores y vuelve a ejecutar.

## Estilo y herramientas
- Usa `rg` para buscar en el código en lugar de `grep` o `ls -R`.
- Los archivos se formatean automáticamente con Prettier; evita editar el formato manualmente.
- Los mensajes de commit deben ser claros, en tiempo presente y concisos.
- Las respuestas de error deben incluir claves de traducción para i18n, por ejemplo `{ error: 'Code', message: 'namespace.key' }`.
- Evita usar el tipo `any`; prefiere tipos específicos.

## Buenas prácticas
- Mantén la lógica de acceso a datos en repositorios dedicados y las rutas enfocadas en la capa HTTP.

## AGENTS anidados
Si modificas archivos dentro de un directorio que contenga su propio `AGENTS.md`, respeta las instrucciones adicionales de ese archivo.

## En caso de duda
- Prefiere código simple y legible.
- Si añades TODOs, explícalos claramente.
- Ejecuta siempre `npm run complete-check` antes de solicitar un PR.
