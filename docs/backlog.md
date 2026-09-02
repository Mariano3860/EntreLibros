# Backlog de producto

Última actualización: 2026-09-02.

Este backlog reúne únicamente trabajo vigente. El código, las migraciones, los contratos y las pruebas son la fuente de verdad para marcar una tarea como hecha; las notas históricas se conservan en Git y no se repiten aquí.

## Hecho

- Registro, inicio/cierre de sesión, perfiles editables, intereses, idioma y privacidad básica.
- Catálogo público, libros propios, publicación/edición, modalidades, condición, ISBN opcional, intereses y vencimiento.
- Rincones con alta, edición del propietario, foto, normas, consentimiento, zona, visibilidad barrio/ciudad y pausa/reactivación.
- Búsqueda parametrizada, catálogo unificado, mapa con radio contextual y estados de carga, vacío y error.
- Feed de Comunidad, historias relevantes, seguimiento, likes únicos, comentarios y compartir con fallback.
- Mensajería privada persistente, contactos visibles, adjuntos de libros, propuestas y acuerdos versionados.
- Notificaciones in-app de mensajes/acuerdos, preferencia básica, deduplicación y contador no leído en Mensajes.
- Migraciones acumulativas, pruebas automatizadas, comprobaciones de tipos, lint, formato, build y CI.

## Prioridad P0 — cerrar el recorrido principal

- [ ] **P0-01 — Recorrido real completo:** registrar o usar dos perfiles, publicar, descubrir, contactar, acordar y recargar sin perder datos. Verificar con API real y evidencia manual.
- [ ] **P0-02 — Rincones consistentes:** completar baja o sustituto documentado, estados visibles, validaciones y propiedad. Verificar autorización y persistencia.
- [ ] **P0-03 — Publicaciones válidas:** cerrar campos mínimos, consentimientos, imagen, modalidad, precio, disponibilidad y estados editoriales. Verificar API, UI y búsqueda.
- [ ] **P0-04 — Privacidad territorial:** asegurar que ningún detalle, mapa o respuesta pública expone dirección o coordenadas exactas. Verificar visibilidad de ciudad/barrio con pruebas de API.
- [ ] **P0-05 — Descubrimiento unificado:** mantener filtros combinables y la misma consulta para mapa y listado, incluyendo fallback sin geolocalización. Verificar selección, radio, vacío y error.
- [ ] **P0-06 — Contacto desde el producto:** iniciar conversación desde publicación y perfil visibles, con plantilla opcional, bloqueos y reutilización de conversaciones. Verificar autorización y recarga.
- [ ] **P0-07 — Acuerdos cerrables:** completar recordatorio, rechazo/cancelación, cambios de fecha y resultado post-encuentro. Verificar historial, concurrencia y notificación a las partes.
- [ ] **P0-08 — Notificaciones accionables:** mostrar alias, estado y destino de mensaje/acuerdo; mantener punto rojo y contador sincronizados con lectura persistente. Verificar reintentos, Socket.IO y recarga.
- [ ] **P0-09 — Reportes mínimos:** permitir reportar contenido, conducta o Rincón inexistente y dejar estado, motivo y canal de tratamiento. Documentar límites de moderación.

## Prioridad P1 — calidad y evidencia de entrega

- [ ] **P1-01 — Métricas mínimas:** calcular Rincones activos, publicaciones activas, acuerdos confirmados, tiempo de descubrimiento y embudo publicación → contacto → acuerdo → confirmación. Verificar periodo, denominadores y `sin datos`.
- [ ] **P1-02 — Seguridad del MVP:** auditar autenticación, cookies, CORS/CSRF, cabeceras, rate limiting, autorización, logs y errores traducibles. Registrar riesgos residuales sin afirmar controles no implementados.
- [ ] **P1-03 — Datos y consentimiento:** documentar retención mínima, revocación de consentimientos, imágenes, mensajes y reportes. Verificar minimización y ausencia de datos personales innecesarios.
- [ ] **P1-04 — Rendimiento:** medir una búsqueda representativa y registrar resultado, entorno y desviaciones frente al objetivo de dos segundos.
- [ ] **P1-05 — Accesibilidad y lenguaje:** revisar teclado, foco, contraste, responsive y español neutro en las rutas principales. Verificar manualmente en navegador real.
- [ ] **P1-06 — Recuperación:** comprobar backup, restauración, migración desde una base existente y procedimiento de rollback. Verificar que no se editan migraciones aplicadas.
- [ ] **P1-07 — Evidencia:** preparar dataset sintético, capturas anonimizadas, checklist de navegador y matriz de requisitos para la entrega académica.

## Fuera del MVP

Estas capacidades pueden planificarse después sin bloquear el cierre del producto actual:

- Recomendación automática o modelo de machine learning.
- Email, push, MFA, recuperación avanzada de contraseña y proveedores cloud productivos.
- Moderación avanzada, reputación, ratings, sanciones complejas y panel operativo completo.
- PWA/offline, API pública, importación/exportación masiva y analítica avanzada.

## Criterio de cierre

El MVP se considera listo cuando el recorrido P0 funciona en API real con datos persistentes, las reglas de privacidad y errores están verificadas, pasan las suites del repositorio, existe evidencia manual del navegador y cada capacidad fuera de alcance está declarada como tal.
