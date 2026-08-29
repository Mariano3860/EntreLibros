## Purpose

> MVP support scope: API contracts, checks, safe logs, documentation and merge gates. Retention/export is POST-MVP.

Define garantías operativas y de calidad que mantengan contratos, pruebas, observabilidad, datos y documentación sincronizados con el comportamiento entregado.

## ADDED Requirements

### Requirement: Contrato API verificable
Toda ruta pública SHALL estar descrita en OpenAPI con autenticación, parámetros, respuestas y claves de error, y CI MUST detectar divergencias entre contrato e implementación.

#### Scenario: Cambio de respuesta API
- **WHEN** una PR modifica una respuesta o añade una ruta pública
- **THEN** la verificación falla si OpenAPI y sus pruebas de contrato no se actualizan

### Requirement: Puertas de calidad obligatorias
Cada entrega SHALL superar typecheck, lint, formato, pruebas backend/frontend, pruebas de migración e integración relevantes; los flujos críticos SHALL tener cobertura E2E estable.

#### Scenario: Fallo en flujo crítico
- **WHEN** una prueba de autenticación, mensajería o acuerdos falla en CI
- **THEN** la entrega queda bloqueada y no se presenta como lista para merge

### Requirement: Observabilidad sin datos sensibles
Los servicios SHALL exponer salud y disponibilidad, métricas de latencia/error/tamaño y registros correlacionables, sin incluir secretos ni datos personales innecesarios.

#### Scenario: Respuesta comunitaria excesiva
- **WHEN** un endpoint supera el umbral de tamaño o latencia configurado
- **THEN** operaciones recibe una señal identificable por endpoint y correlación sin contenido privado

### Requirement: Ciclo de vida de datos
El sistema SHALL definir retención, exportación, anonimización o eliminación para cuentas, mensajes, acuerdos, denuncias, contacto y auditoría, preservando obligaciones de seguridad documentadas.

#### Scenario: Solicitud de eliminación de cuenta
- **WHEN** una solicitud válida completa su período de seguridad
- **THEN** los datos se eliminan o anonimizan conforme a la política y se conserva sólo la auditoría permitida

### Requirement: Documentación y backlog coherentes
Los runbooks de desarrollo, producción, recuperación y credenciales SHALL ser ejecutables desde un entorno limpio; el backlog y las especificaciones MUST reflejar el estado real de cada capacidad.

#### Scenario: Capacidad terminada
- **WHEN** una entrega completa una capacidad o sólo una parte de ella
- **THEN** la documentación marca lo hecho y separa explícitamente el trabajo restante sin duplicados

### Requirement: Merge humano explícito
La automatización SHALL preparar y verificar PRs, pero MUST NOT ejecutar el merge; deberá informar al usuario cuando todas las puertas estén verdes y el merge manual sea el siguiente paso.

#### Scenario: PR lista
- **WHEN** una PR supera revisiones, CI y verificaciones funcionales
- **THEN** el sistema informa que está lista y espera a que el usuario realice el merge
