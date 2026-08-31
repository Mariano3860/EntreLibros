## Why

La interfaz ya reproduce gran parte del lenguaje visual del prototipo ideal, pero varias acciones esenciales siguen siendo decorativas o usan datos desconectados: explorar, mapear rincones, conversar, administrar el perfil e interactuar en Comunidad. Esto rompe la expectativa creada por el diseño y dificulta comprobar el producto con datos reales antes de cada merge.

El cambio convierte esas regiones en recorridos verificables, preservando la composición de `Screens/Prototipo ideal/img.png` e `img_1.png` como contrato visual de referencia.

## What Changes

- Limitar el rail de Inicio a cinco recomendaciones y añadir una navegación compacta para renovar el conjunto visible, priorizando libros de personas seguidas sin recargar la interfaz.
- Hacer operativos en `/books` la búsqueda, filtros, pestañas sin scroll vertical, publicaciones de tipo `want`, acciones para guardar/interesarse por libros y el flujo de crear una búsqueda de libro.
- Conectar el mini mapa de Comunidad al mismo conjunto de rincones, selección y navegación que el mapa principal.
- Hacer que seleccionar o abrir un Rincón en `/map` centre y aproxime el mapa, abra un detalle enriquecido y sincronice rail, pines y publicación seleccionada.
- Sustituir el slider decorativo de distancia por radios discretos (`1 km`, `5 km`, `30 km`, `50 km`, sin límite), perímetro visible desde la ubicación aproximada y filtrado consistente de mapa, rail y resultados.
- Recuperar la experiencia completa de mensajería: crear conversaciones por nombre, contactos seguidos/sugeridos, filtro de no leídos, burbujas, libros de ambos participantes, adjuntos y propuestas de intercambio.
- Ampliar la edición de perfil con foto, intereses, ubicación estructurada y controles de visibilidad por nivel geográfico, sin exponer datos precisos por defecto.
- Persistir me gusta, comentarios y compartir en Comunidad, y retirar la persona autenticada de la tira de historias para mostrar solo historias de otros perfiles seguidos o relevantes.
- Dividir la implementación en diez entregables independientes, uno por punto solicitado. Cada entregable deberá vivir en una rama propia, tener commits claros, pruebas de cobertura pertinentes, revisión visual contra el prototipo a 1440×900 y una PR en español contra `main`. El merge queda reservado al usuario.

## Capabilities

### New Capabilities

- `home-recommendation-rail`: recomendaciones personales paginadas o renovables en bloques de cinco, con prioridad social y apertura de detalle sin navegación inesperada.
- `book-discovery-and-want-list`: exploración de libros con filtros funcionales, búsquedas publicadas, interés/guardado y una navegación de pestañas accesible y sin scroll espurio.
- `corner-map-synchronization`: mini mapa y mapa principal sincronizados, selección de rincones, detalle enriquecido y radio geoespacial visible y efectivo.
- `messaging-contact-and-exchange-workflow`: descubrimiento de contactos, filtro de conversaciones, adjuntos de libros, burbujas y propuestas de intercambio dentro del chat.
- `profile-privacy-editor`: edición ampliada de identidad, intereses, foto y ubicación con controles explícitos de divulgación geográfica.
- `community-social-engagement`: reacciones, comentarios, compartidos e historias relevantes, persistidos y autorizados.

### Modified Capabilities

Ninguna. El repositorio no mantiene capacidades principales activas bajo `openspec/specs/`; estas especificaciones establecen el contrato actual para las extensiones funcionales.

## Impact

- Frontend: `HomePage`, `BooksPage`, `CommunityFeedPage`, `MapPage`, `MessagesPage`, `ProfilePage`, sus modales, servicios, mocks, i18n y estilos.
- Backend y datos: rutas y repositorios de publicaciones, búsquedas/intereses, Comunidad, rincones, geolocalización, mensajes, acuerdos, perfiles y nuevas migraciones acumulativas cuando la persistencia no exista.
- UX y privacidad: los rangos de mapa usarán ubicación aproximada; los datos de perfil serán privados salvo el nivel de visibilidad elegido; las mutaciones devolverán errores i18n y respetarán propiedad, seguimiento y bloqueos.
- Calidad: pruebas unitarias, de API, componentes y recorridos; typecheck, lint, Stylelint, build, `git diff --check` y revisión visual manual en navegador usando las dos láminas del prototipo como referencia.
