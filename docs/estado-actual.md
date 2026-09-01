# Estado actual

Fecha de referencia: 2026-09-02.

- La migraciÃ³n 022 agrega seguimiento persistente y datos demo para historias, lectores y recomendaciones personalizadas de Comunidad.
- La migración 023 agrega intereses personales sobre publicaciones ajenas y soporta publicaciones de búsqueda sin duplicados.

## Comprobado en el repositorio

- El mini mapa de Comunidad consume rincones reales, permite seleccionar pines y abre `/map` preservando el rincón y el radio en la URL.

- `/map` ofrece radios de 1, 5, 30 y 50 km o sin límite; con ubicación autorizada sincroniza perímetro, rincones, publicaciones, actividad y lista mediante distancia geográfica.

- Inicio limita “Libros que podrían gustarte” a cinco publicaciones por página y permite avanzar o volver mediante controles discretos; el orden prioriza lectores seguidos cuando existe sesión.
- Monorepo con frontend React/Rsbuild y backend TypeScript/Express.
- `/books` separa el catálogo público de “Mis libros”, con filtros persistidos, interés y alta de publicaciones `want`.
- PostgreSQL/PostGIS con migraciones 001–026.
- El perfil autenticado permite editar foto, intereses, país, ciudad, barrio, calle privada y visibilidad geográfica. La proyección pública no devuelve la calle y limita país, ciudad y barrio al nivel elegido.
- API de mensajes y eventos Socket.IO con persistencia antes de emitir.
- Mensajes permite buscar contactos visibles por nombre, apellido o alias, prioriza seguidos y filtra conversaciones por no leídos entrantes.
- Bot persistente creado por migración, con conversación idempotente por usuario e historial recargable.
- Las migraciones 024–025 dejan una conversación demo por pareja con Clara, Tomás, Julieta y Pablo para comprobar propuestas de intercambio con catálogos del interlocutor.
- Modo MSW controlado por `PUBLIC_API_USE_MOCKS` en el bundle del frontend.
- Pruebas Vitest frontend/backend y checks de tipo, lint, formato y build disponibles.
- Reconstrucción visual de Inicio, Explorar, Comunidad, Mensajes, Mapa, Estadísticas, Perfil y Centro de ayuda basada en los prototipos de `Screens/Prototipo ideal`, con catálogo frontend determinista y fallbacks SVG locales.

## Límites conocidos

- MSW no reemplaza una prueba contra PostgreSQL.
- El modo público depende de variables de build; cambiar `.env` requiere reiniciar Rsbuild.
- La verificación en navegador de cookies, proxy, caché y WebSocket debe hacerse aparte de Vitest.
- El canal global legacy del bot existe por compatibilidad y no debe confundirse con su conversación persistida.
- Las métricas comunitarias, feed, rincones, sugerencias, perfil, libros, mapa, mensajes y consultas de soporte ya tienen consumidores de API real; las series avanzadas, historias/interacciones sociales, logros y base de conocimiento de ayuda siguen diferidas. El contrato de transición está en [`prototype-mock-contract.md`](prototype-mock-contract.md) y la matriz en [`frontend-backend-reconnection-matrix.md`](frontend-backend-reconnection-matrix.md).

## Hallazgos de validación manual

El 2026-08-30 se detectó una brecha entre capacidades técnicas documentadas y la experiencia observable con datos reales. El detalle accionable está en la sección [Prioridad P0 del backlog](backlog.md#prioridad-p0--brechas-observadas-en-validación-manual). En resumen:

- El inicio y algunas secciones de libros muestran datos incompletos o mockeados; además, hay enlaces “Ver todos” sin acción y debe definirse la relación entre “Mis libros” y “Mi actividad”.
- El flujo de publicación tiene problemas de contraste en modo oscuro.
- Comunidad todavía presenta datos falsos, un botón de publicación inerte, recorte incorrecto de imágenes y un mini mapa sin contenido visible ni controles operativos.
- `/map` no inicia en la ubicación del usuario, no muestra un indicador de posición y el filtro de distancia no recorre ni pinta correctamente todo su rango.
- En mensajería, el chat real conserva historial, adjuntos tipados y eventos de intercambio; el menú `+` permite usar los catálogos de ambos participantes y las tarjetas se reconstruyen tras recargar.
- El logout ocurre sin confirmación.

La implementación de `reconnect-backend-to-prototype-frontend` conserva esos recorridos en la rama actual y conecta los consumidores reales disponibles: catálogo/detalle de libros, perfil, feed y actividad comunitaria, rincones, mapa, mensajería persistida con Socket.IO, estadísticas, notificaciones y contacto. Permanecen diferidas las capacidades sin contrato suficiente (analítica avanzada, logros, historias/interacciones sociales y base de conocimiento de ayuda).

## Cómo comprobar mensajes

1. Ejecuta `npm run migrate`.
2. Inicia backend y frontend.
3. Usa una sesión autenticada con mocks desactivados.
4. Entra en `/messages`, abre “Bot” y envía un texto.
5. Confirma la respuesta, recarga la página y confirma que ambos mensajes siguen allí.
6. Revisa la pestaña Network para `GET /api/messages` y la conexión `/socket.io`.
7. En una conversación con un acuerdo vigente, abre `+` > "Preparar acuerdo", confirma que el formulario recupera los datos actuales y verifica que el envío actualiza la versión mediante `POST /api/agreements/:id/versions`.
8. Con `user2@entrelibros.com`, abre una conversación demo con Clara, Tomás, Julieta o Pablo, entra en `+` > "Proponer intercambio" y confirma que aparecen los libros publicados de la otra persona.
9. Abre una conversación nueva, busca por nombre, apellido o alias y confirma que los contactos seguidos aparecen primero; los perfiles privados o bloqueados no deben aparecer.
10. Alterna la pestaña "No leídos" y confirma que solo muestra conversaciones con mensajes entrantes pendientes; si no hay resultados debe aparecer el estado vacío y "Todos" debe restaurar la lista.

Para comprobar una historia, abre “Publicar” en Comunidad, escribe texto, enlaza opcionalmente una publicación propia y confirma que aparece tras invalidar el feed.
