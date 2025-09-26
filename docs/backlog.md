# Backlog de Producto (Business) — EntreLibros

Última actualización: 2025-09-15

Resumen ejecutivo
EntreLibros conecta lectores mediante Rincones de Libros (RdL), publicaciones de ejemplares y acuerdos entre pares, priorizando privacidad por diseño y operación comunitaria. Este backlog ordena el trabajo en épicas, features y stories, con foco en el valor de negocio y en resultados observables. El estado actual refleja avances ya logrados (auth básica, mensajería, geolocalización, normalización de libros, scripts/CI), y alinea los pendientes críticos (RdL, descubrimiento, moderación, métricas y notificaciones) para alcanzar un MVP robusto.

Convenciones

- Epic > Feature > Story (unidad de entrega).
- Prioridad: Must (crítico), Should (recomendado), Could (opcional).
- Entrega: E1, E2, E3, E4 (hitos por fases).
- Estado: [x] Hecho | [~] Parcial | [ ] Pendiente.
- Criterio de éxito: condición observable y verificable.
- Este documento es de producto; las referencias técnicas son indicativas.

Mapa de Épicas

- EP-1 Identidad y Perfil (BR-01..04, BR-100–101)
- EP-2 Rincones de Libros (RdL) (BR-10..14)
- EP-3 Publicaciones (Ofrezco/Busco) (BR-20..24)
- EP-4 Descubrimiento y Navegación (BR-30..32)
- EP-5 Mensajería, Acuerdos y Notificaciones (BR-40..43, BR-60–61)
- EP-6 Moderación y Convivencia (BR-50–52)
- EP-7 Métricas y Tableros (BR-70..72)
- EP-8 Privacidad y Gobierno del Dato (BR-80..82)
- EP-9 Operación Comunitaria y Alianzas (BR-90–91)
- EP-10 Sostenibilidad (BR-110)

Resumen de Hechos (hasta la fecha)

- Acceso básico: registro, login, logout; idioma de usuario inicial. [x]
- Geolocalización base de usuarios (barrio/ciudad). [x]/[~]
- Mensajería base y UI de conversaciones inicial. [~]
- Normalización/verificación de libros asistida por metadata/ISBN. [~]
- Bases de trabajo: scripts de desarrollo y CI, documentación de entorno. [x]
- Flujo de despliegue a Docker Hub para `main` y `dev`; plantillas `.env` con `JWT_SECRET`. [x]
- PostGIS local con Docker Compose para desarrollo. [x]

EP-1 Identidad y Perfil
Feature 1.1 Cuenta y acceso

- [~] S-1.1 Registro con alias público (Must, E1; BR-01)
  - Éxito: registro ≤2 min; alias visible; datos personales no públicos por defecto.
- [x] S-1.2 Login/Logout y sesión (Must, E1)
  - Éxito: login/logout confiable; sesión persistente controlada.
- [~] S-1.3 Idioma base y copy claro (Must, E1; BR-100; Should BR-101 en E2)
  - Éxito: español neutral; glosario/etiquetas centralizadas.

Feature 1.2 Perfil y privacidad

- [ ] S-1.4 Perfil editable (intereses y zona) (Must, E1; BR-02)
  - Éxito: al menos 3 intereses; barrio/ciudad obligatorio.
- [~] S-1.5 Privacidad por diseño (Must, E1; BR-04)
  - Éxito: no se expone calle/altura; auditoría interna.
- [ ] S-1.6 Reputación liviana (Should, E2; BR-03)
  - Éxito: 2+ señales visibles tras intercambio/actividad.

EP-2 Rincones de Libros (RdL)
Feature 2.1 Alta y gestión de RdL

- [ ] S-2.1 Alta de RdL (foto, reglas, zona) + aprobación liviana (Must, E1; BR-10)
  - Éxito: formulario completo; visible en mapa tras aprobación.
- [ ] S-2.2 Estados de RdL (Activo / Pausa / Observación) (Should, E2; BR-12)
  - Éxito: pausa oculta de resultados temporalmente.
- [ ] S-2.3 Verificación ligera de anfitrión (Could, E3; BR-14)
  - Éxito: etiqueta “verificado” tras revisión mínima.

Feature 2.2 Visibilidad y actividad

- [ ] S-2.4 Control de granularidad en mapa (barrio/ciudad) (Must, E1; BR-11)
  - Éxito: 100% de RdL respetan granularidad elegida.
- [ ] S-2.5 Señales de actividad en RdL (Should, E2; BR-13)
  - Éxito: 2 señales simples (visitas, contactos cercanos).

EP-3 Publicaciones (Ofrezco/Busco)
Feature 3.1 Publicación y calidad del dato

- [ ] S-3.1 Publicar ejemplares (título, autor, estado; ISBN si existe; foto opcional) (Must, E1; BR-20)
  - Éxito: 90% publicaciones con campos mínimos.
- [~] S-3.2 Normalización asistida por ISBN/metadata (Should, E2; BR-22)
  - Éxito: autocompletado; reducción de duplicados/ambigüedades.
- [ ] S-3.3 Contenidos permitidos/denegados (política editorial) (Must, E1; BR-24)
  - Éxito: proceso de baja/ocultamiento ante incumplimientos.

Feature 3.2 Búsquedas y ciclo de vida

- [ ] S-3.4 Búsquedas y filtros (distancia, género/tema, estado, ofrezco/busco) (Must, E1; BR-21)
  - Éxito: resultados <2s con filtros básicos.
- [ ] S-3.5 Vencimiento/renovación de publicaciones (Should, E2; BR-23)
  - Éxito: aviso previo; reducción de obsoletas.
- [x] S-3.6 Documentar diagrama de clases del modelo de datos (Mermaid) (Should, E1; DOC-01)
  - Éxito: diagrama actualizado en `docs/base_de_datos.md`, visible en GitHub y alineado con entidades principales.
  - Actualización: se documentó el modelo físico completo (tablas reales, columnas y enums), se aclararon relaciones clave y se listaron proyecciones futuras para mantener la trazabilidad técnica.

EP-4 Descubrimiento y Navegación
Feature 4.1 Mapa y listados

- [~] S-4.1 Geolocalización de usuario (base) (Must, E1; soporte de BR-30)
  - Éxito: detección de zona para ordenar por cercanía.
- [ ] S-4.2 Mapa de RdL + listado ordenado por cercanía/afinidad (Must, E1; BR-30)
  - Éxito: resultados consistentes entre lista y mapa.

Feature 4.2 Descubrimiento avanzado

- [ ] S-4.3 Guardar búsquedas y alertas (Should, E2; BR-31)
  - Éxito: aviso ante nuevas coincidencias.
- [ ] S-4.4 Sugerencias “cerca de mí” y colecciones temáticas (Could, E3; BR-32)
  - Éxito: CTR objetivo interno.

EP-5 Mensajería, Acuerdos y Notificaciones
Feature 5.1 Mensajería 1:1

- [~] S-5.1 Chat 1:1 con plantillas de primer contacto (Must, E1; BR-40)
  - Éxito: iniciar conversación desde ficha en ≤2 taps/clicks.
- [ ] S-5.2 Bloqueo/Reporte en conversación y ficha (Must, E1; BR-43)
  - Éxito: acción en ≤2 pasos.

Feature 5.2 Acuerdos

- [ ] S-5.3 Confirmación de acuerdo (lugar RdL/espacio público, horario) (Must, E1; BR-41)
  - Éxito: registra acuerdo y dispara recordatorio.
- [ ] S-5.4 Registro post-encuentro (“se concretó / no se concretó”) (Should, E2; BR-42)
  - Éxito: alimenta métricas sin exponer datos personales.

Feature 5.3 Notificaciones

- [ ] S-5.5 Notificaciones in-app y correo opcional (nuevos mensajes, confirmaciones, alertas) (Must, E1; BR-60)
  - Éxito: opt-in por canal; silenciamiento por tipo.
- [ ] S-5.6 Resumen semanal opcional (Should, E2; BR-61)
  - Éxito: apertura y desuscripción fácil.

EP-6 Moderación y Convivencia
Feature 6.1 Reportes y toolkit

- [ ] S-6.1 Recepción y tratamiento de reportes (contenido, conducta, RdL inexistente) (Must, E1; BR-50)
  - Éxito: triage en ≤72 h; bitácora de acciones.
- [ ] S-6.2 Acciones de moderación (ocultar, solicitar corrección, pausar, levantar sanción) (Should, E2; BR-51)
  - Éxito: 4 acciones básicas disponibles.
- [ ] S-6.3 Normas de convivencia y uso (aceptación al registrarse y antes de publicar) (Must, E1; BR-52)
  - Éxito: tasas de aceptación registradas; accesibles desde perfil.

EP-7 Métricas y Tableros
Feature 7.1 Métricas mínimas y tableros

- [ ] S-7.1 Métricas mínimas (nº RdL activos, publicaciones activas, acuerdos confirmados, tiempo de descubrimiento) (Must, E1; BR-70)
  - Éxito: tablero básico visible a coordinación.
- [ ] S-7.2 Indicadores por zona y actividad (Should, E2; BR-71)
  - Éxito: filtro por zona en tablero.
- [ ] S-7.3 Embudos publicación→contacto→acuerdo→confirmación (Could, E3; BR-72)
  - Éxito: visibilidad global por etapa.

EP-8 Privacidad y Gobierno del Dato
Feature 8.1 Consentimientos y retención

- [ ] S-8.1 Consentimientos explícitos para RdL, publicaciones e imágenes (Must, E1; BR-80)
  - Éxito: campos de consentimiento marcados; auditoría.
- [ ] S-8.2 Configuración de visibilidad de ubicación (barrio/ciudad) (Must, E1; BR-81)
  - Éxito: elección requerida; nunca dirección exacta.
- [ ] S-8.3 Política de retención/anonimización de inactivos (Should, E2; BR-82)
  - Éxito: definiciones públicas y aplicadas.

EP-9 Operación Comunitaria y Alianzas
Feature 9.1 Onboarding y materiales

- [ ] S-9.1 Onboarding de anfitriones (guía rápida, checklist, materiales imprimibles) (Should, E2; BR-90)
  - Éxito: kit descargable; alta de nuevos RdL más fluida.
- [ ] S-9.2 Puntos aliados (escuelas, clubes, comercios) (Could, E3; BR-91)
  - Éxito: etiqueta visual + página informativa.

EP-10 Sostenibilidad
Feature 10.1 Participación y soporte

- [ ] S-10.1 Cajas de donación o voluntariado (informativo, no transaccional) (Could, E3/E4; BR-110)
  - Éxito: módulo informativo sin fricción.

Matriz de estado actual (resumen)

- EP-1 Identidad y Perfil: [x]/[~]/[ ] → Hecho/Parcial en auth e idioma; perfil e intereses pendientes.
- EP-2 RdL: [ ] → Alta, estados, verificación, actividad y granularidad: pendientes.
- EP-3 Publicaciones: [~]/[ ] → Normalización por ISBN parcial; publicación y filtros pendientes.
- EP-4 Descubrimiento: [~]/[ ] → Geolocalización base hecha; mapa+lista y afinidad pendientes.
- EP-5 Mensajería/Acuerdos/Notificaciones: [~]/[ ] → Chat base; acuerdos, reporte y notificaciones pendientes.
- EP-6 Moderación: [ ] → Reportes, toolkit y normas: pendientes.
- EP-7 Métricas: [ ] → Tablero e indicadores: pendientes.
- EP-8 Privacidad/Datos: [~]/[ ] → Base de ubicación por barrio/ciudad; consentimientos y retención: pendientes.
- EP-9 Operación Comunitaria: [ ] → Onboarding y aliados: pendientes.
- EP-10 Sostenibilidad: [ ] → Pendiente.

Roadmap por entregas (ajustado al estado actual)

- E1 (cierre corto): EP-1 (perfil+privacidad mínima), EP-2 (alta RdL + granularidad), EP-3 (publicar y buscar básico), EP-4 (mapa+lista), EP-5 (acuerdos, reporte y notificaciones mínimas), EP-6 (recepción de reportes), EP-7 (métricas mínimas), EP-8 (consentimientos y visibilidad), EP-5/EP-1 (copy y accesibilidad AA básica).
- E2: EP-3 (vencimientos), EP-3 (normalización completa), EP-2 (estados y señales), EP-5 (post-encuentro), EP-5 (resumen semanal), EP-7 (indicadores por zona), EP-8 (retención), EP-9 (onboarding anfitriones), EP-1 (glosario/idioma).
- E3: EP-2 (verificación ligera), EP-4 (sugerencias cerca/colecciones), EP-7 (embudos), EP-9 (puntos aliados), EP-10 (donaciones/voluntariado informativo).
- E4: consolidación, pruebas y cierre documental.

Criterios de éxito transversales

- Consistencia mapa/lista y tiempos de respuesta funcionales (<2s en filtros básicos).
- Zero-directional exposure: nunca calle/altura; siempre barrio/ciudad.
- Fricción mínima para acuerdos y primer contacto (≤2 pasos).
- Observabilidad mínima de métricas de adopción y actividad.
- Moderación con SLA simple y trazabilidad.

Supuestos y límites (para mantener el enfoque)

- No se gestiona inventario en los RdL (solo visibilidad del punto).
- Encuentros mano a mano, sin pagos en la plataforma (salvo información no transaccional en S-10.1).
- Ubicación nunca a nivel de puerta: barrio o ciudad, siempre con consentimiento.

Trazabilidad de PRs (referencias clave; lista completa se añadirá como anexo)

- Acceso/Perfil/Idioma: #64, #65, #75, #81
- Geolocalización: #84
- Mensajería/UI/Chatbot: #78, #55, #79
- Normalización de libros: #87
- Scripts/Workflows/CI/Docs: #85, #60, #58, #63, #62, #73, #72, #70, #67

Cómo mantener este backlog

- Cada PR que afecte funcionalidad debe enlazar una Story (S-x.y) en este documento.
- Actualizar Estado y Criterio de éxito al merge.
- Revisar Roadmap y prioridades al final de cada entrega (E1–E4).
