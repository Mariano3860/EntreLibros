# Estado, alcance y definiciones pendientes del MVP

Fecha de referencia: 2026-08-29

Este documento es la base funcional para continuar el MVP de EntreLibros. Su objetivo es distinguir qué está implementado, qué está parcialmente implementado y qué decisiones de producto todavía deben resolverse antes de crear una nueva OpenSpec.

No es un backlog técnico ni una lista de tareas. Las preguntas de este documento deben resolverse primero en una conversación de producto. Recién después se deben convertir las decisiones confirmadas en una OpenSpec y, posteriormente, en tareas.

## Cómo leer este documento

- **Hecho:** existe una implementación verificable en el repositorio y cubre el comportamiento principal indicado.
- **Parcial:** hay una parte funcional, pero falta al menos un criterio de aceptación o no está integrada completamente.
- **Pendiente de definición:** no conviene implementar todavía porque falta decidir el comportamiento esperado.
- **P0:** bloquea una parte central del MVP o puede producir una interpretación incorrecta del producto.
- **P1:** importante para completar una historia comprometida, pero no bloquea toda la aplicación.
- **P2:** mejora válida, pero puede quedar fuera del primer cierre del MVP.

## Resumen ejecutivo

La aplicación ya tiene una base funcional real en autenticación, perfiles básicos, publicaciones, mapa, mensajería, acuerdos y persistencia. También cuenta con pruebas automatizadas, migraciones y un bot persistente para verificar la mensajería.

El MVP todavía no está completamente cerrado porque varias historias tienen una implementación técnica que no cubre todos sus criterios de aceptación. Las brechas más importantes son:

1. intereses y selección de zona del perfil;
2. moderación editorial de publicaciones y Rincones;
3. coherencia completa entre búsqueda, mapa y listado;
4. acceso a mensajes desde perfiles y publicaciones;
5. notificaciones visibles con texto y navegación al evento;
6. recordatorios de acuerdos;
7. definición precisa del cierre de sesión y del español neutro.

La mensajería y las notificaciones ilustran la diferencia entre infraestructura y experiencia de producto: ya existe persistencia, deduplicación, API y punto rojo, pero todavía falta diseñar el aviso visible que comunica qué ocurrió y permite llegar al lugar exacto.

## Estado de las historias comprometidas

### HU-1.2 — Inicio y cierre de sesión

**Prioridad original:** Alta · **Estado:** Parcial · **Prioridad para continuar:** P1

#### Ya existe

- Registro de usuarios.
- Inicio de sesión con credenciales válidas.
- Rechazo de credenciales inválidas.
- Cookie de sesión HTTP-only.
- JWT con expiración de 24 horas.
- Protección de endpoints y rutas autenticadas.
- Cierre de sesión desde la interfaz.

#### Diferencia con el criterio de aceptación

El cierre de sesión elimina la cookie del navegador. Al tratarse de JWT, un token copiado conservaría validez criptográfica hasta su vencimiento. Por lo tanto, “invalidar el token” puede significar dos cosas distintas:

1. cerrar la sesión del navegador eliminando la cookie; o
2. revocar el token en el backend aunque todavía no haya vencido.

#### Decisión necesaria

Definir cuál de las dos interpretaciones forma parte del MVP. No se debe diseñar una lista negra o un sistema de sesiones revocables sin confirmar que el trabajo académico exige esa garantía.

### HU-1.3 — Idioma neutro de interfaz

**Prioridad original:** Media · **Estado:** Parcial · **Prioridad para continuar:** P1

#### Ya existe

- Sistema de traducciones.
- Español e inglés.
- Selector de idioma.
- Persistencia del idioma.
- Mensajes de error y textos de interfaz mayormente centralizados.

#### Falta revisar

- Que el español sea realmente neutro y no mezcle “vos”, “tú” y formas impersonales.
- Que los textos nuevos no estén escritos directamente en componentes.
- Que los términos sean consistentes: publicación, ejemplar, Rincón, acuerdo, intercambio y notificación.
- Que los documentos Markdown estén correctamente codificados y escritos en español.

#### Decisión necesaria

Definir una regla simple de estilo: persona gramatical, tono, nombres oficiales de las entidades y palabras que deben evitarse. La decisión debe ser lingüística y de producto, no una tarea técnica todavía.

### HU-1.4 — Edición de perfil de usuario

**Prioridad original:** Alta · **Estado:** Parcial · **Prioridad para continuar:** P0

#### Ya existe

- Edición de alias.
- Edición de descripción.
- Selección de idioma.
- Visibilidad pública o privada del perfil.
- Granularidad pública de ubicación: privada, ciudad o barrio.
- Perfil público sin correo ni contraseña.

#### Falta

- Campo o conjunto de intereses.
- Regla de que el usuario tenga al menos tres intereses.
- Edición explícita de barrio o ciudad.
- Flujo para elegir una zona sin exponer una dirección exacta.
- Visualización de intereses y zona en el perfil público.

#### Decisiones necesarias

- Si los intereses son texto libre, opciones predefinidas o una combinación.
- Si tres intereses es un mínimo obligatorio para guardar o solo una recomendación.
- Si el usuario puede elegir barrio, ciudad o ambas cosas.
- Si la zona se obtiene mediante búsqueda, mapa, selector territorial o geolocalización.
- Qué se muestra cuando el perfil es privado.
- Si el nombre real y el alias tienen roles diferentes en la interfaz.

### HU-1.5 — Privacidad y visibilidad de datos

**Prioridad original:** Alta · **Estado:** Hecho en su alcance principal · **Prioridad para continuar:** P1

#### Ya existe

- No se expone la contraseña.
- No se expone el correo en perfiles públicos.
- No se muestra calle ni altura exacta a otros usuarios.
- Las coordenadas públicas se redondean según la visibilidad elegida.
- Existen controles de visibilidad del perfil y la ubicación.

#### Decisión necesaria

Confirmar si la auditoría de accesos mencionada en versiones anteriores pertenece al MVP académico. Si no es necesaria, debe quedar registrada como trabajo posterior y no como faltante actual.

## HU-2.1 — Alta de Rincón de Libros

**Prioridad original:** Alta · **Estado:** Parcial · **Prioridad para continuar:** P1

#### Ya existe

- Formulario por pasos.
- Nombre, reglas, horario, foto y zona.
- Búsqueda de dirección y vista previa.
- Preferencia de visibilidad territorial.
- Persistencia real en PostgreSQL/PostGIS.
- Edición autenticada por el propietario.
- Estados activo y pausado.
- Aparición en el mapa.

#### Falta

- Detección de publicaciones sospechosas.
- Estado pendiente de revisión.
- Cola o vista para moderación.
- Aprobación o rechazo manual con motivo.

#### Decisiones necesarias

- Si todo Rincón válido se aprueba automáticamente.
- Qué situaciones deben enviarlo a revisión.
- Si la moderación es parte del MVP o una ampliación posterior.
- Qué rol puede moderar.
- Qué ve el anfitrión mientras el Rincón está pendiente u observado.

## HU-3.1 — Publicar ejemplar

**Prioridad original:** Alta · **Estado:** Mayormente hecho · **Prioridad para continuar:** P1

#### Ya existe

- Publicación de libros propios.
- Título, autor, estado y modalidad.
- ISBN opcional.
- Imágenes.
- Persistencia real.
- Edición de publicaciones propias.
- Lectura pública.
- Estados de disponibilidad.
- Validaciones de campos y reglas de entrega.
- Consulta de metadata cuando existe un ISBN utilizable.

#### Falta comprobar como producto

- Que el flujo completo real no dependa de MSW.
- Que todos los estados mostrados al usuario correspondan a los estados del modelo.
- Que el significado de “ofrezco”, “busco”, “venta” e “intercambio” sea inequívoco.

#### Decisiones necesarias

- Si la foto es opcional para todos los tipos de publicación.
- Qué ocurre cuando ISBN no devuelve metadata.
- Qué campos puede editar el propietario después de publicar.
- Cuándo una publicación deja de estar disponible.

## HU-3.2 — Validación editorial

**Prioridad original:** Alta · **Estado:** Pendiente en sentido completo · **Prioridad para continuar:** P0

#### Ya existe

- Validaciones de campos obligatorios.
- Límites de tamaño y tipo de imágenes.
- Validaciones de estados, precios y modalidades.
- Protección básica contra entradas inválidas.

#### Falta

- Política de contenido permitido y prohibido.
- Detección de duplicados exactos.
- Detección de spam o enlaces externos sospechosos.
- Estados editoriales aprobado, pendiente y rechazado.
- Motivo visible para el usuario.
- Corrección y reenvío de una publicación pendiente.
- Revisión manual para casos no resueltos automáticamente.

#### Decisiones necesarias

- Qué reglas son categóricas y provocan rechazo automático.
- Qué reglas solo dejan la publicación pendiente.
- Si la validación aplica igual a libros y Rincones.
- Quién puede revisar excepciones.
- Si una publicación pendiente es visible para su propietario.

## HU-3.3 — Búsqueda con filtros

**Prioridad original:** Alta · **Estado:** Parcial · **Prioridad para continuar:** P0

#### Ya existe

- API con filtros parametrizados.
- Texto, autor, ISBN, idioma, estado y distancia.
- Paginación limitada.
- Consultas geográficas en backend.

#### Falta o no está completamente integrado

- Una experiencia de búsqueda general claramente diferenciada de “mis libros”.
- Filtros combinables visibles para el usuario.
- Filtro de género, si se mantiene en la historia.
- Mensajes orientativos cuando no hay resultados.
- Confirmación del requisito de rendimiento de menos de dos segundos en un escenario representativo.

#### Decisiones necesarias

- Qué pantalla es la búsqueda principal del producto.
- Si la búsqueda incluye publicaciones propias o solo las de la comunidad.
- Cuáles filtros son obligatorios en el MVP.
- Si el género existe en el modelo o debe eliminarse de la historia.
- Qué significa “distancia” cuando el usuario no tiene zona configurada.

## HU-4.1 — Ordenar resultados por cercanía

**Prioridad original:** Alta · **Estado:** Parcial · **Prioridad para continuar:** P1

#### Ya existe

- Geolocalización del navegador.
- Cálculo de distancia.
- Radio de búsqueda.
- Bounding box para limitar consultas.
- Filtros geográficos en backend.

#### Decisiones necesarias

- Si la ubicación de referencia es la ubicación del navegador, el barrio o la ciudad.
- Qué ocurre cuando el usuario rechaza la geolocalización.
- Qué ocurre si no tiene zona en el perfil.
- Si se debe pedir una zona antes de buscar o mostrar resultados sin ordenar.
- Si la distancia exacta se muestra o solo se usa internamente para ordenar.

## HU-4.2 — Visualizar mapa y listado

**Prioridad original:** Alta · **Estado:** Parcial · **Prioridad para continuar:** P0

#### Ya existe

- Mapa interactivo.
- Pines de Rincones y publicaciones.
- Capas y filtros.
- Estados de carga, error y vacío.
- Selección de elementos en el mapa.

#### Falta definir o completar

- Qué listado acompaña al mapa y si siempre representa exactamente los mismos resultados.
- Qué campos aparecen en un pin.
- Qué campos aparecen en el detalle.
- Cómo se sincronizan selección de mapa y selección de lista.
- Qué sucede cuando un resultado queda fuera del área visible.

#### Decisiones necesarias

- Si el mapa y el listado viven en una misma pantalla.
- Si se muestran libros, Rincones o ambos en el mismo resultado.
- Cuál es el comportamiento de un clic en cada tipo de pin.
- Si el detalle permite iniciar una conversación.

## HU-5.1 — Mensajería 1:1

**Prioridad original:** Alta · **Estado:** Parcial avanzada · **Prioridad para continuar:** P0

#### Ya existe

- Conversaciones privadas persistentes.
- Historial recargable.
- Mensajes persistentes.
- Comunicación en tiempo real mediante Socket.IO.
- Reintentos e idempotencia.
- Control de acceso a conversaciones.
- Bot persistente para pruebas locales.
- Envío de libros dentro de la conversación.
- Propuestas y acuerdos dentro de la conversación.
- Nombre del participante en la conversación.
- Avatar genérico cuando no hay imagen de perfil.
- Indicador de mensaje no leído.
- Marcado como leído al abrir la conversación.

#### Falta

- Enlace “Enviar mensaje” desde la ficha de un libro.
- Enlace “Enviar mensaje” desde el perfil de otro usuario.
- Mensajes predefinidos.
- Navegación a un mensaje exacto desde una notificación.

#### Decisiones necesarias

- Qué acción crea una conversación nueva.
- Qué texto tienen los mensajes predefinidos.
- Si se permite escribirle a cualquier usuario o solo al propietario de una publicación.
- Qué sucede con conversaciones con usuarios bloqueados.
- Si abrir la conversación marca todo como leído o solo hasta el último mensaje visible.

## HU-5.2 — Crear y confirmar acuerdo

**Prioridad original:** Alta · **Estado:** Parcial avanzada · **Prioridad para continuar:** P0

#### Ya existe

- Propuesta de acuerdo.
- Libro relacionado.
- Lugar o punto de encuentro.
- Zona.
- Fecha y hora.
- Contrapropuesta.
- Confirmación.
- Cancelación.
- Versionado e historial.
- Control de concurrencia.
- Representación del acuerdo dentro del chat.

#### Falta

- Recordatorio previo a la fecha del encuentro.
- Definición del comportamiento cuando cambia la fecha u hora.
- Definición del comportamiento después de cancelar un acuerdo confirmado.

#### Decisiones necesarias

- Cuánto tiempo antes se envía el recordatorio.
- Si el recordatorio es solo in-app.
- Si lo reciben ambos participantes.
- Qué pasa si el acuerdo se confirma después de la fecha prevista.
- Qué significa “rechazar” y si debe quedar registrado en el historial.

## HU-5.3 — Notificaciones de eventos

**Prioridad original:** Media · **Estado:** Parcial · **Prioridad para continuar:** P0

#### Ya existe

- Persistencia de notificaciones.
- Notificaciones para mensajes.
- Notificaciones relacionadas con acuerdos.
- Deduplicación por evento.
- Preferencia básica para activar o desactivar notificaciones in-app en backend.
- Punto rojo integrado en la sección Mensajes.
- El punto desaparece al abrir la conversación y marcar el mensaje como leído.

#### Falta

- Aviso temporal visible dentro de la aplicación.
- Texto contextual con el nombre de la persona o el evento.
- Clic que lleve a la conversación correspondiente.
- Navegación al mensaje o evento exacto.
- Aviso específico para confirmación, cancelación y posiblemente recordatorio de acuerdos.
- Pantalla o control visible para la preferencia de notificaciones, si se considera necesaria para el MVP.

## Diseño pendiente de notificaciones

Antes de implementar el aviso, hay que acordar el comportamiento observable.

### Eventos que deben producir avisos

- Mensaje nuevo recibido.
- Acuerdo confirmado.
- Acuerdo cancelado, si se considera relevante.
- Recordatorio de un acuerdo confirmado, si se mantiene dentro del MVP.

### Contenido mínimo

Ejemplos orientativos, sujetos a decisión final:

- “Nuevo mensaje de Usuario demo mensajería”.
- “Acuerdo confirmado con Mariano”.
- “El acuerdo con Ana fue cancelado”.

El aviso debería usar el nombre público o alias definido para la otra persona. No debería mostrar correo electrónico ni datos privados.

### Comportamiento que falta definir

- Posición del aviso: por ejemplo, arriba a la derecha.
- Duración visible.
- Si puede haber varios avisos apilados.
- Si se puede cerrar manualmente.
- Si el aviso aparece cuando el usuario ya está dentro del chat.
- Si un mensaje nuevo genera aviso cuando la conversación está abierta.
- Si el clic abre solo la conversación o también enfoca el mensaje exacto.
- Cómo se resalta temporalmente el mensaje de destino.
- Cuándo se considera leído.
- Qué ocurre si el usuario desactiva notificaciones in-app.
- Cómo se evita mostrar dos veces el mismo evento.

### Destino del clic

Para un mensaje, el destino debería ser la conversación y, si el diseño lo permite, el mensaje específico. Para un acuerdo, el destino debería ser el evento del acuerdo dentro de la conversación. Esto requiere definir si la aplicación tendrá una forma de identificar y enfocar un mensaje concreto, no solo una conversación.

## Prioridades para el próximo diseño

Estas prioridades no son tareas de implementación. Ordenan las conversaciones que hay que tener antes de escribir la próxima OpenSpec.

### P0 — Definir antes de seguir ampliando funcionalidades

- Notificaciones visibles, contenido y navegación.
- Intereses y zona del perfil.
- Reglas de validación editorial.
- Relación entre mapa, listado y detalle.
- Entrada a mensajería desde perfil y publicación.
- Recordatorios y estados finales de acuerdos.

### P1 — Definir para cerrar el MVP con coherencia

- Semántica exacta del logout.
- Español neutro y glosario.
- Experiencia completa de búsqueda y filtros.
- Comportamiento sin geolocalización.
- Criterio final para auditoría de privacidad.

### P2 — Mantener fuera del siguiente alcance salvo decisión expresa

- Reputación y reseñas reales.
- Moderación avanzada.
- Denuncias y panel completo de administración.
- Notificaciones por correo o push.
- Preferencias avanzadas por tipo de evento.
- Métricas de producto más allá de las comprobaciones actuales.

## Lo que no debe asumirse como faltante del MVP

No se debe agregar automáticamente funcionalidad solo porque aparezca en una especificación técnica anterior. En particular, reputación, moderación avanzada, email, push, métricas completas y gobierno avanzado del dato deben permanecer fuera del próximo alcance hasta que se confirme su relación con las historias comprometidas y con el TFG.

## Regla para crear la próxima OpenSpec

Cuando se solicite una nueva OpenSpec, primero hay que indicar qué historia o conjunto de historias se quiere abordar y revisar las preguntas abiertas de este documento.

La OpenSpec no debería crearse hasta confirmar, como mínimo:

1. qué comportamiento verá el usuario;
2. qué criterios de aceptación quedan dentro y fuera;
3. qué datos son necesarios;
4. qué estados y errores existen;
5. qué navegación se espera;
6. qué parte es MVP y qué parte queda explícitamente fuera;
7. cómo se comprobará manualmente el resultado.

Si alguna de esas respuestas no está definida, hay que detenerse y preguntar antes de generar tareas o diseño técnico.

## Referencias del repositorio

- [`estado-actual.md`](estado-actual.md): comprobaciones técnicas y límites operativos.
- [`backlog.md`](backlog.md): trazabilidad histórica del producto y del trabajo realizado.
- [`roadmap.md`](roadmap.md): posibles ampliaciones futuras.
- [`messaging-bubbles.md`](messaging-bubbles.md): comportamiento visual actual de los mensajes y acuerdos.
- [`base_de_datos.md`](base_de_datos.md): modelo persistente y migraciones.
- [`troubleshooting.md`](troubleshooting.md): diagnóstico de entorno, mocks, migraciones y mensajería.
