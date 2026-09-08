# EntreLibros TFG System Compliance Explore

## 1. Executive summary

Este documento es una auditoría de conformidad entre la implementación actual de EntreLibros y el TFG TFG ULTIMA VERSION - ROJO - MARIANO.pdf. Es un informe de Explore: no implementa cambios, no modifica contratos y no debe interpretarse como una aprobación de los gaps detectados.

La auditoría original se contrastó contra `chore/remove-confirmed-frontend-dead-surfaces`
en `cd9cb9f`, con `origin/main` observado en `25b7e4c`. Esa referencia es
histórica: la PR #191 se integró posteriormente y la revalidación de Fase 1
parte de `main` en `1a96b28` (2026-09-08).

Este informe conserva sus hallazgos como Explore histórico. Las referencias de
branch, PR y baseline que siguen a continuación deben leerse en ese contexto;
no constituyen una afirmación de que `main` aún difiera de la PR #191.

El MVP implementado es sustancial y cubre de forma real autenticación, perfiles, privacidad, publicaciones, catálogo, Rincones de Libros, comunidad, mapa, mensajería persistida, acuerdos, recordatorios, outcomes, notificaciones, reports y métricas. La distancia principal con el TFG no está en la ausencia de toda la plataforma, sino en varios requisitos implementados de manera más simple o diferente, en claims del TFG que describen arquitectura futura como si fuese operativa y en evidencia de defensa que todavía no está archivada.

### Resultado ejecutivo

- Historias de usuario auditadas: 14.
- Criterios de aceptación auditados: 40.
- Lectura consolidada de criterios: 26 COMPLIANT, 14 PARTIAL y ningún criterio clasificado como completamente ausente.
- Lectura por historia: 4 COMPLIANT y 10 PARTIAL. Una historia se considera PARTIAL si al menos un criterio requiere aclaración, cobertura adicional o implementación complementaria.
- Bloqueadores principales para una defensa sólida: trazabilidad documental contradictoria, falta de evidencia manual reproducible, mapa que no refleja publicaciones en la lista real, moderación/editorial incompleta y claims de despliegue/seguridad/backups del TFG que no están demostrados por el repositorio.
- Hotspots de comprensión: frontend/src/pages/messages/MessagesPage.tsx, frontend/src/components/book/BookDetailModal/BookDetailModal.tsx, frontend/src/pages/community/CommunityFeedPage.tsx, frontend/src/pages/map/MapPage.tsx, backend/src/routes/books.ts y backend/src/repositories/bookListingRepository.ts.
- Paquetes futuros recomendados: 8, ordenados desde evidencia/documentación y correcciones de contrato de bajo riesgo hasta modularizaciones y trabajo de seguridad/despliegue.

La recomendación general es no presentar el estado como “todo lo planificado está implementado”. Es más defendible explicar: “el MVP persistente está implementado; algunos requisitos se resolvieron con un alcance deliberadamente reducido, y la arquitectura cloud, la moderación avanzada, ciertos filtros y la observabilidad operativa quedan como límites o trabajo futuro”.

## 2. Baseline de auditoría y método

### Fuentes revisadas

Se revisaron el TFG completo y el estado actual del repositorio, incluyendo:

- README.md, frontend/README.md, backend/README.md y docs/README.md;
- documentación de arquitectura, estado, roadmap, backlog, seguridad, testing, E2E, base de datos, integración frontend/backend, mensajería, visitantes y recuperación;
- openspec/ y cambios archivados relevantes;
- frontend/src, frontend/mocks, frontend/tests y frontend/src/routes;
- backend/src, backend/tests, backend/migrations, backend/openapi.json y scripts de migración/tests;
- e2e/, playwright.config.ts, Docker Compose, Dockerfiles, Nginx y workflows de GitHub Actions;
- package manifests, lockfile, variables de entorno de ejemplo y configuración de lint/typecheck/build.

### Niveles de evidencia

La auditoría no trata todos los indicios como equivalentes.

| Nivel | Evidencia | Qué permite afirmar |
| --- | --- | --- |
| E4 | Playwright con frontend y backend reales, PostgreSQL/PostGIS real y Socket.IO real | comportamiento observable de extremo a extremo y persistencia |
| E3 | tests backend de ruta/integración/servicio contra DB o app real | contrato HTTP, políticas y persistencia acotada |
| E2 | Vitest frontend, Testing Library y MSW | comportamiento de UI y contratos simulados; no prueba persistencia |
| E1 | código, tipos, rutas, migraciones y configuración | capacidad implementada o intención técnica |
| E0 | README, docs, TFG, comentarios y configuración declarativa | afirmación documental, no prueba de ejecución |

MSW se considera evidencia E2 únicamente. Un handler MSW no demuestra que una ruta exista, persista datos o respete permisos en producción.

### Limitaciones del baseline

- El desajuste entre el checkout auditado y `main` quedó resuelto con el merge de PR #191; el informe no fue reescrito para inferir nuevos hallazgos de ese merge.
- En la revalidación de Fase 1 sobre `1a96b28`, `npm run test:frontend` terminó con 123 archivos/449 tests y exit code cero. Los cinco `read EINVAL` no se reprodujeron; los dos warnings `act(...)` se localizaron en los tests de `useContactForm` y `useLogout` para su corrección de lifecycle.
- En la misma revalidación, `npm run test:backend` detectó el hash drift histórico sin modificar migraciones. Un reset protegido de `entrelibros_test` permitió aplicar las migraciones actuales y ejecutar la suite; esta observación no cambia el registro histórico de hashes 031-033.
- El baseline E2E reproducible registrado previamente documenta 17 pruebas sobre un stack aislado; la evidencia disponible debe distinguir entre la última ejecución registrada y una ejecución posterior en el mismo commit.
- No se encontraron capturas binarias archivadas para todos los flujos manuales de responsive, teclado, contraste y privacidad. La existencia de tests no sustituye esas capturas cuando el TFG las necesita como evidencia de defensa.

## 3. Modelo del sistema descrito por el TFG

El TFG presenta EntreLibros como una plataforma colaborativa para intercambio y reseña de libros, con dos ideas centrales:

1. Rincones de Libros, puntos comunitarios geolocalizados cuya ubicación pública se reduce a barrio/ciudad y cuya disponibilidad no debe confundirse con inventario.
2. Publicaciones de libros, con modalidad ofrecer/buscar, información bibliográfica mínima, condición, imagen, filtros, contacto y acuerdo posterior.

El documento también describe perfiles, intereses, privacidad, mensajería privada, notificaciones, recordatorios, confirmación de encuentros, reports, métricas y una futura recomendación por cercanía/intereses.

La implementación actual materializa ese modelo con más detalle en algunas áreas:

- users, books, book_listings, imágenes y estados editoriales;
- community_corners, fotos, actividad y estados de publicación;
- conversations, participantes, mensajes, drafts y eventos;
- acuerdos versionados con items, aceptaciones, eventos, reservas, outcomes y recordatorios derivados;
- notificaciones y preferencias;
- bloqueos, follows, historias, comentarios, likes, reports y analytics.

La diferencia importante es que el TFG mezcla requisitos del MVP, prototipos visuales, arquitectura objetivo y backlog futuro. Cada afirmación se clasificó por separado para no convertir una arquitectura futura en un defecto funcional actual.

## 4. Inconsistencias internas del TFG y del material de proyecto

### TFG-INC-01 - Password de seis caracteres frente a política de ocho caracteres

Estado: TFG_INCONSISTENT / IMPLEMENTED_DIFFERENTLY.

Evidencia: la aceptación de HU-1.1 menciona rechazar passwords menores a seis caracteres o sin alfanuméricos; la narrativa de seguridad exige mínimo ocho y password común bloqueada. backend/src/routes/auth.ts aplica una expresión de mínimo ocho con mayúscula, minúscula, dígito y símbolo, mientras frontend/src/pages/auth/RegisterForm.tsx tiene una validación local más laxa de seis caracteres.

Consecuencia: una defensa que pruebe solo seis caracteres puede contradecir el backend; una defensa que pruebe la política de ocho debe explicar que la implementación endureció el criterio respecto de esa aceptación.

Recomendación: definir una única política pública, alinear frontend/backend y documentar si la decisión final supera el criterio mínimo del TFG.

### TFG-INC-02 - “Todo implementado” frente a trazabilidad actual

Estado: DOC_ONLY / TFG_INCONSISTENT.

Evidencia: las conclusiones del TFG afirman que los componentes previstos están implementados o avanzados, pero docs/tfg-mvp-trazabilidad.md contiene tablas históricas que siguen marcando reports, outcomes, recordatorios y métricas como parciales o ausentes, mientras el encabezado más reciente declara cierres para varias de esas tareas. El esquema ya alcanza las migraciones 031–035.

Consecuencia: dos documentos del propio proyecto producen respuestas distintas sobre el estado.

Recomendación: mantener una tabla de estado única con fecha, commit y nivel de evidencia; conservar el histórico en una sección separada.

### TFG-INC-03 - Sin rol moderador en alcance, pero con moderación en aceptación

Estado: TFG_INCONSISTENT / PARTIAL.

Evidencia: el alcance excluye un rol moderador dedicado, pero HU-2.1 exige que un Rincón sospechoso pase a revisión manual. El backend tiene endpoints editoriales admin-only para libros y Rincones (/api/books/:id/editorial y /api/community/corners/:id/editorial), pero no hay una UI humana de moderación comparable a un flujo operativo completo.

Recomendación: aclarar que existe una capacidad técnica editorial mínima, no una consola de moderación avanzada; definir si el requisito es demo de estado o producto operativo.

### TFG-INC-04 - Arquitectura AWS objetivo frente a despliegue reproducible local

Estado: IMPLEMENTED_DIFFERENTLY / CANNOT_VERIFY.

Evidencia: el TFG describe VPC, RDS/EC2, S3, presigned URLs, TLS y red privada. El repositorio ejecuta PostgreSQL/PostGIS y servicios mediante Docker Compose, guarda imágenes mediante las rutas implementadas y usa Nginx como proxy local; no demuestra provisionamiento AWS, TLS terminado, S3 con KMS ni backup cloud ejecutable.

Recomendación: presentar el diagrama cloud como arquitectura objetivo y el Compose/E2E como arquitectura reproducible del MVP.

### TFG-INC-05 - Reseñas y ratings descritos en el producto, sin dominio persistente equivalente

Estado: PARTIAL / IMPLEMENTED_DIFFERENTLY.

Evidencia: el TFG presenta reseñas y ratings como parte del producto. La búsqueda actual no encontró tabla, migración, ruta ni repository backend de reviews/ratings; ReviewItem y tarjetas relacionadas existen como tipos o contenido de feed/prototipo, no como un flujo persistente de calificación verificable.

Recomendación: no defender reviews/ratings como capacidad MVP implementada salvo que se delimite como contenido de prototipo o trabajo futuro.

## 5. Matriz maestra de historias de usuario y criterios

La siguiente matriz normaliza las 14 HUs y 40 criterios del TFG. COMPLIANT significa que el comportamiento está razonablemente respaldado por código y pruebas disponibles. PARTIAL significa que existe una implementación real, pero hay una diferencia de contrato, una parte ausente o evidencia insuficiente.

| HU | Criterio resumido | Estado | Evidencia principal |
| --- | --- | --- | --- |
| HU-1.1 | campos obligatorios producen error | COMPLIANT | backend/src/routes/auth.ts, backend/tests/routes/auth.api.test.ts |
| HU-1.1 | email duplicado es rechazado | COMPLIANT | ruta de registro y tests de auth |
| HU-1.1 | password corta o sin política mínima es rechazada | PARTIAL | backend aplica ocho/complexidad; frontend anuncia seis; contrato TFG inconsistente |
| HU-1.1 | registro exitoso permite iniciar sesión | COMPLIANT | auth API/E2E |
| HU-1.2 | login válido crea sesión | COMPLIANT | cookie sessionToken, authRouter, E2E auth |
| HU-1.2 | credenciales inválidas producen error | COMPLIANT | auth route tests |
| HU-1.2 | logout limpia sesión y devuelve a login | COMPLIANT | logout route, useLogout, E2E auth |
| HU-1.3 | UI en español neutro | PARTIAL | locales ES/EN y tests; falta revisión manual lingüística completa |
| HU-1.3 | estilo visual actualizado | PARTIAL | componentes y estilos actuales; sin evidencia manual completa de todas las pantallas |
| HU-1.4 | guardar al menos tres intereses | COMPLIANT | profile API/UI y migración 020 |
| HU-1.4 | elegir barrio/ciudad como ubicación | PARTIAL | campos y privacidad existen; falta confirmar recorrido manual completo contra wording exacto |
| HU-1.4 | cambios visibles después de guardar | COMPLIANT | profile tests y persistencia de usuario |
| HU-1.5 | perfil público no expone calle/número | COMPLIANT | findPublicProfileById, proyección pública y tests de privacidad |
| HU-2.1 | formulario incompleto muestra errores | COMPLIANT | PublishCornerModal, validación de corners, tests |
| HU-2.1 | Rincón válido queda aprobado y aparece en mapa | COMPLIANT | communityCorners, /api/map, E2E/map |
| HU-2.1 | sospechoso pasa a moderación manual | PARTIAL | estados/editorial admin; no hay workflow UI humano completo |
| HU-3.1 | publicación incompleta se bloquea | COMPLIANT | routes/books.ts, PublishBookModal, tests |
| HU-3.1 | publicación válida se almacena y aparece | COMPLIANT | listings API, Book pages, E2E catalog/publishing |
| HU-3.1 | ISBN obtiene metadata automáticamente | PARTIAL | Open Library con fallback manual; no hay modelo de edición separado |
| HU-3.2 | fallo leve queda pendiente, oculto y notifica corrección | PARTIAL | estados pending/needs_correction; falta notificación de corrección completa |
| HU-3.2 | publicación válida se aprueba automáticamente | COMPLIANT | editorial_status y flujo de listings |
| HU-3.2 | corrección vuelve a evaluarse | PARTIAL | endpoint editorial existe; flujo operativo/UI no cubre todo el ciclo |
| HU-3.2 | duplicado/prohibido/exactitud/spam se rechaza con motivo | PARTIAL | validaciones básicas de contenido/enlaces; no hay motor completo de reglas |
| HU-3.3 | filtros responden en menos de dos segundos | PARTIAL | filtros y medición map local; no hay SLA catalogado E4 |
| HU-3.3 | cero resultados ofrece orientación | COMPLIANT | estados empty de Books/community |
| HU-3.3 | filtros aplicados quedan visibles | COMPLIANT | BooksPage, controles y tests frontend |
| HU-4.1 | con ubicación se ordena por cercanía | COMPLIANT | PostGIS en services/map.ts, datos map y tests |
| HU-4.1 | sin ubicación se invita a configurar/compartir ubicación | PARTIAL | existe fallback; no se confirma el prompt exacto del TFG |
| HU-4.2 | cada resultado de mapa tiene equivalente en lista | PARTIAL | mapa soporta varias capas, pero MapPage desactiva publications y usa lista de corners/activity |
| HU-4.2 | lista y mapa reflejan el mismo conjunto | PARTIAL | mismo problema de capas y filtros; no hay contrato único de resultados |
| HU-4.2 | click del mapa abre detalle | COMPLIANT | selección de corner y CommunityCornerDetail |
| HU-5.1 | contactar desde libro/perfil en menos de dos acciones | COMPLIANT | contact routes, contexto book/profile y E2E messaging |
| HU-5.1 | receptor recibe notificación in-app | COMPLIANT | messageEvents, notifications, Socket.IO e invalidación |
| HU-5.1 | existe mensaje/predefinido contextual | PARTIAL | drafts/contexto y templates visuales; no se comprobó un único catálogo equivalente al TFG |
| HU-5.2 | receptor confirma o rechaza | COMPLIANT | agreement routes/repository/E2E agreement |
| HU-5.2 | acuerdo confirmado genera recordatorio previo | COMPLIANT | notificaciones derivadas y ventana de 23–25 horas |
| HU-5.2 | acuerdo conserva lugar y hora | COMPLIANT | migrations 011/031, acuerdos versionados y tests |
| HU-5.3 | mensaje nuevo genera notificación | COMPLIANT | persistencia y notificationKeys |
| HU-5.3 | acuerdo notifica a ambas partes | COMPLIANT | agreement service/socket notifications |
| HU-5.3 | preferencia in-app permite deshabilitar | COMPLIANT | notification preferences y frontend |

### Conteo de la matriz

- COMPLIANT: 26 criterios.
- PARTIAL: 14 criterios.
- MISSING: 0 criterios completamente ausentes dentro de las 40 aceptaciones, aunque varias partes de criterios parciales sí son funcionalidad no demostrada o no implementada.

El conteo no implica que el producto completo sea 65%/35%; los criterios tienen pesos distintos y el TFG contiene requisitos fuera de esas 40 filas.

## 6. Recorrido vertical de negocio

### 6.1 Visitante, registro, login y logout

El routing público permite home, catálogo público, comunidad, mapa y perfiles públicos según docs/public-visitor-matrix.md. Mensajes, stats y perfil propio requieren autenticación mediante RequireAuth en frontend/src/routes/index.tsx.

El registro y login pasan por frontend/src/api/auth, frontend/src/pages/auth y backend/src/routes/auth.ts. El backend emite cookie JWT sessionToken; backend/src/middleware/auth.ts la valida para HTTP y backend/src/socket.ts repite autenticación para Socket.IO. El flujo está cubierto por e2e/tests/authentication.spec.ts y tests de rutas.

Riesgos de explicación:

- la política visual de password no está alineada con backend;
- no existen email verification, reset, MFA, lockout, rate limiting ni revocación server-side demostrados;
- el logout limpia la cookie, pero no equivale a un sistema de revocación de tokens ya emitidos.

### 6.2 Perfil, intereses, ubicación y privacidad

frontend/src/pages/profile/ProfilePage.tsx concentra edición, foto, intereses, ubicación, preview público y privacidad. El backend persiste esos datos con migraciones 016, 020 y 026.

La proyección pública elimina calle/número y redondea o limita ubicación mediante funciones de usuario/corner. El modelo de privacidad es razonable para la demo: público, ciudad o barrio; los objetos públicos no deben exponer la dirección interna.

La defensa debe explicar la diferencia entre:

- dirección interna usada para editar o geocodificar;
- label público;
- coordenada aproximada para mapa;
- perfil privado y proyección pública.

### 6.3 Publicación, ISBN y editorial

frontend/src/pages/books/BooksPage.tsx, PublishBookModal y backend/src/routes/books.ts cubren publicaciones offer/want, estado, condición, precio, entrega, donación/intercambio, expiración, imágenes, consentimientos y drafts. bookListingRepository.ts persiste listings e imágenes.

La normalización ISBN consulta Open Library y permite fallback manual. Esto es funcionalmente robusto para una demo, pero no equivale a una entidad bibliográfica/edición completa: no hay una separación persistente de edition, ni campos explícitos de género/tema en la publicación actual.

La revisión editorial tiene migraciones 029–030 y estados, pero el motor de duplicados, spam, ubicación exacta y contenido prohibido es más pequeño que la narrativa del TFG.

### 6.4 Catálogo, búsqueda y filtros

El catálogo real se sirve mediante APIs de books/listings con filtros de tipo, condición, disponibilidad, intercambio/venta, texto y orden. BooksPage muestra estados empty y filtros aplicados.

No hay evidencia E4 de un SLA menor a dos segundos bajo una carga representativa de catálogo. La medición encontrada pertenece principalmente al servicio de mapa en entorno local y no debe presentarse como prueba de catálogo.

Los filtros de género/tema exigidos por el TFG no tienen un modelo equivalente fuerte en books/book_listings.

### 6.5 Mapa, Rincones y descubrimiento

El backend /api/map y backend/src/services/map.ts construyen datos de Rincones, publicaciones y actividad con PostGIS, filtros de radius/openNow/themes/recentActivity y aproximación geográfica.

La limitación más concreta está en frontend/src/pages/map/MapPage.tsx: mapLayers deja publications en false y mapPublications se alimenta de EMPTY_PUBLICATIONS. Aunque MapCanvas tiene soporte técnico para publication pins, la página real no lo conecta al conjunto mostrado al usuario. La lista actual es principalmente de corners/activity.

Esto hace que HU-4.2 y la afirmación mapa/lista unificados sean parciales, no que el mapa entero esté ausente.

### 6.6 Contacto, conversación, propuesta y acuerdo

frontend/src/pages/messages/MessagesPage.tsx es la implementación canónica y concentra conversación, historial, drafts, adjuntos, libros, propuestas y acuerdos. El backend reparte el flujo entre routes/messages.ts, routes/agreements.ts, messagingRepository.ts, agreementRepository.ts, messageDraftRepository.ts y servicios de notificaciones.

El protocolo productivo actual usa Socket.IO para autenticación, join, entrega/replay y eventos de cambios, mientras la escritura de drafts y el envío final pasan por HTTP. e2e/tests/messaging.spec.ts comprueba mensaje real entre dos contextos; agreement.spec.ts comprueba la confirmación de acuerdo.

El acuerdo persiste versiones, items, aceptaciones, eventos, reservas y outcomes. El recordatorio se deriva al consultar notificaciones dentro de una ventana temporal; no se encontró un worker/scheduler dedicado que lo dispare en segundo plano.

### 6.7 Notificaciones y outcomes

La persistencia de notifications, preferencias, agreements y outcomes está respaldada por migraciones 019, 031 y 034, rutas y tests. Socket.IO invalida claves React Query de notificaciones, conversaciones y acuerdos.

El modelo actual satisface una demo de notificación in-app, pero no el conjunto completo de canales externos, email, push, métricas de entrega o jobs operativos que la narrativa de seguridad/arquitectura podría sugerir.

## 7. Identidad, permisos, privacidad y seguridad

### Implementado y demostrable

- cookie de sesión HttpOnly mediante auth;
- CORS con origen restringido;
- comprobación de Origin en producción para métodos no seguros;
- middleware de autenticación y roles básicos;
- validaciones de payload y parámetros;
- consultas parametrizadas;
- protección de perfil público y ubicación aproximada;
- bloqueos de usuarios en discovery, publicaciones y mensajería;
- autorización de participantes en conversaciones y acuerdos;
- endpoints editoriales protegidos para admin;
- tests de autorización HTTP en e2e/tests/security.spec.ts y rutas backend.

### No demostrado o fuera del MVP local

El TFG describe, pero el repositorio no demuestra como capacidad operativa completa:

- verificación de email;
- reset de password;
- MFA;
- lockout/backoff/rate limiting de aplicación;
- revocación de refresh tokens;
- S3 presigned URLs, eliminación EXIF, malware scanning y KMS;
- CSP completa y hardening de edge TLS;
- SAST/DAST/SBOM y procedimiento de incident response;
- exportación/retención/borrado GDPR operativo.

docs/security-runbook.md y docs/estado-actual.md son más prudentes que el TFG y reconocen varias de estas limitaciones. El futuro Propose debe tratarlas como un paquete de seguridad/deployment separado, no mezclarlo con simplificación de código.

## 8. Arquitectura actual

### Frontend

- Entrada global en frontend/src/App.tsx.
- QueryClientProvider para server state.
- AuthProvider, ThemeProvider, PrototypeProvider, inicializador de idioma y toaster.
- Routing en frontend/src/routes/index.tsx.
- Páginas por dominio: auth, books, community, map, messages, profile.
- APIs y servicios tipados en frontend/src/api.
- mocks MSW registrados en frontend/mocks/handlers/index.ts.
- modo real/mock y adapters de prototipo en frontend/src/features/prototype.

### Backend

- montaje de routers en backend/src/app.ts;
- rutas de auth, user, books, community, map, messages, agreements, notifications, reports y contact;
- servicios para reglas de dominio y geoespacial;
- repositories con SQL PostgreSQL/PostGIS;
- migraciones acumulativas 001–035;
- Socket.IO en backend/src/socket.ts;
- OpenAPI estático en backend/openapi.json.

### Infraestructura

- Docker Compose local, PostGIS y stack E2E aislado;
- Nginx frontend como proxy de /api/ y /socket.io/;
- CI backend y CI E2E con GitHub Actions;
- deploy workflow construye imágenes, pero el repositorio no contiene una implementación AWS completa del diagrama del TFG.

### Fuente de complejidad transversal

PrototypeProvider se monta globalmente incluso en modo real. Hay páginas que consultan usePrototype para separar ramas mock/real, aunque sus datos reales provengan de React Query. Esto conserva la demo, pero deja dos modelos mentales simultáneos: server state real y estado alternativo de prototipo.

## 9. Hotspots principales de complejidad

El tamaño es indicativo; la recomendación depende de responsabilidades y límites naturales, no de un umbral de LOC.

| Hotspot | Tamaño aproximado | Responsabilidades mezcladas | Evaluación |
| --- | ---: | --- | --- |
| frontend/src/pages/messages/MessagesPage.tsx | 2.875 LOC | queries, socket, drafts, composición, modales, acuerdos, navegación, adaptación mock/real | principal hotspot frontend; dividir en un paquete posterior |
| backend/src/routes/books.ts | 1.797 LOC | parseo, validación, ISBN, imágenes, policy, editorial, respuestas | dividir por casos de uso cuando exista contrato claro |
| backend/src/repositories/bookListingRepository.ts | 1.572 | SQL de listados, filtros, persistencia, imágenes, editoriales, mapping | repository grande pero con SQL de dominio; evitar fragmentación artificial |
| frontend/src/components/book/BookDetailModal/BookDetailModal.tsx | 1.136 LOC | detalle, disponibilidad, contacto, imágenes, preview, permisos | límite natural entre lectura, acciones y presentación |
| frontend/src/pages/community/CommunityFeedPage.tsx | 825 LOC | feed, discovery, corners, stats, activity, follows, mock/real | varias queries y dominios en una página |
| frontend/src/pages/profile/ProfilePage.tsx | 830 LOC | editor, foto, privacidad, ubicación, preview y estados | separar por secciones funcionales después de estabilizar contratos |
| frontend/src/pages/map/MapPage.tsx | 719 LOC | viewport, filtros, mock/real, lista, selección y modal | primero definir contrato mapa/lista; después dividir |
| frontend/src/pages/books/BooksPage.tsx | 673 LOC | catálogo, filtros, publicación, detalle, relaciones | simplificar fuentes de datos antes de extraer componentes |
| backend/src/routes/community.ts | 674 LOC | corners, feed, stats, activity, suggestions, follow/discovery | separar por subdominio cuando se estabilice la API |
| backend/src/socket.ts | 419 LOC | auth socket, rooms, replay, escritura, bot, notificaciones | documentar protocolo antes de reestructurar |

### Regla de división recomendada

Primero identificar el flujo que se quiere explicar —por ejemplo “enviar un mensaje”, “publicar un libro” o “seleccionar un Rincón”— y extraer solo el límite que reduzca ese recorrido. No crear una arquitectura genérica de controllers/services/use-cases para todo el backend ni nuevos state managers para todo el frontend.

## 10. Frontend: simplificación y estudiabilidad

### Pages demasiado inteligentes

MessagesPage implementa el mayor número de responsabilidades y debe ser el foco de un OpenSpec posterior, una vez cerrada la conformidad del contrato Socket/HTTP. CommunityFeedPage coordina ocho queries y una mutación de follow, además de transformar respuestas y cambiar entre mock/real. MapPage mantiene estado de viewport, filtros, capas, selección y una lista que no coincide completamente con el mapa.

Estas páginas no deben refactorizarse dentro de un paquete de auditoría o limpieza. El límite recomendado para futuros cambios es por caso de uso observable, no por cada hook o cada bloque JSX.

### Estado local y efectos

La mayor oportunidad no es introducir otro manager, sino eliminar estado derivado o duplicado:

- revisar valores que pueden derivarse directamente de React Query;
- evitar copias locales de respuestas que solo se usan para render;
- reducir booleanos relacionados mediante un estado de modo explícito cuando aporte claridad;
- revisar efectos que sincronizan manualmente query state, socket state y modal state.

No hay evidencia para afirmar que cada useEffect sea innecesario. El candidato debe evaluarse por flujo y no por conteo.

### React Query

React Query es la fuente correcta para server state, pero las query keys se construyen de forma ad hoc en varias páginas. Debe existir un inventario de keys e invalidaciones antes de consolidarlas. En mensajería, la relación entre invalidaciones Socket y las keys de conversaciones/acuerdos es especialmente importante.

### Modo mock/real

PrototypeContext, PrototypeUI, realData.adapters.ts y frontend/mocks tienen valor para demos, tests y fallback visual. No se recomienda eliminar todo el modo mock. Sí conviene documentar claramente qué páginas son productivas, qué datos solo son prototipo y cuál es el punto de entrada de cada modo.

## 11. Backend: simplificación y estudiabilidad

### Routes

Las rutas de books, community y messages combinan autenticación, validación, políticas, llamadas de servicio/repository y mapping HTTP. Son comprensibles por endpoint individual, pero costosas de recorrer como archivo completo.

La división futura debe seguir bloques de negocio:

- books: publicación, catálogo, detalle/relaciones, editorial, imágenes;
- community: corners, feed/social, discovery, metrics;
- messages: conversación, drafts, archivos, lectura;
- agreements: propuesta, aceptación, outcomes y recordatorios.

No conviene extraer una capa que solo delegue a un repository ni crear interfaces artificiales para una sola implementación.

### Repositories y SQL

bookListingRepository.ts y messagingRepository.ts son grandes porque contienen SQL que conserva policies, joins, filtros y mapping. Extraer fragmentos pequeños puede hacer que una operación deje de ser legible. El límite correcto es un caso de uso que pueda probarse y explicarse completo.

Hay duplicación aparente que merece investigación, no eliminación inmediata:

- selección/creación de books desde bookRepository.ts y bookListingRepository.ts;
- proyecciones de publicaciones para catálogo, relaciones, discovery y detalle;
- parseo de cookie session en middleware/auth.ts, socket.ts y puntos de books;
- helpers de cliente DB withMessagingClient y APIs de send antiguas.

La evidencia actual muestra que createBook y listBooks en bookRepository.ts solo son usados por tests, y que sendMessage antiguo del repository solo es usado por tests, mientras la producción usa sendMessageWithStatus. Son candidatos de limpieza posteriores, pero hay que verificar si esos tests protegen un contrato que deba trasladarse al flujo canónico.

## 12. Mensajería y Socket.IO

### Protocolo actual observado

El backend declara eventos de cliente conversation:join, conversation:message y conversation:read, y eventos de servidor user, conversation:message, agreement:updated y conversation:error. La autenticación usa la cookie JWT.

El flujo productivo observado es:

1. el navegador abre Socket.IO con cookie de sesión;
2. el socket se autentica y entra en rooms de conversaciones permitidas;
3. MessagesPage hace join de la conversación visible;
4. historial y envío de drafts pasan por HTTP;
5. la persistencia publica eventos que invalidan queries y actualizan la vista;
6. el socket puede replayar mensajes después de un cursor y emite cambios de acuerdo;
7. las notificaciones se generan o invalidan junto con el evento de negocio.

### Estado legacy

La rama auditada ya no contiene la superficie anterior components/messages/Messages.tsx ni el evento genérico legacy message que estaba en el alcance de la PR #191. La comparación con origin/main muestra esa limpieza como diferencia de rama, no como ausencia en la historia.

### Riesgo de protocolo duplicado

messageEvents.on('committed') emite conversation:message para publicaciones de repository; la escritura directa por Socket también persiste y emite en su propio camino. Esto no demuestra un bug observable por sí solo, pero crea dos rutas de entrega que deben documentarse y cubrirse con idempotencia/replay. El TFG no define ese detalle interno.

La función sendConversationMessage del hook frontend no tiene consumidor productivo identificado en el checkout; joinConversation sí es usado por MessagesPage. currentUser y agreementUpdates tampoco muestran consumidores productivos claros. Deben ser candidatos FOLLOW-UP, no borrados durante esta auditoría, porque pueden proteger reconexión o tests futuros.

### Qué preservar

No simplificar eliminando conversation:message, agreement:updated, rooms, replay, invalidación de notificaciones, persistencia, drafts, reconexión o el bot persistido sin una decisión explícita de protocolo y una prueba E4 equivalente.

## 13. Books y catálogo

### Contrato actual

La implementación usa book_listings como unidad principal y books como metadata bibliográfica. Hay publicaciones offer/want y campos de venta, donación, intercambio, condición, precio, entrega, expiración y disponibilidad.

### Candidatos de API cliente para revisión

En frontend/src/api/books/books.service.ts:

- fetchUserBooks tiene consumidores reales en Home/Community y debe preservarse;
- getBookById de publication.service.ts tiene consumidores reales y es canónico para detalle;
- fetchAllBooks, fetchBookById y createWantFromBook no tienen consumidor productivo identificado;
- fetchBooks solo aparece detrás del hook antiguo useBooks.

useBooks y useUserBooks aparecen únicamente en tests. Esto puede ser una cadena de API/hook test-only, pero antes de eliminarla hay que decidir si sus tests cubren una regla de negocio o solo una implementación ya abandonada.

### Oportunidades de simplificación

- consolidar clientes duplicados que consultan el mismo endpoint;
- hacer explícita la diferencia entre publication.service.ts y servicios históricos de books;
- reutilizar un mapping de publicación solo si mantiene las proyecciones de privacidad/availability;
- no introducir un modelo de edición/genre/topic masivo en este paquete.

## 14. Community, map y profile

### Community

CommunityFeedPage usa endpoints reales de feed, corners, stats, activity, suggestions, discovery, libros y follow; el modo mock se deriva de PrototypeContext. communityDiscovery.ts construye stories, suggestions y recommendedBooks desde SQL, aplicando intereses, distancia, ciudad, visibilidad y bloqueos.

No eliminar los tipos de discovery/suggestions por llamarse suggestions: hay consumers reales frontend, backend, OpenAPI, MSW y tests.

### Map

El servicio geoespacial es una de las partes mejor respaldadas técnicamente: PostGIS, radius/bbox, aproximación y orden por distancia. El gap está en el contrato de presentación mapa/lista y en filters del TFG no expuestos de forma equivalente.

### Profile

ProfilePage es grande pero cohesivo alrededor de edición de identidad/privacidad/foto/ubicación. Es buen candidato para un split posterior por secciones, no para un rename o movimiento masivo ahora.

## 15. Datos y persistencia

### Esquema implementado

Las migraciones 001–035 cubren más que el diccionario inicial del TFG: users, books, listings, imágenes, corners, conversaciones, participantes, mensajes, drafts, acuerdos, versiones, aceptaciones, reservas, outcomes, eventos, bloqueos, intereses, follows, stories, likes, comentarios, notificaciones, reports y analytics.

### Diferencias relevantes

- no existe una tabla separada book_suggestions; discovery calcula sugerencias desde users/listings/intereses;
- no existe una tabla/entidad persistente de reviews/ratings equivalente al relato inicial;
- la conversación no parece tener publication_id como columna primaria del modelo del TFG; el contexto de libro se maneja mediante drafts/contacto y payloads actuales;
- no hay rollback de migraciones;
- la base local de tests contiene hash drift aplicado en 031–033; la migración 034 duplica defensivamente algunos CREATE TABLE IF NOT EXISTS y endurece reports.

### Recomendación

Crear posteriormente un diagrama/documento de modelo actual que explique entidades y relaciones reales, separado de la tabla histórica del TFG. No hacer una migración para reproducir literalmente el diccionario si el comportamiento actual ya es correcto.

## 16. Testing y evidencia

### Cobertura existente

- backend: tests de rutas, repositories, servicios, Socket.IO y E2E de integración;
- frontend: 123 archivos de test y 449 tests afirmativos en la ejecución auditada;
- E2E browser: authentication, catalog, map, messaging, agreement, profile, publishing, security y smoke;
- CI: checks de formato, lint, stylelint, typecheck, backend/E2E, frontend tests y builds;
- E2E real: PostgreSQL/PostGIS aislado, frontend y backend sin MSW.

### Gaps de confiabilidad

#### TEST-01 - Vitest no termina limpio

Cinco requests abiertas produjeron read EINVAL en MSW/jsdom aunque los asserts pasaron. Tres se asociaron al modal de publicación de Community y dos a la reconciliación del indicador unread. Debe investigarse el cleanup del mock server, timers, socket mock y requests pendientes.

#### TEST-02 - Suite backend bloqueada por migration hash drift

backend/scripts/run-tests.js ejecuta migraciones antes de Vitest. En la base local, postgres-migrations detecta que 031–033 fueron aplicadas con contenido/hash diferente. La solución correcta es usar una DB de test limpia o una estrategia de migración de test reproducible, no editar scripts SQL aplicados.

#### TEST-03 - Evidence pack manual incompleto

docs/tfg-browser-checklist.md identifica keyboard, contraste, responsive, Socket/counter y reports como parciales o pendientes de captura. Las pruebas E2E garantizan flujos, pero faltan capturas o videos versionados para defender visualmente privacidad, estados empty, reconexión y responsive.

### Tests que sirven como documentación de dominio

Conviene preservar y señalar en documentación:

- e2e/tests/messaging.spec.ts: dos usuarios, envío real, no reload;
- e2e/tests/agreement.spec.ts: participante autorizado confirma acuerdo;
- e2e/tests/security.spec.ts: boundaries de visitor/participant/admin y bloqueo de conversación;
- e2e/tests/catalog.spec.ts: persistencia después de navegación/reload y visibilidad de bloqueados;
- e2e/tests/publishing.spec.ts: publicación y edición persistente;
- tests de community, map, auth y privacidad backend.

## 17. Documentación actual y necesidades

### Documentación útil existente

- docs/estado-actual.md es la mejor fuente de límites actuales del MVP;
- docs/arquitectura.md describe componentes y límites, aunque contiene referencias que deben cotejarse con el socket actual;
- docs/e2e-baseline.md y docs/recovery-baseline.md separan pruebas reales de procedimientos pendientes;
- docs/messaging-bubbles.md explica el comportamiento de HTTP/Socket/drafts;
- docs/security-runbook.md reconoce qué seguridad es local y qué depende de producción;
- docs/public-visitor-matrix.md ayuda a explicar acceso público/privado.

### Documentación desalineada

1. docs/tfg-mvp-trazabilidad.md mezcla cierre reciente con tablas históricas que parecen estado actual.
2. docs/arquitectura.md describe conversation:leave, pero no se encontró una implementación equivalente actual en el protocolo del socket.
3. backend/openapi.json no contiene una entrada visible para GET /api/auth/me, aunque existe la ruta y tests; debe regenerarse o documentarse su ausencia.
4. Compose usa postgis:16-3.4 en algunos entornos mientras .github/workflows/ci-backend.yml usa postgis:16-3.5.
5. El TFG describe AWS/TLS/S3/backups como sistema cuando el repositorio documenta esos componentes como target o procedimiento pendiente.

### Project Tour recomendado

Un docs/project-tour.md sería de alto valor para una defensa. Debe proponer este recorrido:

1. qué es EntreLibros y qué no promete un Rincón;
2. arquitectura local y límites cloud objetivo;
3. App.tsx, routing y modo real/mock;
4. auth/profile/privacy;
5. books/listings/ISBN/editorial;
6. corners/community/map/PostGIS;
7. messages/Socket/agreement/notifications;
8. migraciones y entidades;
9. tests unitarios/integración/E2E;
10. Docker, CI, deployment y límites operativos.

## 18. Comentarios de código en inglés recomendados

No se deben agregar comentarios obvios. Los puntos que sí necesitan comentarios de conocimiento son:

| ID | Archivo/símbolo | Conocimiento a documentar |
| --- | --- | --- |
| COM-01 | backend/src/services/map.ts, transformación de coordenadas | por qué la ubicación pública se redondea/offsetea y qué privacidad preserva |
| COM-02 | backend/src/routes/community.ts y corner service | diferencia entre dirección interna, label público y coordenada aproximada |
| COM-03 | backend/src/socket.ts | por qué la escritura/replay necesita rooms autorizadas, cursor e idempotencia |
| COM-04 | backend/src/services/notifications.ts o equivalente | por qué el recordatorio se deriva en una ventana temporal y no por un worker |
| COM-05 | backend/src/repositories/agreementRepository.ts | invariantes de versiones, aceptación de ambas partes y outcomes |
| COM-06 | frontend/src/pages/messages/MessagesPage.tsx | frontera deliberada entre HTTP para escritura/drafts y Socket para entrega/invalidation |
| COM-07 | frontend/src/features/prototype/realData.adapters.ts | qué shape se adapta para demo y por qué no es una segunda fuente de persistencia |
| COM-08 | queries de communityDiscovery.ts | por qué bloqueos y visibilidad se aplican antes de suggestions/recommendations |
| COM-09 | backend/scripts/migrate.js | razón de normalizar CRLF y limitación de hashes ya aplicados |

Los comentarios futuros deben escribirse en inglés y explicar why, invariantes y comportamiento no obvio.

## 19. Performance

### Claramente recomendable

- conservar mediciones E2E de mapa/catálogo con dataset reproducible;
- fijar la imagen PostGIS entre Compose y CI o documentar deliberadamente la diferencia;
- medir requests duplicados e invalidaciones antes de dividir frontend.

### Requiere medición

- reducir invalidaciones React Query amplias;
- revisar joins de discovery y repositories grandes;
- evaluar paginación real en community/catalog cuando aumente el dataset;
- medir render y queries de MessagesPage en conversaciones grandes.

### No vale la pena ahora

- microoptimizar useMemo/useCallback sin perfil;
- reemplazar SQL legible por builders genéricos;
- optimizar cálculos pequeños de UI antes de resolver mapa/lista y contratos.

La prueba de mapa con p95 local cercano a 25,51 ms es una señal útil, no una garantía de producción ni una prueba de los filtros de catálogo del TFG.

## 20. Hallazgos priorizados

| ID | Área | Tipo | Prioridad | Riesgo | Dificultad | Evidencia resumida | Recomendación |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AUD-01 | baseline | FOLLOW-UP | P0 | medio | pequeña | rama auditada difiere de origin/main por PR #191 | repetir/confirmar contra main mergeado |
| DOC-01 | trazabilidad | DOCUMENT | P0 | bajo | pequeña | tfg-mvp-trazabilidad.md mezcla cierre y tablas antiguas | publicar estado único con commit/fecha |
| TEST-01 | frontend tests | TEST | P0 | medio | media | 449 asserts pasan, 5 read EINVAL, warnings act | limpiar lifecycle MSW/jsdom y hacer exit 0 |
| TEST-02 | backend tests | TEST | P0 | medio | media | hash drift 031–033 impide ejecutar suite | base limpia/estrategia reproducible, sin editar migraciones |
| MAP-01 | map | SIMPLIFY / TEST | P1 | medio | media | publications soportadas por MapCanvas, desactivadas en MapPage | definir un contrato único map/list y cubrirlo en E4 |
| MAP-02 | map | SIMPLIFY | P1 | bajo | pequeña | fallback sin ubicación no coincide exactamente con HU-4.1 | decidir UX/documentar comportamiento real |
| MOD-01 | editorial | FOLLOW-UP | P1 | alto | grande | estados y endpoints admin, sin moderación humana completa | cerrar alcance de moderación antes de prometerla |
| CAT-01 | books | FOLLOW-UP | P1 | medio | grande | no hay edición/genre/topic equivalente fuerte | decidir si es MVP, limitación o futuro |
| SEC-01 | security | FOLLOW-UP | P1 | alto | grande | claims TFG de email/MFA/rate-limit/secretos/S3 no demostrados | separar paquete de seguridad/deployment |
| OPS-01 | ops | FOLLOW-UP | P1 | alto | grande | backup/restore cloud solo documentado | crear evidencia operativa cuando esté autorizado |
| DOC-02 | OpenAPI | DOCUMENT | P1 | bajo | pequeña | /api/auth/me aparece en código/tests pero no visible en OpenAPI | sincronizar contrato generado/manual |
| DOC-03 | arquitectura | DOCUMENT | P1 | bajo | pequeña | conversation:leave y AWS/TLS difieren del runtime actual | documentar actual vs target |
| DOC-04 | studyability | DOCUMENT | P1 | bajo | media | no existe recorrido único de lectura del proyecto | crear Project Tour posterior |
| TEST-03 | defense evidence | TEST / DOCUMENT | P1 | medio | media | faltan capturas manuales de responsive/a11y/privacy | crear evidence pack versionado |
| FE-01 | messaging | SPLIT | P1 | medio | grande | MessagesPage 2.875 LOC, 20 states, 9 effects, 8 queries | dividir por casos de uso en OpenSpec separado |
| FE-02 | community | SPLIT | P1 | medio | media | CommunityFeedPage mezcla feed/discovery/corners/stats/mock | separar límites naturales después de contrato |
| BE-01 | books | SPLIT | P1 | medio | grande | routes/books.ts 1.797 LOC | dividir por bloques de endpoint, no controller universal |
| BE-02 | books | SPLIT | P1 | medio | grande | bookListingRepository.ts 1.572 LOC | separar casos de uso SQL con mapping explícito |
| BE-03 | community | SPLIT | P2 | medio | media | routes/community.ts 674 LOC y varios dominios | separar corners, social/discovery y metrics |
| FE-03 | book detail | SPLIT | P2 | medio | media | BookDetailModal 1.136 LOC | extraer lectura, acciones y disponibilidad |
| ARCH-01 | state | SIMPLIFY | P1 | medio | grande | PrototypeProvider global incluso en modo real | acotar modo mock y reducir fuente paralela |
| REUSE-01 | frontend API | DELETE / INLINE | P1 | bajo | media | APIs/hook books sin consumer productivo | trasladar reglas válidas y eliminar cadena test-only confirmada |
| REUSE-02 | backend API | DELETE / INLINE | P1 | bajo | media | createBook/listBooks/sendMessage solo tests | migrar cobertura al API canónico y retirar wrappers |
| REUSE-03 | API clients | REUSE | P2 | medio | media | fetchBookById y getBookById representan detalle paralelo | consolidar después de mapear proyecciones |
| REUSE-04 | auth | REUSE | P2 | bajo | pequeña | cookie parse repetido en HTTP/socket/books | helper pequeño solo si reduce riesgo |
| SOCK-01 | Socket.IO | FOLLOW-UP | P1 | alto | grande | dos caminos de entrega: committed event y socket directo | documentar/medir duplicados antes de cambiar protocolo |
| SOCK-02 | Socket.IO | DELETE / FOLLOW-UP | P2 | medio | pequeña | sendConversationMessage y returns sin consumer claro | confirmar dynamic imports/tests y eliminar solo si inequívoco |
| DATA-01 | data model | DOCUMENT | P1 | bajo | media | TFG y schema difieren en suggestions, reviews y relation | diagrama del modelo actual y mapping al TFG |
| A11Y-01 | frontend | TEST | P1 | medio | media | tests parciales, verificación manual pendiente | cubrir teclado/contraste/responsive |
| INFRA-01 | CI | SIMPLIFY | P2 | medio | pequeña | PostGIS 16-3.4 en Compose, 16-3.5 en CI | alinear o justificar versión |
| PERF-01 | performance | PERF | P2 | bajo | media | p95 map local sin SLA catalog | medir solo flujos con razón concreta |
| COM-01 | comments | COMMENT | P2 | bajo | pequeña | invariantes geoespaciales, socket, agreements y privacidad implícitos | comentarios en inglés centrados en decisiones |

## 21. Candidatos de código muerto, duplicado o innecesario

Esta sección no autoriza borrados. Son candidatos que requieren un OpenSpec de implementación o una verificación final de consumidores.

### Alta confianza, pero sujetos a traslado de cobertura

1. frontend/src/api/books/books.service.ts: fetchAllBooks, fetchBookById, createWantFromBook.
2. Hooks useBooks y useUserBooks si la búsqueda completa confirma que solo se usan desde sus tests.
3. backend/src/repositories/bookRepository.ts: createBook y listBooks si no existe consumidor dinámico o script externo.
4. backend/src/repositories/messagingRepository.ts: sendMessage si la producción solo usa sendMessageWithStatus y los tests se trasladan.
5. Helpers areUsersBlocked y withMessagingClient si la búsqueda de consumers no revela scripts, imports dinámicos o tooling.

### Deben conservarse

- fetchUserBooks, usado por Home/Community;
- getBookById de publication.service.ts, usado por el detalle;
- servicios y tipos de discovery/suggestions, usados por Community, mocks y tests;
- FeedActions, FeedItem.types, CornersMiniMap y APIs productivas de Community;
- conversation:message, agreement:updated, drafts, invalidación y reconexión;
- entidades de agreement/outcome/notification aunque algunas nacieran de etapas posteriores al primer diccionario del TFG.

### No afirmar muertos por ausencia en una ruta

La presencia o ausencia en App.tsx no es suficiente. La revisión de un candidato debe incluir imports indirectos, barrel exports, aliases, lazy/dynamic imports, tests, scripts, configuración, MSW, Storybook si apareciera y consumidores backend/Socket. Esta regla es especialmente importante para hooks, mocks y tipos compartidos.

## 22. Sobreimplementado o más rico que el TFG

No todo lo extra es deuda. Los siguientes elementos son más ricos que el diccionario inicial y deben explicarse, no eliminarse:

- acuerdos versionados, acceptances, reservations y outcomes;
- drafts de mensajes y replay Socket.IO;
- bloqueos aplicados transversalmente;
- social engagement, follows, discovery y recommendations por intereses;
- estados editoriales de books/corners;
- analytics events y métricas;
- fotos de perfil, privacidad granular y geospatial rounding.

Una defensa debe distinguir “más completo que el mínimo” de “más complejo sin valor”. Solo el segundo es candidato de simplificación.

## 23. Paquetes de trabajo futuros

### Package A - Baseline, trazabilidad y evidencia defendible

Objetivo: disponer de una fuente única y reproducible para afirmar qué está implementado. Hallazgos: AUD-01, DOC-01, DOC-02, DOC-03, TEST-01, TEST-02, TEST-03. Archivos: docs/tfg-mvp-trazabilidad.md, backend/openapi.json, scripts de tests/migración, configuración de CI/E2E y documentación de evidencia. Dependencias: branch/main estabilizado; no editar migraciones aplicadas. Riesgo: medio. Tests/evidencia: suites limpias, npm run verify:ci, Playwright 17+ y evidence pack.

### Package B - Cierre explícito de conformidad funcional MVP

Objetivo: resolver o documentar los gaps de mayor impacto en defensa: mapa/lista, fallback de ubicación, editorial/moderación, filtros y contrato de password. Hallazgos: MAP-01, MAP-02, MOD-01, CAT-01, TFG-INC-01, TFG-INC-03. Dependencias: decisión de alcance con el TFG. Riesgo: alto. Tests: E2E de publicación/mapa/editorial, autorización, filtros y screenshots.

### Package C - Retiro de APIs y wrappers test-only

Objetivo: reducir superficie sin cambiar el dominio productivo. Hallazgos: REUSE-01, REUSE-02 y candidatos de la sección 21. Dependencias: inventario final de consumidores, traslado de reglas válidas y tests canónicos. Riesgo: bajo/medio. Tests: frontend/backend typecheck, catálogo/mensajería, build y búsqueda post-cambio.

### Package D - Verdad del protocolo de mensajería

Objetivo: documentar y luego simplificar rutas HTTP/Socket sin perder persistencia, replay, drafts, acuerdos ni reconexión. Hallazgos: SOCK-01, SOCK-02, REUSE-03 y partes de MessagesPage. Dependencias: baseline E4 real y decisión sobre write protocol; no mezclar con un split visual grande. Riesgo: alto. Tests: dos usuarios, reload, reconnect, duplicate delivery, draft/send, agreement update y notifications.

### Package E - Simplificación frontend por casos de uso

Objetivo: reducir la dificultad de lectura de Messages, Community, Map, Profile y BookDetail. Hallazgos: FE-01, FE-02, FE-03, ARCH-01. Dependencias: contratos de Package B/D y API cleanup de Package C. Riesgo: medio/alto. Tests: mantener E2E y tests de comportamiento; eliminar estados derivados solo con regresión.

### Package F - Modularización backend acotada

Objetivo: separar rutas/repositories grandes por límites de negocio explicables. Hallazgos: BE-01, BE-02, BE-03. Dependencias: no cambiar SQL ni contrato en el primer paso; usar characterization tests. Riesgo: medio/alto. Tests: rutas/repositories, migraciones en DB limpia, build/typecheck y E2E afectado.

### Package G - Modelo de datos y documentación para estudio

Objetivo: explicar modelo actual, request flow, seguridad, socket y recorrido de lectura. Hallazgos: DATA-01, DOC-04, COM-01 a COM-09. Dependencias: estado funcional estabilizado. Riesgo: bajo. Tests: revisión de enlaces, rutas, nombres de eventos y comandos documentados.

### Package H - Seguridad y operación productiva

Objetivo: tratar gaps de email/MFA/rate-limit/secrets/TLS/object storage/backups/restore/incident response, si siguen siendo parte del alcance. Hallazgos: SEC-01, OPS-01, A11Y-01 e INFRA-01 cuando corresponda. Dependencias: decisión explícita de ambiente de defensa/producción. Riesgo: alto y fuera de una simplificación de código. Tests: security tests, restore drill, deployment smoke, scans y evidencia operativa.

## 24. Orden de ejecución recomendado

1. Confirmar el commit de referencia después del merge de PR #191 y volver a ejecutar búsquedas de consumidores.
2. Reparar la confiabilidad del baseline: DB de test limpia/hash drift, exit code frontend limpio y captura de E2E.
3. Corregir la trazabilidad documental y el OpenAPI drift sin cambiar comportamiento.
4. Decidir formalmente qué claims del TFG son MVP, target o futuro: password, moderación, mapa, reviews, AWS y backups.
5. Resolver primero el contrato mapa/lista y filtros si se necesita defender HU-4.2.
6. Ejecutar el cleanup de APIs/wrappers test-only con traslado de cobertura válida.
7. Documentar y estabilizar el protocolo Socket/HTTP antes de simplificar MessagesPage.
8. Dividir frontend por casos de uso naturales.
9. Dividir routes/repositories backend donde los tests de caracterización demuestren límites.
10. Crear Project Tour, modelo de datos, request flows y comentarios en inglés.
11. Tratar seguridad cloud, backups, accesibilidad manual y performance solo con alcance/evidencia aprobados.

Dentro de cada paquete: un bloque pequeño, tests específicos, revisión del diff, typecheck/build y solo después el siguiente bloque.

## 25. Qué no tocar todavía

- No reescribir MessagesPage mientras no exista una decisión explícita sobre HTTP/Socket write protocol.
- No cambiar persistencia, migraciones aplicadas, transactions, outbox o esquema para hacer coincidir literalmente el TFG.
- No introducir controllers/services/use-cases genéricos en todo el backend.
- No reemplazar React Query ni agregar otro state manager.
- No eliminar PrototypeContext completo sin decidir el valor de la demo/mock.
- No eliminar Socket.IO productivo, drafts, replay, agreements, notifications, unread, reconnection o bot sin pruebas E4.
- No afirmar que MapCanvas resuelve HU-4.2 si MapPage no lo conecta a publications/list.
- No inventar una entidad reviews/ratings solo para satisfacer una frase del TFG sin decidir alcance.
- No implementar AWS/S3/TLS/backups dentro de un paquete de simplificación.
- No hacer micro-optimizaciones antes de medir.
- No agregar cientos de comentarios obvios; solo documentar invariantes y decisiones.

## 26. Preparación para defensa oral

La demo más defendible debe seguir un recorrido vertical real:

1. visitante navega home, comunidad, mapa y un perfil público;
2. registra una cuenta y demuestra error de validación/duplicado;
3. inicia sesión, configura intereses, ubicación y privacidad;
4. publica un libro con ISBN, imagen y condición;
5. filtra el catálogo y muestra persistencia tras reload;
6. crea o muestra un Rincón y explica ubicación aproximada;
7. abre el mapa y explica claramente qué capas están realmente activas;
8. contacta desde libro/perfil;
9. envía un mensaje entre dos contextos de navegador sin reload;
10. crea, contrapropone y confirma un acuerdo;
11. muestra notificación, unread, recordatorio y outcome;
12. enseña tests E2E, migraciones, CI y límites operativos.

No conviene prometer durante la defensa reviews/ratings persistentes, moderación humana completa, email/MFA, AWS operativo, backup restore probado o un mapa de publicaciones si no se aporta evidencia correspondiente.

## 27. Evaluación final

EntreLibros ya tiene una base funcional considerable y una cobertura de integración útil para estudiar el producto. El reto no es demostrar que no existe implementación, sino reducir la distancia entre cuatro vistas que hoy no siempre coinciden:

1. el producto real ejecutado;
2. el modelo narrado por el TFG;
3. la documentación actual;
4. la evidencia que una persona puede repetir durante una defensa.

El siguiente paso de mayor valor no es una reescritura. Es convertir esa base en una explicación verificable: baseline limpio, estado documental único, contrato mapa/lista explícito, límites de editorial/seguridad claramente declarados y luego limpieza/módulos con pruebas de caracterización.

### Estado esperado después del programa

- una única fuente de verdad para el estado TFG/MVP;
- páginas y repositories divididos por casos de uso que puedan explicarse;
- menos wrappers y APIs test-only;
- protocolo Socket/HTTP documentado y sin ramas ambiguas;
- mapa/lista y filtros con contrato observable;
- documentación de estudio progresiva;
- comentarios en inglés sobre invariantes, no sobre sintaxis;
- evidencia E4 y capturas manuales suficiente para defender los flujos principales;
- límites cloud, seguridad avanzada y futuro claramente separados de lo que el MVP realmente ejecuta.

## 28. Inventario de evidencia consultada

### TFG

- TFG ULTIMA VERSION - ROJO - MARIANO.pdf: objetivos, alcance, HUs, backlog, aceptación, arquitectura objetivo, seguridad, backups, conclusiones y demo.

### Código y contratos

- frontend/src/App.tsx;
- frontend/src/routes/index.tsx;
- frontend/src/pages/messages/MessagesPage.tsx;
- frontend/src/pages/books/BooksPage.tsx;
- frontend/src/pages/community/CommunityFeedPage.tsx;
- frontend/src/pages/map/MapPage.tsx;
- frontend/src/pages/profile/ProfilePage.tsx;
- frontend/src/components/book/BookDetailModal/BookDetailModal.tsx;
- frontend/src/hooks/useChatSocket.ts;
- frontend/src/features/prototype/PrototypeContext.tsx;
- backend/src/app.ts;
- backend/src/routes/auth.ts, books.ts, community.ts, messages.ts, agreements.ts, user.ts;
- backend/src/services/map.ts, communityDiscovery.ts y communityCorners.ts;
- backend/src/repositories/bookListingRepository.ts, messagingRepository.ts, agreementRepository.ts;
- backend/src/socket.ts;
- backend/openapi.json;
- backend/migrations/001_init.sql hasta 035_create_message_drafts.sql.

### Pruebas e infraestructura

- frontend/tests, backend/tests, e2e/tests;
- e2e/fixtures, e2e/scripts, playwright.config.ts;
- package.json, package-lock.json;
- .github/workflows/ci-backend.yml, .github/workflows/ci-e2e.yml, workflows de deploy;
- docker-compose*.yml, Dockerfiles y frontend/nginx.conf.

### Documentación del proyecto

- docs/estado-actual.md;
- docs/tfg-mvp-trazabilidad.md;
- docs/arquitectura.md;
- docs/e2e-baseline.md;
- docs/recovery-baseline.md;
- docs/security-runbook.md;
- docs/threat-model.md;
- docs/messaging-bubbles.md;
- docs/public-visitor-matrix.md;
- docs/base_de_datos.md;
- docs/frontend-backend-integration.md;
- docs/roadmap.md y docs/backlog.md.
## 29. Métricas informativas y límites de la estimación

No se eliminaron archivos ni se modificó código durante este Explore. Por eso las siguientes métricas son candidatos de investigación, no un objetivo artificial:

| Métrica | Estimación actual | Confianza | Nota |
| --- | ---: | --- | --- |
| archivos productivos grandes prioritarios | 10 | alta | listado de hotspots; no implica que todos deban dividirse |
| símbolos/API frontend probablemente test-only | 6 o más | media/alta | requiere confirmar dynamic imports, tooling y traslado de cobertura |
| símbolos/repository backend probablemente test-only | 5 o más | media | createBook/listBooks/sendMessage/helpers; revisar scripts externos |
| tests potencialmente retirables junto con wrappers | 6 o más | media | no retirar si contienen reglas de negocio no trasladadas |
| dependencias npm eliminables confirmadas | 0 | alta | no se encontró una dependencia segura para borrar en esta auditoría |
| assets eliminables confirmados en el checkout | 0 contados | media | la limpieza de PR #191 ya retiró assets legacy; repetir sobre main mergeado |
| traducciones eliminables confirmadas | 0 contadas | media | pueden quedar claves huérfanas, pero hace falta un extractor confiable |
| LOC reducibles por cleanup seguro | no certificado | baja/media | no estimar LOC sin una cadena de eliminación aprobada |
| LOC de hotspots que podrían dividirse | no es métrica objetivo | alta | dividir no necesariamente reduce LOC |

La cifra de 0 dependencias incluye una cautela explícita: Socket.IO, React Query, MSW, Playwright y PostGIS se consideran productivos o de tooling hasta que un análisis de manifests y configuración demuestre lo contrario.

## 30. Clasificación de estados utilizada

- COMPLIANT: respaldado por implementación y evidencia suficiente para el criterio.
- PARTIAL: implementado con alcance menor, contrato diferente o evidencia incompleta.
- MISSING: no se encontró implementación ni sustituto razonable para el requisito.
- IMPLEMENTED_DIFFERENTLY: existe una solución funcional, pero no coincide con el diseño textual del TFG.
- DOC_ONLY: la afirmación existe en documentación, sin prueba equivalente en runtime.
- IMPLEMENTED_UNDOCUMENTED: el código lo hace, pero la documentación no lo explica de forma actual.
- FUTURE_NOT_REQUIRED: capacidad descrita como evolución posterior, no gap del MVP.
- CANNOT_VERIFY: no hay evidencia reproducible suficiente para afirmar cumplimiento.
- TFG_INCONSISTENT: el TFG o sus documentos asociados contienen formulaciones incompatibles.

Cuando dos estados aparecen juntos, el primero describe el resultado funcional y el segundo el origen de la incertidumbre o la diferencia.

## 31. Hallazgos documentales frente a hallazgos de implementación

### Docs-only o de evidencia

- TFG-INC-02: trazabilidad con histórico mezclado.
- TFG-INC-04: AWS/TLS/S3/backups no demostrados por runtime.
- DOC-01: fuente única de estado.
- DOC-02: OpenAPI posiblemente incompleto para auth/me.
- DOC-03: protocolo Socket documentado con evento no observado.
- DOC-04: falta Project Tour.
- TEST-03: falta evidence pack manual.
- COM-01 a COM-09: conocimiento no explicitado en comentarios.

### Implementación que requiere decisión de producto

- MAP-01 y MAP-02: mapa/lista y fallback de ubicación.
- MOD-01: moderación/editorial.
- CAT-01: edición, género y tema.
- TFG-INC-01: política de password.
- TFG-INC-05: reviews/ratings.
- SEC-01 y OPS-01: seguridad y operación cloud.
- SOCK-01: dos rutas internas de entrega Socket/HTTP.

No mezclar ambos grupos. Corregir documentación no hace aparecer una feature; implementar una feature tampoco corrige por sí sola una afirmación histórica.

## 32. Bloqueadores de defensa

Se consideran bloqueadores de explicación o evidencia, no necesariamente bloqueadores de ejecución del MVP:

1. no tener un commit de referencia único entre la rama auditada y main;
2. no poder ejecutar limpiamente el backend por migration hash drift;
3. que el frontend test runner salga con errores no controlados aunque los asserts pasen;
4. mostrar el TFG como evidencia de AWS/S3/TLS/backups sin una ejecución o artefacto real;
5. afirmar que el mapa y la lista contienen las mismas publicaciones cuando MapPage desactiva esa capa;
6. afirmar moderación humana completa sin UI/workflow;
7. afirmar reviews/ratings persistentes sin tablas/rutas;
8. no explicar la diferencia entre recordatorio derivado al consultar y scheduler;
9. no disponer de capturas manuales para responsive, keyboard, contraste y privacidad;
10. tener dos versiones narrativas de la trazabilidad MVP.

## 33. Matriz de riesgo y mitigación

| Riesgo | Probabilidad | Impacto | Mitigación antes de un Propose |
| --- | --- | --- | --- |
| consumer dinámico de un API aparentemente muerto | media | alto | rg de imports dinámicos, aliases, scripts, build y tests post-cleanup |
| doble entrega Socket/HTTP | media | alto | characterization E4 con dos usuarios, reload y reconexión |
| cambio de privacidad por reutilizar mapping | media | alto | tests de proyección pública y bloqueo; revisar cada DTO |
| borrar test que contiene regla de negocio | media | alto | trasladar primero la regla al flujo canónico |
| migración aplicada con hash distinto | alta en entorno local actual | medio | DB aislada/limpia; nunca editar migraciones aplicadas |
| documentación que vuelve a quedar obsoleta | media | medio | incluir commit/fecha/evidence level y revisión en CI si es viable |
| separar por LOC y romper cohesión SQL | media | medio | dividir por caso de uso y conservar queries explicables |
| confundir mock con runtime real | alta | medio | etiquetar E2 como MSW y exigir E3/E4 para claims de persistencia |
| cerrar un gap del TFG cambiando alcance accidentalmente | media | alto | decisión explícita de MVP/target/futuro antes de implementar |

## 34. Criterios para el próximo OpenSpec Propose

Un Propose posterior debería incluir solamente un conjunto de hallazgos con:

- commit de referencia confirmado;
- archivo/símbolo concreto;
- consumidores estáticos y dinámicos revisados;
- comportamiento productivo preservado identificado;
- tests que protegen el flujo;
- clasificación de evidencia antes/después;
- criterio de rollback o reversibilidad;
- límites explícitos respecto de TFG y arquitectura futura.

Para cleanup test-only, el Propose debe exigir:

1. búsqueda de consumidores desde source, tests, tooling, CI y configuración;
2. traslado de cualquier regla de negocio;
3. eliminación en cadenas pequeñas;
4. typecheck, lint, build y tests del dominio después de cada cadena;
5. búsqueda negativa final del símbolo/ruta/evento;
6. revisión de diff y npm run verify:ci.

Para cambios funcionales de mapa, editorial, seguridad o Socket, debe evitarse el lenguaje cleanup: son paquetes de producto/contrato separados.

## 35. Conclusión para el futuro Propose

La oportunidad de mayor valor es hacer que el repositorio y la memoria del TFG cuenten la misma historia, no agregar capas. La primera etapa segura debería estabilizar evidencia y documentación, retirar solo APIs/wrappers realmente sin consumidores y dejar preparada la separación posterior de páginas y repositories.

La implementación productiva que debe tratarse como fuente de verdad es la que está montada en el routing y respaldada por E3/E4. Los elementos cercanos —mocks, adapters, tipos, Socket.IO, PostGIS y componentes compartidos— no deben eliminarse por ubicación o por nombre histórico.

El resultado de este Explore no propone todavía cambios de código. Propone una secuencia de decisiones verificables para que el próximo OpenSpec pueda ser pequeño, revisable y defendible:

- primero baseline y trazabilidad;
- después decisiones de conformidad explícitas;
- luego cleanup de baja ambigüedad;
- finalmente simplificación estructural por casos de uso.
