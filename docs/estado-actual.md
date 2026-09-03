# Estado actual

Fecha de referencia: 2026-09-03.

## Resumen de cierre

EntreLibros tiene un recorrido MVP persistente con PostgreSQL/PostGIS y Socket.IO:
perfil, publicaciones, Rincones, descubrimiento, Comunidad, contacto, mensajeria,
acuerdos, recordatorios, resultados, notificaciones, reportes y metricas.

La matriz de requisitos y la evidencia se mantienen en
[`tfg-mvp-trazabilidad.md`](tfg-mvp-trazabilidad.md). La checklist manual esta en
[`tfg-browser-checklist.md`](tfg-browser-checklist.md).

## Capacidades disponibles

- Identidad y perfil: registro, inicio/cierre de sesion, perfil editable, idioma,
  intereses y visibilidad territorial.
- Privacidad: las proyecciones publicas omiten correo, contrasena, calle, altura y
  coordenadas exactas; muestran como maximo el nivel territorial permitido.
- Libros: catalogo, publicaciones offer/want, condicion, imagenes limitadas,
  ISBN normalizado, disponibilidad, vencimiento, consentimientos y revision
  editorial minima.
- Rincones: alta, edicion, normas, horario, consentimiento, visibilidad,
  aprobacion y pausa/reactivacion reversible.
- Descubrimiento: mapa y listado real comparten filtros, radio, orden y estados
  de carga/vacio/error; sin centro valido no se inventa una distancia.
- Comunidad: feed persistente, historias, seguimiento, likes unicos, comentarios,
  compartir, Rincones cercanos y sugerencias con enlaces reales a perfiles.
- Contacto: se puede iniciar una conversacion desde una publicacion o un perfil;
  el primer mensaje es idempotente y puede llevar un adjunto de libro.
- Acuerdos: propuesta, contrapropuesta, confirmacion, rechazo, cancelacion,
  versionado, recordatorio in-app idempotente y resultado completado/no completado
  por participante. Los resultados no se publican en el feed.
- Notificaciones: avisos contextuales de mensajes y acuerdos, estado leido/no
  leido, preferencias in-app y contador accionable.
- Reportes: recepcion autenticada para contenido, conducta y Rincon inexistente,
  con motivo, estado, canal y plazo. No se presenta moderacion avanzada.
- Metricas: eventos append-only y `/api/community/metrics` para publicaciones,
  contactos, acuerdos, confirmaciones, actividad y tiempo de descubrimiento, con
  periodo, zona y estado `no_data`.

## Limites conocidos

- La moderacion humana avanzada, sanciones, reputacion, ratings y panel operativo
  completo estan fuera del MVP.
- No hay rate limiting de aplicacion, MFA, email/push productivo, almacenamiento
  de objetos, escaneo antimalware ni recomendacion automatica.
- `activeCorners` es global cuando se filtra por zona porque el esquema actual no
  relaciona un Rincon con una ciudad propietaria; esta semantica esta documentada.
- Backups, restauracion y rollback deben probarse en el entorno de despliegue; la
  verificacion local no los convierte en una garantia de produccion.
- La prueba manual de teclado, contraste, responsive y estilo debe repetirse en
  los viewport de entrega. Vitest/Testing Library no sustituyen esa revision.

## Comprobacion manual minima

1. Ejecutar `npm run migrate` sobre una base aislada y arrancar `npm run dev`.
2. Confirmar `PUBLIC_API_USE_MOCKS=false` u omitida y revisar
   `document.documentElement.dataset.apiMode === 'real'`.
3. Cargar el dataset de `backend/scripts/seed-demo-dataset.sql` y recargar las
   rutas `/community`, `/map`, `/profile/:id`, `/messages` y `/stats`.
4. Verificar privacidad, contacto, reportes, estados vacio/error, idioma, teclado,
   responsive, cookies y Socket.IO con la checklist enlazada arriba.

Para recuperacion consulta [`recovery-baseline.md`](recovery-baseline.md); para
seguridad consulta [`security-runbook.md`](security-runbook.md).
