# Matriz de integración frontend-backend

Fecha de referencia: 2026-09-02.

Esta matriz indica qué partes de la interfaz utilizan la API persistente y qué límites conserva el modo demo. Una respuesta visual de MSW sirve para probar composición y estados, pero no demuestra autorización, persistencia, rendimiento ni comunicación con PostgreSQL.

| Área | Integración real disponible | Límite o comprobación pendiente |
| --- | --- | --- |
| Inicio y libros | Catálogo público, libros propios, detalle, edición, búsqueda e intereses | Validar el recorrido completo en navegador con datos creados durante la sesión |
| Perfil | Lectura y edición de alias, descripción, idioma, intereses, zona, foto y privacidad | Mantener la proyección pública sin correo ni ubicación exacta |
| Comunidad | Feed, historias, seguimiento, likes, comentarios, compartir y Rincones | Verificar estados de red, visibilidad, bloqueos y orden de historias relevantes |
| Mapa | Rincones, publicaciones y actividad con radio y ubicación contextual | Comprobar permiso concedido, rechazado y ausente, además de coherencia mapa/listado |
| Mensajes | Conversaciones, contactos, historial, Socket.IO, adjuntos, propuestas y acuerdos | Confirmar lectura, reconexión, idempotencia, permisos y datos después de recargar |
| Notificaciones | Avisos in-app de mensajes y acuerdos, preferencia básica y contador no leído | Completar destinos contextuales y revisar el punto rojo con varias conversaciones |
| Estadísticas | Indicadores comunitarios y rankings disponibles para la interfaz | Las métricas de impacto, tiempos y embudos requieren definición y verificación adicional |
| Centro de ayuda y contacto | Contenido de ayuda y envío de consultas mediante API | Mantener estados de carga, vacío y error y no mezclar contenido demo con soporte real |

## Reglas de integración

- Con `PUBLIC_API_USE_MOCKS=false` u omitida, las pantallas deben consumir API y Socket.IO reales.
- Con `PUBLIC_API_USE_MOCKS=true`, MSW puede entregar un dataset determinista y acciones de demostración; nada de ese modo se interpreta como persistencia.
- Los adaptadores de datos deben conservar IDs, estados, permisos y jerarquía de pantalla.
- Los errores que cruzan la API deben ser claves de traducción; la interfaz debe diferenciar carga, vacío, error y contenido no disponible.
- Cada mutación debe comprobar autorización en backend, persistir antes de emitir eventos y ser segura frente a reintentos cuando corresponda.

## Validación

Para cada área se debe revisar la pestaña Network, cookies, respuesta JSON, persistencia tras recarga y comportamiento sin permisos. La checklist de recorrido está en [`estado-actual.md`](estado-actual.md) y el diagnóstico de entorno en [`troubleshooting.md`](troubleshooting.md).
