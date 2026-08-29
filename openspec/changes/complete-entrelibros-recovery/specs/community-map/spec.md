## Purpose

> MVP scope: book corners, map, ownership basics, bounded queries and privacy. Community feeds, suggestions, aggregates and moderation are POST-MVP.

Define experiencias comunitarias y geográficas basadas en datos persistentes, con privacidad, moderación, paginación y tiempos de respuesta operables.

## ADDED Requirements

### Requirement: Rincones con propiedad y estados
Cada rincón comunitario SHALL tener propietario y estado auditable, y su creación o edición MUST requerir autenticación; sólo estados aprobados SHALL aparecer públicamente.

#### Scenario: Nuevo rincón pendiente
- **WHEN** un usuario autenticado propone un rincón válido
- **THEN** el sistema guarda propietario y estado pendiente sin publicarlo como aprobado

### Requirement: Mapa limitado y privado
Las consultas de mapa SHALL exigir límites geográficos válidos, aplicar capas y filtros documentados y devolver únicamente ubicaciones con precisión pública autorizada.

#### Scenario: Consulta por área visible
- **WHEN** el cliente solicita un bounding box, capas y filtros válidos
- **THEN** recibe sólo elementos visibles dentro del área y nunca coordenadas privadas de usuarios

### Requirement: Comunidad derivada de datos reales
Estadísticas, feed, actividad y sugerencias MUST derivarse de datos persistentes o de agregados identificables; producción no SHALL responder con fixtures o mocks estáticos.

#### Scenario: Nueva actividad persistida
- **WHEN** se registra una publicación o intercambio relevante
- **THEN** las vistas comunitarias reflejan el cambio conforme a su política de actualización

### Requirement: Respuestas acotadas y paginadas
Los endpoints comunitarios SHALL aplicar paginación, radios máximos, selección de campos y límites de tamaño que eviten respuestas sin cota.

#### Scenario: Área con muchos resultados
- **WHEN** una consulta cercana coincide con más elementos que el límite permitido
- **THEN** el sistema devuelve una página limitada y metadatos para continuar, no una respuesta completa de varios megabytes

### Requirement: Estados moderables y trazables
Un moderador autorizado SHALL poder aprobar, rechazar, ocultar o reabrir rincones y actividad denunciada, conservando motivo y auditoría.

#### Scenario: Rincón ocultado
- **WHEN** un moderador oculta un rincón con un motivo válido
- **THEN** deja de aparecer públicamente y la acción queda registrada para revisión

