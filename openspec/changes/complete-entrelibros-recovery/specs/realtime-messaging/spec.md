## Purpose

Define mensajería privada y persistente para que las partes de un intercambio puedan conversar con aislamiento, historial y entrega en tiempo real confiable.

## ADDED Requirements

### Requirement: Conversaciones privadas persistentes
Una conversación SHALL existir como recurso persistente con participantes autorizados; sólo sus miembros o un moderador con causa SHALL poder leerla.

#### Scenario: Acceso de tercero
- **WHEN** un usuario autenticado solicita una conversación de la que no es miembro
- **THEN** el sistema rechaza el acceso sin revelar mensajes ni participantes privados

### Requirement: Mensajes ordenados e idempotentes
Cada mensaje SHALL persistirse con emisor, conversación, identificador, marca temporal y orden estable; reintentos con la misma clave idempotente MUST NOT crear duplicados.

#### Scenario: Reintento tras pérdida de conexión
- **WHEN** el cliente reenvía un mensaje cuya confirmación no recibió
- **THEN** el sistema devuelve el mensaje ya persistido y existe una sola copia

### Requirement: Eventos aislados por conversación
Los eventos en tiempo real MUST enviarse únicamente a salas autorizadas de la conversación y no mediante broadcast global a todos los clientes autenticados.

#### Scenario: Mensaje en otra conversación
- **WHEN** un miembro envía un mensaje en una conversación
- **THEN** sólo los miembros conectados a esa conversación reciben el evento

### Requirement: Historial, lectura y reconexión
El cliente SHALL poder paginar historial, marcar lectura y recuperar eventos perdidos después de reconectar sin sustituir el estado persistente por conversaciones mock.

#### Scenario: Reconexión con mensajes pendientes
- **WHEN** un usuario vuelve a conectarse después de recibir mensajes mientras estaba desconectado
- **THEN** obtiene los mensajes faltantes en orden y un contador de no leídos consistente

### Requirement: Adjuntos controlados
Los adjuntos SHALL validar autorización, tipo, tamaño y malware según política, y SHALL exponerse mediante acceso limitado a participantes.

#### Scenario: Adjunto no permitido
- **WHEN** un usuario intenta adjuntar un archivo que incumple tipo o tamaño
- **THEN** el sistema rechaza el archivo antes de asociarlo al mensaje

