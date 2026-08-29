# Diseño de la recuperación de EntreLibros

## Contexto

Consulta `proposal.md` para la motivación y `specs/*/spec.md` para los contratos de comportamiento. El repositorio es un monolito modular TypeScript con React/Rsbuild, Express/Socket.IO y PostgreSQL/PostGIS. Las comprobaciones estáticas, las compilaciones y las suites de pruebas pasan cuando Node 22 apunta a la instancia correcta de PostGIS; la configuración local puede dirigir Node a otro servicio PostgreSQL y el frontend de desarrollo resuelve `/api` sin proxy. El Compose de producción referencia archivos de entorno inexistentes e imágenes remotas, expone nginx en el puerto incorrecto y no puede inyectar variables del frontend después de la compilación.

La base de datos contiene usuarios, libros, publicaciones, imágenes, rincones comunitarios y mensajes de contacto. No tenía modelos persistentes para conversaciones, mensajes, acuerdos, notificaciones, denuncias ni moderación. Los agregados comunitarios y la mensajería todavía usan mocks, mientras que la PR #138 incorpora principalmente en el estado del cliente un flujo de acuerdos con observaciones pendientes. Las instrucciones del repositorio exigen trabajar en la rama actual, verificar todo, actualizar el backlog y no crear ramas automáticamente. Además, el usuario exige que el agente nunca haga merge de una PR.

## Objetivos y exclusiones

**Objetivos:**

- Convertir el repositorio en un MVP desplegable mediante entregas revisables, con dependencias y puertas de aprobación humana explícitas.
- Conservar la arquitectura de monolito modular y hacer que PostgreSQL sea la fuente de verdad del estado del producto.
- Completar la PR #138 como una entrega vertical coherente de mensajería privada y acuerdos de intercambio versionados, en lugar de dejar un mock pulido.
- Usar los mismos contratos de versiones, rutas, migraciones, seguridad y salud en desarrollo local, CI y producción.
- Mantener las migraciones incrementales, proteger los datos locales existentes y hacer posible la recuperación mediante restauraciones verificadas.

### Límite de alcance definido por el TFG

El MVP funcional está delimitado por el TFG final local. Su flujo mínimo demostrable es: cuenta, perfil y privacidad de ubicación; rincones comunitarios de libros en un mapa; publicaciones de libros ofrecidos o buscados con metadatos mínimos normalizados; búsqueda por filtros y cercanía; mensajería privada 1:1; acuerdo de intercambio con lugar, horario, confirmación y recordatorio dentro de la aplicación; y notificaciones in-app básicas. El trabajo técnico solo se incluye cuando habilita, protege, prueba o despliega ese flujo.

| Clasificación | Regla | Ejemplos |
| --- | --- | --- |
| MVP | Necesario para demostrar una capacidad del TFG; se implementa cuando sus dependencias lo permiten. | Perfil y privacidad, rincones/mapa, publicaciones/búsqueda, mensajería, acuerdos y notificaciones básicas. |
| Soporte MVP | No es una funcionalidad de usuario, pero permite ejecutar o explicar el MVP de forma segura. | Migraciones, autenticación, rutas same-origin, tests, CI, configuración mínima de producción, backup/restauración y documentación. |
| POST-MVP | Es una ampliación valiosa retirada de este cambio; necesita su propia OpenSpec aprobada. | Reputación, denuncias/moderación, métricas avanzadas, retención/exportación, elección de proveedores, observabilidad avanzada y crecimiento. |

La lista de tareas es la puerta de ejecución. Este cambio no contiene tareas ejecutables `POST-MVP`. Las capacidades diferidas solo permanecen en el roadmap/backlog; una OpenSpec futura deberá explicar su propósito, valor para el usuario, relación con el TFG, evidencia de aceptación y entrega acotada antes de implementarlas.

### Capacidades diferidas

Quedan fuera de este cambio: rate limiting avanzado, recuperación de contraseña, reputación, flujos de moderación y denuncias, agregados y sugerencias comunitarias, selección de proveedores y escaneo de malware, observabilidad avanzada, retención/exportación/anonimización, iniciativas de crecimiento y disputas posteriores al intercambio. No son trabajo MVP faltante.

**Exclusiones:**

- Dividir el sistema en microservicios o adoptar infraestructura de eventos distribuida.
- Recuperar contraseñas en texto plano o publicar credenciales de producción predeterminadas.
- Hacer merge automático de la PR #138 o de cualquier PR posterior.
- Incluir en la PR #138 cambios no relacionados de entorno, dependencias o despliegue.
- Tratar alianzas, donaciones, aplicaciones móviles nativas o experimentos de crecimiento como bloqueantes del MVP.

## Decisiones

### 1. Entregas con puertas de control y conservación de la PR #138

La OpenSpec es un programa maestro, pero la implementación se divide en entregas revisables:

1. **Base de runtime:** normalizar Node 22, configuración, proxy de desarrollo, preflight de PostGIS y migraciones deterministas. El usuario hace el merge manual.
2. **Recuperación de la PR #138:** actualizar la rama existente desde main, resolver cada hilo de revisión y completar mensajería privada más persistencia de acuerdos como una entrega vertical. La PR conserva su historial y el usuario decide el merge.
3. **Completar primero el MVP:** entregar identidad/perfil, catálogo, mapa/comunidad, mensajería, acuerdos y notificaciones básicas en PRs pequeñas orientadas a capacidades. Las ampliaciones de confianza y el resto del POST-MVP quedan diferidos.
4. **Producción y operación:** incorporar despliegue, backup/restauración, observabilidad, E2E y runbooks cuando el modelo de datos esté estable.

En cada límite de PR, el agente se detiene después de verificar, informa el estado restante de revisión/CI y comunica cuándo la siguiente acción es el merge manual. El trabajo continúa solo cuando el usuario dejó actualizada la rama objetivo o la rama existente de la PR está disponible; el agente no crea ramas especulativas.

No se eligió hacer cherry-pick de #138 a una rama nueva porque perdería la conversación existente de la PR y dificultaría auditar sus hilos. Tampoco se agregan todas las correcciones de recuperación a #138, porque haría inseguras la revisión y la reversión.

### 2. Monolito modular con límites de dominio explícitos

Los módulos del backend permanecen en un único proceso desplegable, pero separan validación de rutas, servicios de aplicación, repositorios y políticas de autorización para identidad, catálogo, comunidad, mensajería, acuerdos y confianza/seguridad. PostgreSQL sigue siendo la fuente transaccional de verdad; Socket.IO es transporte, no almacenamiento.

No se adoptan microservicios para chat y notificaciones porque la escala y el contexto actual no justifican transacciones distribuidas, más superficies de despliegue ni complejidad de consistencia eventual.

### 3. Rutas del navegador same-origin en todos los entornos

El cliente usa por defecto rutas relativas `/api` y `/socket.io`. Rsbuild proxifica esas rutas al backend local durante el desarrollo y nginx las proxifica al servicio backend en producción. `PUBLIC_API_BASE_URL` queda como opción documentada para entornos explícitamente cross-origin y se valida durante la compilación. Socket.IO deriva del mismo origen salvo sobrescritura intencional.

Esto elimina el conflicto entre `.env`, `.env.local`, `.env.development.local` y `.env.production`, y evita suponer que las variables de runtime pueden cambiar un bundle estático ya construido.

### 4. Node 22 como versión única de herramientas y contenedores

Node 22 es la única versión de `.nvmrc`, engines de los paquetes, CI y Dockerfiles. Docker Compose construye por defecto imágenes versionadas desde el commit checkout; se permiten sobrescrituras de imágenes de registro para el despliegue. nginx expone internamente el puerto 80 y lo mapea al puerto público configurado. PostgreSQL no se publica en producción.

No se migra inmediatamente a Node 24 porque el repositorio declara `<24`, las pruebas verificadas corrieron en 22 y el cambio no aporta valor de producto. Una actualización posterior puede aislarse.

### 5. Preflight explícito y job de migraciones

El arranque local verifica dirección del servidor, nombre de base, cantidad de migraciones y disponibilidad de PostGIS antes de migrar. Debe identificar conflictos de puertos en lugar de escribir silenciosamente en otra base de `localhost`. Las bases de desarrollo y test permanecen separadas.

Producción usa un job de migración de una sola ejecución protegido por un advisory lock. La disponibilidad del backend depende de la conectividad de base y de la versión de esquema esperada. Las migraciones son append-only después del merge; las correcciones usan una migración nueva.

### 6. Persistencia transaccional de mensajería y acuerdos

La entrega vertical de #138 incorpora estos registros lógicos:

- `conversations` y `conversation_participants` para pertenencia y ciclo de vida.
- `messages` con clave de idempotencia del cliente, secuencia estable y metadatos de lectura; los adjuntos referencian una abstracción de almacenamiento.
- `exchange_agreements` para el estado actual y la versión optimista.
- `exchange_agreement_versions`, sus ítems y condiciones para propuestas inmutables.
- `agreement_events` para actor, transición, momento y motivo.

La aceptación bloquea el acuerdo actual y las publicaciones relevantes en una transacción, valida la versión esperada, registra la aceptación de ambas partes y reserva las publicaciones atómicamente. La cancelación libera reservas cuando corresponde. Los conflictos de API devuelven la representación actual para que el cliente reemplace el estado obsoleto. Los stores del frontend contienen snapshots del servidor y estado transitorio de UI; `mockConversations` no puede inicializar producción.

No se conservan acuerdos solo en estado local porque los clientes concurrentes, las reconexiones y las disputas necesitan el historial completo de versiones.

### 7. Persistir primero y publicar realtime después

Los endpoints REST manejan historial y comandos. Tras una transacción exitosa, Socket.IO emite un evento con id y versión del recurso a una sala cuya pertenencia autoriza el servidor. Los clientes invalidan o vuelven a consultar las queries autoritativas. Una persistencia fallida no emite eventos de éxito. La reconexión usa historial paginado y cursores de secuencia.

No se conserva `io.emit` global filtrado por cliente porque filtra metadatos y no puede garantizar la privacidad de la conversación.

### 8. Vistas comunitarias derivadas de consultas acotadas

Las estadísticas, feed, actividad y sugerencias comunitarias se derivan de tablas persistentes o agregados actualizables. Los endpoints de mapa y cercanía exigen límites o radio, imponen tamaños máximos de página, seleccionan solo los campos necesarios y exponen ubicaciones redondeadas por privacidad. Las métricas de payload grande y consultas lentas son comprobaciones de release. Los mocks estáticos solo quedan disponibles para tests aislados del frontend o un modo demo habilitado explícitamente.

### 9. Políticas centralizadas de identidad, autorización y confianza

El middleware de autenticación establece la identidad; las políticas de dominio deciden acceso por propiedad, participación o moderación. Las rutas mutables de comunidad y verificación quedan protegidas. Cookies, CORS y CSRF de producción siguen los valores same-origin. Los rate limits distinguen operaciones anónimas, autenticadas y costosas. La recuperación de contraseña usa hashes de un solo uso con vencimiento y respuestas públicas neutras.

Las denuncias, acciones de moderación, notificaciones, valoraciones y bloqueos son persistentes. Un bloqueo impide nuevas interacciones directas y conserva la evidencia necesaria para denuncias existentes. Los errores públicos del backend son claves de i18n según las instrucciones del repositorio.

### 10. Abstracción de entrega externa y archivos

El email y el almacenamiento de adjuntos usan interfaces estrechas de proveedor. Los tests usan proveedores fake deterministas; el desarrollo local puede usar filesystem o captura; la configuración de producción elige un proveedor administrado. La base guarda metadatos y referencias, no payloads base64.

No se elige ahora un proveedor cloud concreto porque el destino de despliegue aún no está seleccionado y esa decisión no cambia los contratos de comportamiento.

### 11. Calidad y documentación como parte de cada entrega

Cada entrega actualiza migraciones, OpenAPI, tests de backend/frontend, cobertura E2E relevante y `docs/backlog.md`. CI ejecuta typecheck, lint, formato, tests, validación estricta de OpenSpec, migraciones desde esquema vacío y anterior, auditoría de dependencias y smoke tests de imágenes de producción. Los avisos React de los tests existentes se consideran defectos.

Los endpoints operativos separan liveness de readiness. Los logs estructurados usan ids de correlación y ocultan datos sensibles. Las métricas registran error, latencia y tamaño de respuesta por ruta normalizada. La retención y los simulacros de restauración se documentan antes de declarar la preparación para producción.

## Riesgos y compromisos

- **El cambio maestro es grande:** ejecutar capacidades por partes con puertas de PR explícitas; una sola parte aprobada no permite marcar completo el cambio general.
- **La PR #138 pasa de flujo cliente a entrega vertical:** limitarla a los prerrequisitos de mensajería/acuerdos, documentar migraciones y resolver cada hilo antes de pedir otra revisión.
- **Las migraciones pueden afectar datos antiguos:** probar desde vacío, esquema actual y snapshot anonimizado; hacer backup y verificar restauración antes de producción.
- **Las actualizaciones de dependencias pueden introducir regresiones:** actualizar dependencias directas en grupos pequeños, conservar lockfile determinista y ejecutar tests de contrato/E2E tras cada grupo.
- **El routing same-origin difiere de ejemplos con URL absoluta:** ofrecer una sobrescritura compatible, actualizar todos los ejemplos y validar configuraciones contradictorias.
- **La entrega realtime puede competir con transacciones:** emitir solo después del commit, incluir versiones y exigir que el cliente vuelva a consultar el estado autoritativo.
- **Moderación y retención dependen de decisiones de política:** usar valores conservadores, conservar auditoría separada y documentar configuración en lugar de suposiciones hard-coded.
- **Los proveedores externos no están decididos:** usar interfaces y bloquear la preparación de producción hasta pasar pruebas de éxito y fallo.
- **Los metadatos antiguos de saltos de línea pueden ocultar un árbol limpio:** normalizar atributos en un cambio aislado y revisado, verificando igualdad de blobs antes de modificar archivos reportados.

## Plan de migración

1. Capturar baseline: commits remotos/locales, hilos de la PR #138, versión de esquema, auditoría, tests, imágenes y verificación de backup/restauración.
2. Entregar runtime y documentación en una PR separada; detenerse y avisar al usuario para que haga el merge.
3. Tras el merge del usuario, actualizar la rama existente de #138 desde main sin perder historial. Agregar migraciones de mensajería/acuerdos, contratos backend, integración frontend y correcciones de revisión.
4. Verificar #138 desde bases vacías/actuales, dos clientes concurrentes, reconexiones y conflictos de versión. Hacer push, pedir nueva revisión y detenerse cuando solo quede el merge humano.
5. Después del merge de #138, entregar seguridad y capacidades restantes por dependencia, usando migraciones aditivas y respuestas compatibles.
6. Construir Compose/nginx de producción, migraciones one-shot, healthchecks, secretos, backup/restauración y observabilidad. Ejecutar smoke de staging y simulacro de rollback.
7. Reconciliar OpenAPI, backlog y OpenSpec; archivar solo cuando todos los requisitos y tareas estén verificados.

El rollback usa las imágenes inmutables anteriores junto con un punto de restauración verificado cuando una migración no es compatible hacia atrás. Después de aceptar datos en producción se prefieren migraciones forward-fix; no se ejecutan down-migrations destructivas automáticamente.

## Preguntas abiertas

- ¿Qué plataforma de hosting y gestor de secretos se usará primero?
- ¿Qué proveedor de email enviará recuperación y notificaciones?
- ¿Qué proveedor de object storage y escaneo de malware alojará adjuntos?
- ¿Qué retención y roles de moderación exige la jurisdicción inicial?

Estas decisiones quedan aisladas tras configuración o interfaces de proveedor y pueden tomarse antes de la entrega de producción sin cambiar los contratos de dominio ni el orden de tareas.
