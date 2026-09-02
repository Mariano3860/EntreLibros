# Estado actual

Fecha de referencia: 2026-09-02.

## Resumen

EntreLibros tiene una base funcional real para perfiles, publicaciones, Rincones de Libros, descubrimiento geográfico, Comunidad, mensajería, acuerdos y notificaciones. La persistencia usa PostgreSQL/PostGIS y la comunicación en tiempo real usa Socket.IO. MSW queda reservado para pruebas y demostraciones aisladas.

## Capacidades disponibles

- **Identidad y perfil:** registro, inicio y cierre de sesión, perfil editable, idioma, intereses, zona y niveles de visibilidad.
- **Privacidad:** el perfil público no muestra correo ni contraseña; la ubicación pública se redondea y puede limitarse a país, ciudad o barrio.
- **Libros:** catálogo público, libros propios, alta/edición, modalidades de oferta o búsqueda, condición, imágenes, ISBN opcional, intereses y vencimiento.
- **Rincones:** alta con formulario por pasos, foto, normas, consentimiento, zona, visibilidad y estado activo/en pausa; el propietario puede editar su Rincón.
- **Comunidad:** feed persistente, historias relevantes, seguimiento, likes únicos, comentarios ordenados, compartir y filtros de visibilidad/bloqueos.
- **Mapa:** Rincones, publicaciones y actividad con radio de 1, 5, 30, 50 km o sin límite; el centro y el perímetro respetan el permiso de ubicación.
- **Mensajería:** conversaciones privadas persistentes, contactos visibles, historial, Socket.IO, bot persistente, adjuntos de libros, propuestas y acuerdos.
- **Acuerdos:** propuesta, contrapropuesta, confirmación, rechazo, cancelación, versionado e historial dentro de la conversación.
- **Notificaciones:** avisos in-app de mensajes y acuerdos, preferencia básica, deduplicación, estado leído/no leído y punto rojo sincronizado en Mensajes.
- **Calidad:** migraciones acumulativas, pruebas backend/frontend, typecheck, lint, build y workflows de CI.

## Límites conocidos

- La validación editorial completa de publicaciones y Rincones todavía no cubre todo el circuito de pendiente, corrección, rechazo y revisión humana.
- Reportes, moderación avanzada, reputación, sanciones y retención/exportación de datos requieren trabajo específico.
- Los recordatorios de acuerdos, el resultado post-encuentro y las métricas persistentes de impacto no forman todavía un flujo cerrado.
- El modo demo no prueba persistencia, autorización, rendimiento ni comunicación con PostgreSQL.
- Email, push, MFA, almacenamiento cloud, escaneo antimalware y recomendación automática no están habilitados como servicios productivos.
- La composición visual debe verificarse manualmente en navegador real en los tamaños de entrega; las pruebas de frontend no sustituyen esa revisión.

## Comprobación manual mínima

1. Ejecutar migraciones y levantar backend y frontend.
2. Confirmar que `PUBLIC_API_USE_MOCKS` está omitida o en `false`.
3. Registrar o iniciar sesión con dos usuarios de prueba.
4. Crear un Rincón y una publicación, comprobar visibilidad aproximada y recargar.
5. Buscar desde mapa/listado, iniciar una conversación y enviar un mensaje.
6. Proponer un acuerdo, confirmar o rechazar y revisar historial y notificaciones.
7. Comprobar estados vacío, error, permisos de ubicación, teclado, idioma y responsive.

Para problemas de entorno consulta [`troubleshooting.md`](troubleshooting.md). Para recuperación y validación completa consulta [`recovery-baseline.md`](recovery-baseline.md).
