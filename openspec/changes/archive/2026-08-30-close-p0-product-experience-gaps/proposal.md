## Why

La validación manual del 2026-08-30 encontró una brecha entre las capacidades técnicas documentadas y la experiencia que recibe una persona autenticada: varias pantallas muestran datos incompletos o mockeados, y acciones principales no tienen efecto. Esto debe resolverse ahora porque afecta la confianza en el catálogo, la comunidad, el mapa y los intercambios, y bloquea el cierre funcional del MVP.

## What Changes

- Conectar inicio, catálogo, “Mis libros”/“Mi actividad” y Comunidad con datos reales del usuario y de otros usuarios, manteniendo los mocks solo para pruebas o demo explícita.
- Hacer funcionales los enlaces “Ver todos”, el botón “Publicar” de Comunidad y la entrada unificada “Todos” del catálogo; “Todos” será siempre un superset de los libros propios visibles para la persona autenticada, sin exponer libros privados ajenos.
- Convertir “Publicar” en Comunidad en un compositor de historias sociales relacionadas con libros (texto, imagen opcional y libro enlazado), persistidas en el feed real.
- Definir y aplicar la navegación canónica del listado completo (`/books` o `/books/all`) y el alcance de “Mi actividad”.
- Corregir el contraste del flujo de publicación en modo oscuro y el recorte de imágenes de Rincones de Libros.
- Reparar el mini mapa comunitario, sus capas, contenido y tres controles.
- Centrar `/map` en la ubicación disponible del usuario, mostrar un indicador de ubicación respetuoso de la privacidad y hacer operativo el filtro de distancia hasta 25 km.
- Abrir los chats en el mensaje más reciente y cargar los libros reales del usuario al adjuntar un libro o proponer un intercambio; persistir el adjunto seleccionado dentro del mensaje.
- Incorporar confirmación modal antes de cerrar sesión.
- Añadir pruebas de comportamiento y una verificación de navegador con mocks desactivados para los recorridos P0.

## Capabilities

### New Capabilities

- `catalog-listing-lifecycle`: catálogo completo, libros propios, actividad, navegación “Todos” y publicación legible en ambos temas.
- `community-map`: feed comunitario real, Rincones, mini mapa, publicación desde Comunidad y mapa principal con ubicación/filtros.
- `realtime-messaging`: posición del historial y selección de libros reales desde el chat.
- `exchange-agreements`: selección de publicaciones disponibles al proponer un intercambio.
- `identity-profile-reputation`: confirmación explícita del cierre de sesión.

### Modified Capabilities

No hay especificaciones principales en `openspec/specs/`; por eso este cambio declara los contratos afectados como capacidades nuevas para el repositorio de especificaciones.

## Impact

- Frontend: páginas de inicio, libros, publicación, Comunidad, mapa, mensajería y flujo de logout; estados de carga, vacío y error; tema oscuro y componentes de navegación.
- Backend/API: endpoints y consultas de libros, actividad, feed comunitario, Rincones, mapa, publicaciones y conversaciones, según las brechas que confirme la implementación actual.
- Datos: se debe verificar que libros, publicaciones, personas, actividad y acuerdos provengan de persistencia real y respeten autorización y privacidad.
- Calidad: pruebas unitarias/integración existentes, pruebas frontend con MSW solo como soporte, y validación manual de navegador contra servicios reales.
