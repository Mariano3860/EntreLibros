# AGENTS

Estas instrucciones aplican a todo el repositorio. Si existe otro `AGENTS.md` en el directorio del archivo que vas a modificar, se aplican también sus reglas y las más cercanas al archivo tienen precedencia.

## Fuentes de verdad y alcance

- El código, `package.json`, configuraciones, migraciones y workflows describen el comportamiento implementado.
- El `README.md` raíz es la puerta de entrada para instalar y ejecutar el monorepo.
- Los README locales explican el trabajo dentro de cada paquete.
- `docs/` contiene arquitectura, operación, estado actual, decisiones y procedimientos.
- `openspec/changes/` contiene el plan de cambios en curso; no reemplaza la documentación operativa.
- Cuando una implementación cambia rutas, variables, migraciones o flujos, actualiza también el README o documento correspondiente y `docs/backlog.md`.

## Flujo de trabajo

1. Trabaja en la rama actual salvo que el usuario pida explícitamente una rama nueva.
2. No hagas merge de Pull Requests. El merge final lo realiza el usuario.
3. Antes de cambiar código, revisa los `AGENTS.md` aplicables, `git status --short` y el OpenSpec asociado.
4. Usa `rg` para buscar y `apply_patch` para editar archivos. No uses comandos destructivos como `git reset --hard` o `git checkout --`.
5. Mantén los cambios acotados, explica los TODOs y no agregues secretos ni credenciales.
6. Los cuerpos de Pull Request deben usar Markdown nativo de GitHub, con saltos de línea reales; no escribas secuencias `\\n` literales.

## Comandos canónicos

Requiere Node `>=22.19.0 <23` y npm. Desde la raíz:

```bash
npm install
npm run dev
npm run test:backend
npm run test:frontend
npm run format:backend
npm run format:frontend
npm run typecheck -w backend
npm run typecheck -w frontend
npm run build -w backend
npm run build -w frontend
npm run migrate
npm run complete-check
```

`npm run migrate` necesita PostgreSQL accesible mediante el entorno del backend. Las migraciones son acumulativas y no deben editarse después de aplicadas; agrega una nueva para corregir el esquema.

## Tipos de verificación

- Backend: Vitest ejecuta pruebas unitarias, de integración y de servicio según el paquete.
- Frontend: Vitest/Testing Library prueba componentes y flujos con MSW; no es una prueba de navegador real.
- E2E de servicio: comprueba HTTP, Socket.IO y persistencia con servicios levantados.
- E2E de navegador: valida manualmente la aplicación en un navegador, cookies, proxy, caché y variables públicas. Sigue `docs/recovery-baseline.md`.

Si modificas solo backend o frontend, ejecuta su suite; antes de entregar cambios ejecuta las verificaciones generales indicadas arriba y corrige cualquier fallo.

## Documentación

Al terminar una funcionalidad, verifica rutas, variables `PUBLIC_*`, comandos, migraciones, eventos Socket.IO, capturas o instrucciones manuales y enlaces relativos. Actualiza el backlog sin duplicar entradas. Si el cambio tiene alcance o decisiones relevantes, registra el estado en `docs/estado-actual.md`, el destino en `docs/roadmap.md` y el procedimiento en `docs/guia-documentacion.md`.

## Estilo

- Prettier, ESLint y Stylelint son las herramientas de formato y lint.
- Evita `any`; usa tipos explícitos o `unknown`.
- Los errores que llegan al frontend deben ser claves de i18n cuando atraviesan la API.
- Los mensajes de commit deben ser claros, concisos y en tiempo presente.

## Estado final

Antes de entregar, ejecuta `git diff --check`, valida el OpenSpec, revisa el diff manualmente y confirma `git status --short`. No solicites merge: el usuario conserva esa responsabilidad.
