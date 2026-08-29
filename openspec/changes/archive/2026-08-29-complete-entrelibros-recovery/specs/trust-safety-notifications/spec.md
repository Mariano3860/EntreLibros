## Purpose

> MVP scope: basic in-app notifications for messages and agreements. Reports, moderation workflow and post-exchange ratings are POST-MVP.

Define mecanismos de confianza, seguridad y comunicación para prevenir abuso, gestionar incidentes y acompañar a los usuarios durante todo el intercambio.

## ADDED Requirements

### Requirement: Denuncias trazables
Un usuario autenticado SHALL poder denunciar usuarios, mensajes, publicaciones, rincones o acuerdos con categoría y contexto; cada denuncia SHALL tener estado y acceso restringido.

#### Scenario: Nueva denuncia
- **WHEN** un usuario presenta una denuncia válida
- **THEN** el sistema crea un caso pendiente sin avisar al denunciado con información que identifique al denunciante

### Requirement: Moderación con permisos y motivos
Sólo roles autorizados SHALL poder revisar casos y aplicar advertencias, ocultación, suspensión o cierre; cada decisión MUST incluir motivo y auditoría.

#### Scenario: Acción de moderación
- **WHEN** un moderador resuelve una denuncia y aplica una medida
- **THEN** el recurso o cuenta refleja la medida y la decisión queda registrada de forma inmutable

### Requirement: Notificaciones persistentes e idempotentes
Eventos relevantes SHALL generar notificaciones persistentes para destinatarios autorizados, sin duplicados, con estado leído y preferencias respetadas.

#### Scenario: Acuerdo aceptado
- **WHEN** un acuerdo cambia a aceptado
- **THEN** cada participante recibe una sola notificación consultable y puede marcarla como leída

### Requirement: Comunicación segura del encuentro
Antes de un encuentro aceptado, el sistema SHALL mostrar recomendaciones de seguridad y SHALL limitar los datos de encuentro a sus participantes.

#### Scenario: Usuario ajeno consulta el encuentro
- **WHEN** un tercero intenta consultar lugar o condiciones privadas de un acuerdo
- **THEN** el acceso se rechaza y no se revela información del encuentro

### Requirement: Flujo posterior al intercambio
Tras completar un acuerdo, ambas partes SHALL poder confirmar resultado, valorar una vez, reportar un incidente y cerrar el flujo con estados consistentes.

#### Scenario: Resultado discrepante
- **WHEN** las partes informan resultados incompatibles
- **THEN** el acuerdo entra en revisión y no actualiza reputación definitiva hasta resolver el caso

