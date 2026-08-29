## Purpose

> MVP scope: agreement proposal, place/time, confirmation, cancellation and auditable version state needed to coordinate an exchange.

Define acuerdos de intercambio persistentes y versionados para negociar, aceptar, cancelar y completar encuentros sin estados contradictorios entre participantes.

## ADDED Requirements

### Requirement: Acuerdo vinculado a participantes y publicaciones
Un acuerdo SHALL vincular una conversación, exactamente dos participantes autorizados y las publicaciones negociadas; terceros y participantes bloqueados MUST NOT crearlo ni modificarlo.

#### Scenario: Propuesta desde una conversación válida
- **WHEN** un participante propone un acuerdo con publicaciones disponibles de ambas partes
- **THEN** el sistema crea una versión persistente visible para ambos participantes

### Requirement: Versionado de propuestas
Cada modificación negociable SHALL crear una nueva versión inmutable con autor, fecha y contenido completo, preservando el historial anterior.

#### Scenario: Contrapropuesta
- **WHEN** un participante cambia libros, lugar o condiciones de la propuesta vigente
- **THEN** se crea una versión nueva y la anterior permanece consultable como historial

### Requirement: Control de concurrencia
Las mutaciones MUST indicar la versión esperada y SHALL rechazarse como conflicto si otra acción ya cambió el acuerdo.

#### Scenario: Confirmación sobre estado obsoleto
- **WHEN** un cliente confirma una versión que dejó de ser la vigente
- **THEN** el sistema rechaza la confirmación, devuelve el estado actual y no aplica datos obsoletos

### Requirement: Máquina de estados válida
El acuerdo SHALL permitir únicamente transiciones documentadas entre propuesta, pendiente de aceptación, aceptado, cancelado, rechazado y completado, con permisos definidos para cada parte.

#### Scenario: Aceptación de ambas partes
- **WHEN** ambas partes aceptan la misma versión vigente
- **THEN** el acuerdo pasa una sola vez a aceptado y las publicaciones quedan reservadas de forma atómica

#### Scenario: Cancelación
- **WHEN** una parte cancela un acuerdo cancelable con motivo
- **THEN** el acuerdo pasa a cancelado, libera reservas aplicables y notifica a la contraparte

### Requirement: Auditoría de acciones
Toda propuesta, aceptación, rechazo, cancelación y finalización SHALL registrar actor, versión, fecha y motivo cuando corresponda.

#### Scenario: Revisión de disputa
- **WHEN** un moderador autorizado revisa un acuerdo denunciado
- **THEN** puede reconstruir la secuencia de versiones y transiciones sin modificar el historial

