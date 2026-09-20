# Guía técnica profunda del MVP de EntreLibros

> **Propósito.** Este documento sirve para entender, estudiar y defender técnicamente el MVP. Responde cuatro preguntas en cada tema: **qué problema resuelve, por qué se eligió esta solución, cómo funciona y dónde se verifica**.
>
> **Corte técnico:** 2026-09-20, rama `feat/enrich-local-demo-seed`, commit `5881578`. El árbol de trabajo tenía cambios locales no relacionados con esta guía; por eso esta referencia describe las rutas y el comportamiento del checkout, no una etiqueta de release ni un despliegue certificado.

## 1. Cómo usar esta guía

EntreLibros no es solo un catálogo. Su hipótesis de producto es que la circulación local de libros mejora si se resuelven conjuntamente tres fricciones: descubrir libros o Rincones, coordinar un encuentro y hacerlo sin exponer información sensible. El MVP convierte esa hipótesis en una aplicación web con persistencia real.

Hay tres etiquetas que conviene respetar al estudiar o exponer:

| Etiqueta            | Significado                                                                           | Ejemplo                                                                          |
| ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **MVP verificado**  | Está respaldado por el código, migraciones, pruebas o ejecución local.                | Un borrador se persiste por conversación y autor antes de enviarse.              |
| **TFG / intención** | Es un objetivo, análisis o arquitectura planteada en el Trabajo Final de Grado (TFG). | AWS, S3, OpenID Connect, MFA y backups operativos aparecen como diseño o futuro. |
| **Límite**          | Es una frontera explícita: no está implementado, depende del entorno o no fue medido. | Las pruebas locales no demuestran disponibilidad ni adopción real.               |

### Dos rutas de estudio

**Ruta rápida, 25 minutos.** Lee las secciones 2, 3, 5, 7, 10 y el banco de preguntas. Deberías poder explicar arquitectura, dato, seguridad y el flujo de intercambio sin memorizar archivos.

**Ruta de defensa profunda.** Recorre las secciones en orden. Cuando aparezca un enlace, ábrelo: la meta no es creer el documento sino poder demostrarlo. La [visita del proyecto](project-tour.md) conserva una ruta de lectura más breve y los documentos de arquitectura, datos, mensajería, privacidad, pruebas y operación profundizan cada área.

### Mapa mental

```text
Persona lectora
  -> React: pantalla, formularios, estado de consulta y traducciones
  -> HTTP /api: comando o lectura autenticada
  -> Express: validación, autorización y respuesta pública
  -> servicio/comando: regla de negocio y transacción
  -> repository: SQL parametrizado
  -> PostgreSQL/PostGIS: dato, constraints e índices

Si el hecho ya se confirmó y debe verse en el momento:
  repository/evento comprometido -> Socket.IO -> participantes autorizados
```

La separación tiene una consecuencia importante: **Socket.IO no es una segunda API para escribir mensajes**. El comando HTTP persiste primero; el socket entrega o sincroniza hechos ya persistidos. Esa decisión simplifica reintentos, evita duplicados y permite reconstruir el historial.

## 2. El problema, el alcance y la frontera entre TFG y MVP

El TFG, de noviembre de 2025, presenta EntreLibros como una plataforma colaborativa de intercambio y reseña basada en geolocalización. Identifica datos bibliográficos dispersos, puntos de intercambio poco visibles y coordinación informal entre lectores. Su propuesta combina Rincones de Libros comunitarios con publicaciones entre particulares.

**MVP verificado.** El runtime actual cubre registro y perfil, catálogo y publicaciones, Comunidad, Rincones, mapa, contacto, conversaciones, borradores, acuerdos, notificaciones, resultados del encuentro, bloqueos y reportes. Las rutas están montadas en [backend/src/app.ts](../backend/src/app.ts) y las pantallas en [frontend/src/routes/index.tsx](../frontend/src/routes/index.tsx).

**Distinción necesaria para la defensa.** El documento académico proyecta una infraestructura AWS con nginx, S3, VPC, Secrets Manager, MFA, rate limiting, backups y observabilidad. El repositorio contiene Docker, Compose, builds, CI y una configuración de despliegue por imágenes, pero no demuestra que esos controles operativos estén aprovisionados o probados en una nube real. La formulación correcta es: _“El TFG los diseña como arquitectura objetivo; el MVP implementa controles locales concretos y deja la operación de producción como trabajo de entorno.”_

También es importante no prometer inventario de un Rincón: un Rincón es un punto comunitario de referencia, no un stock en tiempo real. El producto registra su información, reglas, estado editorial y ubicación con privacidad; no asegura qué ejemplar habrá físicamente al llegar.

## 3. Stack tecnológico: qué se usó y por qué

| Capa              | Tecnología verificada                                          | Por qué encaja en el MVP                                                                                                                               | Dónde comprobarla                                                                                             |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Lenguaje          | TypeScript                                                     | Tipos compartibles, validaciones más explícitas y menor riesgo al mover datos entre UI, API y base.                                                    | `frontend/tsconfig.json`, `backend/tsconfig.json`                                                             |
| Cliente           | React 19 + React Router                                        | Componentes reutilizables y rutas de SPA para catálogo, mapa, perfil y mensajes.                                                                       | [frontend/package.json](../frontend/package.json), [routes](../frontend/src/routes/index.tsx)                 |
| Build del cliente | Rsbuild + plugins React, Sass y SVGR                           | Servidor de desarrollo, HMR, build productivo, CSS Modules y SVG como componentes.                                                                     | [rsbuild.config.ts](../frontend/rsbuild.config.ts)                                                            |
| Estado remoto     | TanStack React Query                                           | Cache, estados de carga/error e invalidación después de mutaciones, sin confundir datos de servidor con estado visual local.                           | [App.tsx](../frontend/src/App.tsx), hooks bajo `frontend/src/hooks/api/`                                      |
| Formularios/UI    | React Hook Form, Sass, React Toastify, i18next                 | Validación de formularios, estilos encapsulados, feedback y traducción sin almacenar texto traducido como dato de dominio.                             | [frontend/package.json](../frontend/package.json)                                                             |
| HTTP              | Axios + Express 4                                              | Cliente con cookies y API REST explícita; Express mantiene rutas, middleware y manejo de errores separados.                                            | [axios.ts](../frontend/src/api/axios.ts), [app.ts](../backend/src/app.ts)                                     |
| Tiempo real       | Socket.IO                                                      | Rooms por conversación, replay y estado de entrega/lectura sin crear otro camino de escritura.                                                         | [socket.ts](../backend/src/socket.ts)                                                                         |
| Persistencia      | PostgreSQL 16 + `pg`                                           | Modelo relacional, transacciones, constraints y consultas parametrizadas.                                                                              | [db.ts](../backend/src/db.ts), `backend/migrations/`                                                          |
| Geodatos          | PostGIS + Leaflet/React Leaflet + OpenStreetMap                | Consultas por cercanía, radio y bbox en servidor; mapa interactivo liviano en navegador.                                                               | [map.ts](../backend/src/services/map.ts), [MapCanvas](../frontend/src/components/map/MapCanvas/MapCanvas.tsx) |
| Bibliografía      | ISBN y Open Library                                            | ISBN reduce ambigüedad cuando existe; Open Library asiste a completar metadatos sin convertir un proveedor externo en la fuente de verdad del listing. | [isbn.ts](../backend/src/services/isbn.ts), [openLibrary.ts](../backend/src/services/openLibrary.ts)          |
| Calidad           | Vitest, Testing Library, Supertest, Playwright, Docker Compose | Pirámide de pruebas: funciones/UI, API con PostgreSQL aislado y navegador real en el baseline E2E.                                                     | [testing.md](testing.md), `e2e/`                                                                              |

### ¿Por qué una aplicación web y no una app nativa?

El problema inicial exige baja fricción para lectores, anfitriones y espacios barriales. Una SPA responsiva permite usar navegador en teléfono, tablet y escritorio sin distribuir binarios. React y la separación cliente/API no impiden un cliente móvil futuro: el contrato HTTP y el modelo de datos pueden reutilizarse. **Límite:** eso no prueba que haya app nativa ni que el diseño responda a todas las condiciones de conectividad.

### ¿Por qué REST más Socket.IO?

REST encaja en comandos identificables y auditables: registrar, crear publicación, guardar borrador, proponer acuerdo, confirmar o reportar. Socket.IO resuelve una necesidad distinta: propagar mensajes y cambios a participantes conectados. Usar solo sockets para escribir haría más difícil reintentar, autorizar y recuperar fallos de reconexión. Usar solo polling empeoraría la conversación. Por eso el MVP usa HTTP como autoridad y sockets para sincronización.

## 4. Arquitectura, procesos y límites de confianza

```text
                    navegador
 React + Router + React Query + i18n + Leaflet
        |                         |
        | HTTP con cookies         | Socket.IO con cookie de sesión
        v                         v
 Rsbuild proxy (/api, /socket.io)  Express / Socket.IO
        |                         |
        +------ rutas, middleware, validación ------+
                                                    |
                                     servicios / comandos / repositories
                                                    |
                                      PostgreSQL + extensión PostGIS
```

### Arranque y composición

El cliente comienza en [frontend/src/App.tsx](../frontend/src/App.tsx). Instala `QueryClientProvider`, autenticación, tema, experiencia mock e inicialización de idioma antes de renderizar rutas y toast. La capa de rutas decide qué pantallas son públicas y cuáles requieren `RequireAuth`.

El backend comienza en [backend/src/index.ts](../backend/src/index.ts): carga el entorno local, crea un servidor HTTP, instala Socket.IO con el origen configurado y delega a `app`. [backend/src/app.ts](../backend/src/app.ts) concentra Helmet, correlación de request, CORS, protección CSRF, JSON limitado, logs Morgan, política de caché privada para `/api`, OpenAPI, routers y manejador de errores públicos.

### Límite de confianza

1. **El navegador no es confiable.** Todo ID, payload y transición se valida otra vez en servidor.
2. **La cookie identifica, no autoriza por sí sola.** Una ruta comprueba dueño, participante, rol o bloqueo antes de leer/escribir datos.
3. **El repository es la frontera de SQL.** Las rutas no concatenan consultas; pasan parámetros a `pg`.
4. **La base es la última barrera de integridad.** FKs, constraints, índices únicos y transacciones protegen reglas incluso si una capa superior falla.
5. **El socket entrega hechos autorizados.** La autenticación de socket verifica la cookie y las rooms se basan en conversaciones del usuario.

### Ejemplo de ciclo de una request

Al guardar un borrador, `MessagesPage` llama al cliente de API. La solicitud viaja con `withCredentials`; Express aplica CORS/CSRF y el middleware decodifica la sesión. La ruta valida el formato y llama al repository de borradores. Ese repository abre una transacción, verifica que el actor pertenezca a la conversación, comprueba la revisión y ejecuta el `INSERT ... ON CONFLICT ... DO UPDATE`. Finalmente, se devuelve un DTO de borrador. No hay evento de chat todavía, porque guardar no equivale a enviar.

## 5. Frontend: responsabilidades y decisiones

### Rutas y acceso

Las rutas públicas incluyen inicio, detalle público de libro, Comunidad, mapa, contacto y perfil público. Las rutas de libros personales, mensajes, perfil propio y estadísticas están envueltas por `RequireAuth`. Es una barrera de experiencia, no una frontera de seguridad: la API repite la verificación.

`AuthContext` consulta `/auth/me` con React Query y expone `user`, `isAuthenticated` e `isLoading`. Su ventaja es que las pantallas no inventan una sesión local; parten de la respuesta del servidor. [AuthContext.tsx](../frontend/src/contexts/auth/AuthContext.tsx) muestra esa proyección.

### Estado local y estado remoto

Una pregunta frecuente es: **“¿Por qué no usar solo React state?”** Porque el catálogo, perfil, conversaciones y notificaciones tienen una fuente de verdad remota. React Query administra key, fetch, loading, error, stale time e invalidación. `MapPage`, por ejemplo, conserva localmente el texto de búsqueda, capas, panel, selección y request de enfoque; usa `useMapData` para el resultado remoto de `/api/map`.

Esto evita dos errores: duplicar el catálogo completo en contexto global y asumir que un dato local sigue vigente después de una mutación. Una mutación invalida la key relevante o actualiza un resultado conocido.

### Cliente HTTP, proxy y caché de sesión

[axios.ts](../frontend/src/api/axios.ts) usa `/api` salvo que `PUBLIC_API_BASE_URL` defina otro origen, envía cookies y agrega `X-Requested-With`. Rsbuild reenvía `/api` y `/socket.io` al backend por defecto en desarrollo, definido en [rsbuild.config.ts](../frontend/rsbuild.config.ts). Así el navegador ve un origen coherente durante desarrollo.

Las respuestas de `/api` llevan `Cache-Control: private, no-store, max-age=0` y varían por cookie; el cliente pide revalidación. Es importante porque perfil, conversaciones y notificaciones dependen de la sesión. Reusar la respuesta de una cuenta local para otra podría mostrar una conversación visualmente pero terminar en un `403` correcto al escribir. La solución no es relajar autorización: es impedir el cache de contenido autenticado.

### Internacionalización y presentación

Las claves de UI se resuelven con i18next. Las claves canónicas persistidas —por ejemplo, intereses o estados— no se traducen en base de datos; se traducen en la frontera de renderizado. Esto evita que cambiar de idioma convierta un dato de dominio en otra clave incompatible.

Los componentes usan Sass/CSS Modules y componentes de presentación. Leaflet se encapsula en `MapCanvas`, lo cual reduce el acoplamiento de `MapPage` con la librería de mapa. **Límite:** las pruebas de Testing Library prueban el DOM simulado; una prueba de navegador sigue siendo necesaria para interacciones reales, permisos, caché y CSS final.

## 6. Backend: de rutas a reglas de negocio

### Capas

| Capa             | Responsabilidad                                                      | Ejemplos                                             |
| ---------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| Router           | Parsear HTTP, validar forma, elegir status y traducir error público. | `routes/books.ts`, `routes/messages.ts`              |
| Middleware       | Autenticación, origen/CSRF, límites, request ID.                     | `middleware/auth.ts`, `security.ts`                  |
| Servicio/comando | Reglas que unen varias operaciones o proveedores.                    | `messageCommand.ts`, `communityCorners.ts`, `map.ts` |
| Repository       | Consultas SQL, mapeo de filas y reglas cerca de la persistencia.     | `messagingRepository.ts`, `bookListingRepository.ts` |
| Base             | Integridad relacional, índices, transacciones y geodatos.            | `migrations/`, `db.ts`                               |

El diseño no pretende que cada endpoint tenga todas las capas siempre. Una lectura sencilla puede ir route -> repository; una operación compuesta usa servicio/comando y `withTransaction`. La regla es que SQL queda fuera de la UI y que el error que cruza la API usa una clave de i18n, no un detalle interno.

### Autenticación y autorización

`authenticate` obtiene la cookie `sessionToken`, verifica JWT con algoritmo configurado y busca al usuario. Una contraseña se almacena como hash bcrypt, no como texto. Login y logout cambian la cookie; `/me` proyecta el usuario autenticado.

La autorización se hace por caso: dueño de publicación para editar, participante para ver conversación o tocar un borrador, participante y versión esperada para actuar sobre un acuerdo, y control de bloqueos para contacto/visibilidad. Esta distinción responde una pregunta de tribunal habitual: _autenticarse responde quién sos; autorizar responde si podés realizar esta acción sobre este recurso._

### Errores y observabilidad local

Cada request recibe `X-Request-Id`, que Morgan registra. `publicErrorHandler` evita devolver stack traces o SQL al cliente y las rutas convierten fallas esperadas a claves como `messaging.errors.forbidden` o `agreements.errors.conflict`. Esto ayuda a correlacionar un síntoma de UI con un log sin filtrar secretos.

**Límite:** el repositorio no demuestra una plataforma externa de observabilidad, alertas o SLOs. Hay logs y request IDs, no una promesa de monitoreo productivo.

## 7. Base de datos: cómo pensar el modelo

### PostgreSQL y PostGIS

PostgreSQL es adecuado porque el núcleo es relacional: usuarios, propiedad, participantes, publicaciones, acuerdos y notificaciones tienen relaciones que deben permanecer consistentes. PostGIS se agrega porque cercanía, radio y bbox no son simples filtros de texto: necesitan geometría/geography e índices espaciales.

El baseline está dividido en cuatro archivos deliberadamente:

1. [001_schema_objects.sql](../backend/migrations/001_schema_objects.sql): extensiones, enums, tablas y secuencias.
2. [002_defaults_and_constraints.sql](../backend/migrations/002_defaults_and_constraints.sql): defaults, PKs, checks y unicidades.
3. [003_indexes.sql](../backend/migrations/003_indexes.sql): índices B-tree, parciales y GiST.
4. [004_foreign_keys.sql](../backend/migrations/004_foreign_keys.sql): referencias y políticas de borrado.

El migrador trata el baseline como instalación de una base nueva y conserva el principio append-only: una migración ya aplicada no se edita. El corte de baseline no actualiza en sitio una base con el ledger histórico; [database.md](database.md) explica cómo conservarla y migrar con seguridad.

### Diagrama conceptual

```text
users --< book_listings >-- books
  |           |                 |
  |           +--< book_listing_images
  |           +--< user_book_listing_interests
  |
  +--< conversation_participants >-- conversations --< messages
  |                                       |
  |                                       +--< message_drafts (por autor)
  |                                       +-- exchange_agreements --< versions
  |                                                                  |-- items
  |                                                                  |-- acceptances
  |                                                                  +-- outcomes
  |
  +--< community_stories / comments / likes
  +--< community_corners --< photos / metrics
  +--< notifications, reports, blocks, follows, analytics_events
```

### Familias de datos y razón de ser

| Dominio                 | Tablas principales                                                                                                   | Decisión y por qué                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identidad               | `users`, `user_blocks`, `user_follows`                                                                               | El usuario concentra credenciales, perfil, ubicación privada y preferencias; bloqueos y seguimientos son relaciones, no flags en el perfil.                                    |
| Bibliografía y posesión | `books`, `book_listings`, `book_listing_images`, `user_book_listing_interests`                                       | Un libro bibliográfico no es un ejemplar ofrecido. Separarlos evita duplicar título/autor por cada persona y permite que cada listing tenga estado, condición y dueño propios. |
| Comunidad y Rincones    | `community_corners`, `community_corner_photos`, `community_corner_metrics`, `community_stories`, comentarios y likes | Un Rincón no es una publicación personal. Tiene reglas, alcance, ubicación y ciclo editorial propios.                                                                          |
| Conversación            | `conversations`, `conversation_participants`, `messages`, `message_drafts`                                           | Los participantes son una tabla puente porque una conversación tiene miembros, cursores y visibilidad por miembro. Draft es privado por autor y conversación.                  |
| Acuerdo                 | `exchange_agreements`, `exchange_agreement_versions`, `items`, `acceptances`, `outcomes`, `agreement_events`         | Versionar conserva la propuesta a la que cada parte dio consentimiento; no se sobrescribe la historia al contraofertar.                                                        |
| Señales transversales   | `notifications`, `notification_preferences`, `reports`, `analytics_events`, `contact_messages`                       | Separar notificación, denuncia, analítica y soporte impide confundir una interacción de producto con una acción de moderación o soporte.                                       |

### Integridad: lo que protege la base

- `users.email` es único; las claves primarias identifican cada fila.
- Foreign keys conectan publicaciones a libro y dueño, mensajes a conversación y remitente, y versiones/items/outcomes al acuerdo. Las políticas `CASCADE`, `RESTRICT` o `SET NULL` expresan qué puede desaparecer junto con el padre y qué historia debe preservarse.
- La publicación `want` activa tiene un índice único parcial por usuario y libro. Es una regla de producto expresada donde no puede romperse por una carrera de requests.
- Una foto primaria de Rincón se limita con índice único parcial. No hace falta confiar solo en un botón de UI.
- Mensajes se indexan por `(conversation_id, sequence DESC)`; participantes visibles por usuario; notificaciones por destinatario y fecha.
- Coordenadas de usuario y Rincón usan GiST. Un índice B-tree sirve para igualdad/orden normal; GiST permite operar eficientemente con relaciones espaciales.

### Geodatos y privacidad

Las ubicaciones usan puntos geográficos en SRID 4326. El servidor aplica radio o bbox con PostGIS y luego proyecta coordenadas para consumo público según el contexto. La función de mapa separa la ubicación del dispositivo, la ubicación de perfil y lo que un visitante puede ver. La pregunta correcta no es _“¿guardan mi dirección?”_, sino _“¿qué precisión se guarda, qué precisión se muestra y qué endpoint recibe cada una?”_. El MVP evita exponer calle, altura y coordenadas privadas en DTOs públicos.

## 8. Recorridos verticales del MVP

### 8.1 Identidad, perfil, privacidad y bloqueo

**Problema.** Permitir participación sin convertir email, domicilio o preferencias en información pública.

**Flujo.** `RegisterPage` y `LoginPage` llaman a `routes/auth.ts`; el backend valida, crea/busca usuario y emite una cookie de sesión. `AuthContext` consulta `/api/auth/me`. El perfil propio usa `routes/user.ts` y `userRepository.ts`; el perfil ajeno pasa por `toPublicUser`, que proyecta solo lo visible. Bloquear crea una relación bidireccional consultada antes de contacto y descubrimiento.

**Por qué.** Centralizar la proyección pública evita que cada pantalla decida por su cuenta qué ocultar. La privacidad se aplica en servidor, no como CSS que puede omitirse desde DevTools.

**Cómo se verifica.** [user.api.test.ts](../backend/tests/routes/user.api.test.ts), [security.test.ts](../backend/tests/security.test.ts) y las pruebas reales de perfil en `frontend/tests/pages/profile/`.

**Límite.** La aplicación implementa controles de sesión, origen, DTOs y bloqueos. No demuestra verificación de email, recuperación de contraseña, MFA u operación de roles de moderación humana que aparecen como proyección del TFG.

### 8.2 Catálogo, publicación e imágenes

**Problema.** Diferenciar la identidad bibliográfica de un ejemplar concreto y evitar listados ambiguos o duplicados.

**Flujo.** `PublishBookModal` construye payload; el cliente llama `/api/books`; `routes/books.ts` valida; `bookListingRepository.ts` crea/actualiza `books`, `book_listings` e imágenes dentro de transacción. ISBN se normaliza y Open Library puede asistir a buscar metadatos. El catálogo público no expone relaciones privadas del dueño.

**Por qué.** `books` representa obra/edición; `book_listings` representa la decisión de una persona: ofrecer, buscar, vender, condición, disponibilidad, modalidad e imágenes. Dos lectores pueden referir el mismo libro y tener estados distintos sin crear dos fichas bibliográficas incoherentes.

**Decisiones de calidad.** La validación editorial ocurre en cliente y servidor. URLs de imágenes se validan; el seed local usa referencias HTTPS públicas, no binarios copiados a la base. El servidor conserva la URL y el cliente tiene fallback si el proveedor no responde.

**Cómo se verifica.** `backend/tests/routes/books.api.test.ts`, [PublishBookModal.test.tsx](../frontend/tests/components/publish/PublishBookModal.test.tsx) y `e2e/tests/publishing.spec.ts`.

### 8.3 Comunidad y Rincones

**Problema.** Dar visibilidad a actividad y puntos locales sin afirmar inventario físico ni exponer ubicación precisa.

**Flujo.** `CommunityFeedPage` consulta feed, historias, comentarios, likes, métricas y sugerencias. `PublishCornerModal` recolecta información, fotos, normas y consentimiento; `routes/community.ts` delega en `communityCorners.ts` y repositories. Un Rincón tiene estado editorial, alcance, fotos y métricas; el mapa consume una proyección pública.

**Por qué.** Separar Comunidad de catálogo permite que una historia, un like o un comentario no alteren el estado de propiedad del libro. Separar Rincón de publicación evita modelar un lugar como si fuera un ejemplar vendible.

**Límite.** El TFG describe administración comunitaria y moderación. El MVP tiene validaciones, estados editoriales, reportes y señalización, pero no debe afirmarse que existe una operación humana continua de moderación.

### 8.4 Mapa, cercanía y permisos

**Problema.** Encontrar oferta o Rincones cercanos sin obligar al lector a revelar coordenadas exactas.

**Flujo.** `MapPage` conserva `viewportBbox`, radio, capas y selección; `useMapData` consulta `/api/map`; [services/map.ts](../backend/src/services/map.ts) valida bbox/radio, aplica filtros PostGIS y devuelve puntos públicos con límites. `MapCanvas` dibuja la respuesta. Si el navegador concede geolocalización, la pantalla centra el mapa de forma explícita; si la niega, puede usar la zona de perfil sin fingir una posición de dispositivo.

**Decisiones importantes.** Bbox y radio no son equivalentes. “Sin límite” se apoya en el viewport visible; un radio numérico usa un centro conocido. El código limita resultados para impedir que una vista muy amplia convierta el mapa en una respuesta no acotada. El efecto de centrar por ubicación explícita se separa de la selección de un pin, para no frustrar el paneo manual del usuario.

**Cómo se verifica.** [map.api.test.ts](../backend/tests/routes/map.api.test.ts), [map.performance.test.ts](../backend/tests/routes/map.performance.test.ts), [MapPage.real.test.tsx](../frontend/tests/pages/map/MapPage.real.test.tsx), [MapCanvas.test.tsx](../frontend/tests/pages/map/components/MapCanvas.test.tsx) y `e2e/tests/map.spec.ts`.

### 8.5 Conversación, adjuntos y borradores

**Problema.** Coordinar sin perder un texto a medio escribir, sin adjuntar libros ajenos y sin duplicar un mensaje al reintentar.

**Flujo de borrador.** `MessagesPage` obtiene la conversación y sus libros permitidos. `PUT /api/messages/:conversationId/draft` pasa por autenticación y exige que el autor sea participante. `messageDraftRepository` bloquea el borrador actual, compara `revision` si se envió y hace upsert. El borrador pertenece a `(conversation_id, author_id)`, no al historial.

**Flujo de envío.** `POST .../draft/send` llama `sendDraftMessageCommand`. En una transacción valida participante, `clientKey`, revisión, adjunto y disponibilidad. Si existe mensaje con ese `clientKey`, devuelve el existente: eso hace el envío idempotente. Si crea el mensaje, borra el borrador dentro de la misma unidad de trabajo y luego publica el evento comprometido.

**Adjuntar un libro.** La ruta `GET /api/messages/:conversationId/books` devuelve libros que el participante puede adjuntar. Al guardar, el servidor vuelve a verificar conversación, dueño/participante, estado, disponibilidad pública, draft y vencimiento. Que la UI muestre una ficha no equivale a autorización: el `403` es la respuesta correcta si la sesión no participa en esa conversación.

**Por qué HTTP es canónico.** Socket.IO autentica, une rooms, reproduce desde un cursor y actualiza entrega/lectura; no inserta mensajes. Esta elección elimina dos caminos de escritura inconsistentes cuando alguien pierde conexión y vuelve a entrar.

**Cómo se verifica.** [messaging.md](messaging.md), `backend/tests/e2e/messagingAgreement.e2e.test.ts`, pruebas de repositories de drafts/reconexión y [MessagesPage.real.test.tsx](../frontend/tests/pages/messages/MessagesPage.real.test.tsx).

### 8.6 Acuerdos versionados y resultado del encuentro

**Problema.** Una propuesta de “nos vemos tal día, en tal lugar, por tal libro” no es un texto libre cualquiera: debe poder cambiarse, aceptarse por ambas partes y conservar su historial.

**Modelo.** Un `exchange_agreement` mantiene participantes, conversación, estado y versión actual. Cada propuesta o contraoferta crea `exchange_agreement_versions`; sus libros y aceptaciones pertenecen a esa versión. El backend recibe `expectedVersion`: si otra persona cambió el acuerdo antes, devuelve conflicto en lugar de sobrescribir consentimiento ajeno.

**Máquina de estados.** `proposed -> partially_confirmed -> confirmed`; antes de confirmarse puede cancelarse o rechazarse con motivo; solo `confirmed` puede pasar a `completed`. `agreementState.ts` centraliza esas transiciones. Cada comando deja evento y una burbuja de mensaje estructurada, para que el chat refleje el estado persistido.

**Outcome.** Cada participante registra de forma privada si el encuentro se concretó. No es una métrica pública automática ni una prueba física de intercambio: cierra el flujo operativo y habilita aprendizaje futuro.

**Cómo se verifica.** [agreements.ts](../backend/src/routes/agreements.ts), `agreementRepository.ts`, `agreementConcurrency.test.ts` y `messages-agreements.api.test.ts`.

### 8.7 Notificaciones, reportes y soporte

Las notificaciones son filas persistidas, con preferencia in-app e idempotency key. Al comprometer un mensaje o acuerdo, servicios de notificación crean avisos para las partes correspondientes. Al leer una conversación, se actualizan cursores y notificaciones de mensaje pertinentes. Los recordatorios de acuerdo se calculan en el endpoint de notificaciones dentro de una ventana temporal; no hay aquí un worker externo demostrado.

Los reportes son autenticados y permiten objetivos `content`, `conduct` o `corner_missing`, con razón validada. El formulario de contacto es separado: recibe nombre, email y mensaje, valida campos permitidos y persiste soporte. Ambas son semillas para moderación y atención, no sustitutos de un equipo de operación.

## 9. Seguridad, privacidad y rendimiento: respuestas precisas

### Controles implementados

- Cookie JWT de sesión, autenticación en HTTP y Socket.IO, y autorización por recurso.
- CORS contra origen configurado y comprobación de origen para mutaciones como defensa CSRF.
- Helmet, límite configurable de JSON y cabecera de request ID.
- Contraseñas con bcrypt; SQL parametrizado a través de `pg`.
- Errores públicos con claves de traducción; logs sin devolver detalles internos.
- Proyección pública de perfiles/mapa, bloqueo bidireccional y ausencia de email/dirección/contraseña en DTOs públicos.
- Cache privado/no-store de `/api` para no mezclar contenido autenticado de distintas sesiones en el navegador.

### Qué no se debe afirmar

- No hay evidencia en este checkout de OpenID Connect, MFA, verificación de email, reset de contraseña, rate limiting, WAF, CSP/HSTS de borde, S3 prefirmado, Secrets Manager o backups/restores probados.
- Dockerfiles y workflow de despliegue muestran una estrategia de empaquetado y publicación; no demuestran que la infraestructura declarada en el TFG esté activa.
- Una prueba que verifica origin o `403` no equivale a una auditoría completa OWASP ni a certificación de seguridad.

### Rendimiento y escalabilidad razonada

El MVP no declara benchmarks de producción. Sí toma decisiones preventivas: índices por conversación/usuario/estado, índices parciales, GiST para ubicación, límites de respuesta de mapa, paginación y filtros en servidor, transacciones para escrituras compuestas e idempotencia para reintentos. Es correcto decir _“está preparado para evitar consultas y escrituras ingenuas”_; no es correcto decir _“escala a X usuarios”_ sin una prueba de carga y métricas de entorno.

## 10. Pruebas, automatización y operación local

| Nivel                                   | Qué demuestra                                                                   | Qué no demuestra                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Unit                                    | Funciones puras, normalizadores, transiciones y validadores.                    | Integración con navegador o base real.                                      |
| Frontend Vitest + Testing Library + MSW | Render, formularios, estados, accesibilidad y contratos simulados.              | Persistencia PostgreSQL, cookie real, socket real o CSS final de navegador. |
| Backend/integración                     | Rutas, autorización, repositories, transacciones y esquema en una base aislada. | UX completa o infraestructura de producción.                                |
| Service E2E                             | HTTP, Socket.IO y persistencia con la base E2E aislada.                         | El navegador real.                                                          |
| Playwright                              | Flujo de usuario con navegador, frontend, backend y PostGIS.                    | Carga masiva, observabilidad o disponibilidad productiva.                   |

Los comandos canónicos están en [package.json](../package.json): `npm run test:backend`, `npm run test:frontend`, typecheck, build, `verify:e2e` y `verify:ci`. CI separa frontend, backend y baseline E2E; usa Node 22.19 y PostGIS aislado. Los workflows son [ci-backend.yml](../.github/workflows/ci-backend.yml), [ci-frontend.yml](../.github/workflows/ci-frontend.yml) y [ci-e2e.yml](../.github/workflows/ci-e2e.yml).

Para desarrollar localmente se requiere Node `>=22.19.0 <23`, npm, PostgreSQL/PostGIS y el entorno backend. La documentación operativa explica el baseline, el dataset de defensa y por qué nunca se debe apuntar la base E2E a una base de desarrollo: [deployment-and-operation.md](deployment-and-operation.md).

## 11. TFG versus MVP: cómo explicarlo sin contradicciones

| Tema               | TFG                                                      | MVP verificable                                                                          | Forma oral correcta                                                                    |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Mapa y Rincones    | Propone OSM/Leaflet, PostGIS y puntos comunitarios.      | Leaflet, PostGIS, filtros, creación/edición y proyección pública.                        | “La hipótesis geolocalizada se materializó en el MVP.”                                 |
| Bibliografía       | ISBN y Open Library como normalización.                  | Normalización ISBN y servicio Open Library con timeout/validación.                       | “Asiste el dato; no reemplaza la validación propia del listing.”                       |
| Mensajería         | Chat 1:1, acuerdos y recordatorios.                      | Drafts, mensajes persistidos, Socket.IO, acuerdos versionados, outcomes y avisos in-app. | “HTTP persiste; Socket.IO distribuye.”                                                 |
| Privacidad         | Granularidad barrio/ciudad y consentimiento.             | DTOs públicos, visibilidad, bloqueos y reducción de precisión.                           | “La privacidad se aplica en servidor, no solo en pantalla.”                            |
| Cloud/medios       | AWS, S3, nginx, TLS, backups, Secrets Manager.           | Docker, CI, builds y workflow de imágenes; no operación cloud demostrada.                | “Es arquitectura objetivo, no evidencia de producción.”                                |
| Seguridad avanzada | OpenID, MFA, rate limiting, verificación y recuperación. | JWT/cookies, bcrypt, CORS/CSRF/origin, Helmet, restricciones y errores públicos.         | “Implementamos el núcleo del MVP; los controles avanzados son siguientes iteraciones.” |
| Impacto social     | Aumentar circulación local y comunidad.                  | Recorrido funcional de demostración.                                                     | “Es impacto esperado; todavía no hay medición longitudinal de adopción.”               |

## 12. Banco de preguntas para la defensa

### 1. ¿Por qué PostgreSQL y no una base NoSQL?

**Respuesta corta.** Porque las reglas principales son relacionales y transaccionales: propiedad, participantes, acuerdos versionados y notificaciones deben permanecer consistentes.

**Profundización.** Postgres permite FKs, constraints, índices únicos parciales y transacciones. PostGIS resuelve cercanía sin introducir otra base. NoSQL podría servir para ciertos feeds o cachés, pero habría añadido complejidad sin resolver mejor el núcleo del MVP.

**Seguimiento probable.** “¿Y escalar?” Responder: se empieza por índices, límites, paginación y medir; luego se evalúa cache, read replicas o colas según evidencia, no por anticipación.

### 2. ¿Por qué separar `books` de `book_listings`?

**Respuesta corta.** `books` es la ficha bibliográfica; `book_listings` es la relación de una persona con un ejemplar u oferta.

**Profundización.** Una misma edición puede ser ofrecida por varias personas con condiciones, fotos, modalidades y disponibilidad diferentes. Mezclar ambas cosas duplica metadatos y no permite reglas como “un want activo por usuario y libro”.

### 3. ¿Cómo evitás que un mensaje se duplique con mala conectividad?

**Respuesta corta.** El cliente manda un `clientKey`; el servidor lo busca dentro de la conversación y autor antes de crear otro mensaje.

**Profundización.** El envío se hace dentro de transacción y devuelve el mensaje existente si el mismo comando se reintenta. El socket no inserta mensajes, por lo que reconectar no abre un segundo camino de escritura.

### 4. ¿Por qué los acuerdos son versionados?

**Respuesta corta.** Para que nadie confirme información que la otra persona ya modificó.

**Profundización.** La versión esperada actúa como control optimista de concurrencia. Una contraoferta crea nueva versión; las aceptaciones previas no confirman la actual. Si dos personas modifican a la vez, una recibe conflicto y vuelve a leer el estado.

### 5. ¿Cómo protegés la ubicación?

**Respuesta corta.** La ubicación precisa no se expone en el DTO público; el servidor aplica visibilidad y proyección.

**Profundización.** PostGIS usa el punto para cercanía, pero la API entrega una representación adecuada al perfil o mapa público. Además, el usuario puede negar geolocalización del navegador; el mapa degrada a zona de perfil o no calcula radio, sin inventar precisión.

### 6. ¿Por qué usar React Query?

**Respuesta corta.** Porque el catálogo, perfiles y conversaciones son estado remoto y necesitan cache, loading, error e invalidación consistentes.

**Error que evitar.** Decir que React Query “reemplaza PostgreSQL” o que todo el estado vive allí. UI local, como panel abierto o texto temporal, continúa en React state.

### 7. ¿Socket.IO reemplaza a REST?

**Respuesta corta.** No. REST/HTTP ejecuta comandos persistentes; Socket.IO distribuye eventos ya comprometidos y sincroniza lectura/entrega.

**Seguimiento.** Esto permite auditar, reintentar con idempotencia y recuperar historial después de reconectar.

### 8. ¿Qué evita que alguien edite la publicación de otro?

**Respuesta corta.** La UI oculta acciones, pero el control real está en la API y repository: se compara actor autenticado con dueño y se devuelven errores autorizados.

**Error que evitar.** No presentar botones deshabilitados como seguridad. Un usuario puede fabricar requests; el servidor debe resistirlas.

### 9. ¿Qué cubren las pruebas de frontend y qué no?

**Respuesta corta.** Cubren UI y flujos simulados con Vitest/Testing Library/MSW; no prueban cookie, PostgreSQL, Socket.IO ni navegador real.

**Profundización.** Por eso hay pruebas backend con base aislada y Playwright para E2E. Cada nivel reduce una clase distinta de incertidumbre.

### 10. ¿Qué pasaría si no hubiera Rincones visibles?

**Respuesta corta.** El mapa sigue siendo un mapa explorable; el control de paneo no depende de pines y la ubicación explícita centra cuando el permiso existe.

**Profundización.** Los resultados vacíos son un estado legítimo. La interfaz no debe capturar gestos con overlays ni asumir que hay una selección disponible.

### 11. ¿Cómo se maneja el borrador de una propuesta con libros?

**Respuesta corta.** Se persiste por conversación, autor y revisión. Al guardar y al enviar se revalida participación y cada listing adjuntado.

**Seguimiento.** Si otra sesión cambió la revisión, hay conflicto; no se pisa silenciosamente un texto más nuevo.

### 12. ¿Cuál es la limitación técnica más importante del MVP?

**Respuesta corta.** El MVP prueba el flujo y sus reglas, no una operación de producción con adopción medida, infraestructura cloud completa o moderación humana sostenida.

**Respuesta madura.** Es una limitación reconocida, no un defecto oculto. El siguiente paso debe priorizarse con datos de uso, prueba de carga, revisión de seguridad y validación con la comunidad.

## 13. Glosario mínimo

| Término      | Definición en EntreLibros                                                        |
| ------------ | -------------------------------------------------------------------------------- |
| Bbox         | Caja geográfica visible: norte, sur, este y oeste.                               |
| DTO          | Objeto que la API expone; puede ser menos detallado que la fila interna.         |
| FK           | Clave foránea que asegura referencia a una fila existente.                       |
| GiST         | Tipo de índice útil para consultas espaciales de PostGIS.                        |
| Idempotencia | Repetir una operación produce el mismo resultado observable, no un duplicado.    |
| Listing      | Publicación concreta de un usuario asociada a un libro bibliográfico.            |
| PostGIS      | Extensión de PostgreSQL para tipos y consultas geográficas.                      |
| Projection   | Transformación/limitación del dato interno antes de exponerlo públicamente.      |
| React Query  | Biblioteca para estado remoto: fetch, cache e invalidación.                      |
| Revisión     | Número de versión de un borrador usado para detectar escrituras concurrentes.    |
| Room         | Canal de Socket.IO al que se unen participantes autorizados de una conversación. |
| SRID 4326    | Referencia espacial habitual de coordenadas WGS84 (latitud/longitud).            |
| Transacción  | Grupo atómico: o se confirman todos sus cambios o se revierten todos.            |

## 14. Mapa de archivos para encontrar cada respuesta

| Pregunta                     | Punto de entrada                                                                                                                                                  | Evidencia de persistencia/prueba            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| ¿Cómo arranca la app?        | [App.tsx](../frontend/src/App.tsx), [index.ts](../backend/src/index.ts)                                                                                           | [architecture.md](architecture.md)          |
| ¿Qué endpoints existen?      | [app.ts](../backend/src/app.ts), `backend/src/routes/`                                                                                                            | [OpenAPI](../backend/src/config/swagger.ts) |
| ¿Cómo se protege una sesión? | [auth middleware](../backend/src/middleware/auth.ts), [security.ts](../backend/src/security.ts)                                                                   | `backend/tests/security.test.ts`            |
| ¿Cómo se almacena un libro?  | `routes/books.ts`, `bookListingRepository.ts`                                                                                                                     | `migrations/`, `books.api.test.ts`          |
| ¿Cómo funciona el mapa?      | [MapPage](../frontend/src/pages/map/MapPage.tsx), [map service](../backend/src/services/map.ts)                                                                   | tests API/map y Playwright                  |
| ¿Cómo funciona el chat?      | [MessagesPage](../frontend/src/pages/messages/MessagesPage.tsx), [message command](../backend/src/services/messageCommand.ts), [socket](../backend/src/socket.ts) | [messaging.md](messaging.md)                |
| ¿Cómo se coordinan acuerdos? | `routes/agreements.ts`, `agreementRepository.ts`                                                                                                                  | pruebas de concurrencia y E2E               |
| ¿Cómo se prueba y ejecuta?   | [README](../README.md), [testing.md](testing.md)                                                                                                                  | workflows CI y `e2e/`                       |

## 15. Cierre: la idea técnica que conviene recordar

La decisión arquitectónica más importante no es un framework: es mantener un recorrido de datos coherente. El lector opera una interfaz clara; el cliente consulta o manda un comando; el servidor valida identidad y reglas; la base protege integridad; y el tiempo real comunica hechos que ya existen. Ese recorrido permite que EntreLibros trate libros, cercanía, confianza y acuerdos como un sistema de información, no como una colección de pantallas.

Cuando una pregunta sea difícil, volvé a esta secuencia: **actor -> intención -> permiso -> regla -> dato -> evidencia -> límite**. Si podés recorrerla, podés defender la decisión técnica sin depender de memoria literal.
