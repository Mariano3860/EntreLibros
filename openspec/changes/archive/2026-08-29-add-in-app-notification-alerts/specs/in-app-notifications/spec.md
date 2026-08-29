## Purpose

Esta capacidad permite que el usuario conozca eventos relevantes sin abandonar la pantalla actual y pueda acceder rápidamente a la conversación relacionada, manteniendo una experiencia de notificaciones simple dentro del MVP.

## ADDED Requirements

### Requirement: Campanita visible para avisos pendientes

El sistema SHALL mostrar una campanita flotante en la interfaz autenticada únicamente cuando el usuario tenga al menos una notificación in-app no leída. La campanita SHALL mostrar la cantidad de notificaciones pendientes.

#### Scenario: No hay notificaciones pendientes

- **WHEN** el usuario autenticado no tiene notificaciones in-app no leídas
- **THEN** la campanita flotante no se muestra

#### Scenario: Hay una notificación pendiente

- **WHEN** el usuario autenticado tiene una notificación in-app no leída
- **THEN** se muestra la campanita flotante con un contador de valor `1`

#### Scenario: Hay varias notificaciones pendientes

- **WHEN** el usuario autenticado tiene dos o más notificaciones in-app no leídas
- **THEN** se muestra la campanita flotante con el total de avisos pendientes

### Requirement: Ventana de avisos agrupados

El sistema SHALL abrir una ventana desplegable al activar la campanita. La ventana SHALL mostrar todos los avisos pendientes en un área desplazable cuando no entren en el espacio disponible. Las notificaciones de mensajes de una misma conversación SHALL agruparse en un único aviso; las notificaciones de acuerdos SHALL mostrarse como avisos individuales.

#### Scenario: Abrir la ventana de avisos

- **WHEN** el usuario activa la campanita
- **THEN** se abre una ventana con los avisos pendientes sin cambiar de ruta y sin marcarlos como leídos

#### Scenario: Varios mensajes de una conversación

- **WHEN** existen varias notificaciones pendientes de mensajes para la misma conversación
- **THEN** la ventana muestra un único aviso agrupado con la cantidad de mensajes y el nombre público de la otra persona

#### Scenario: Avisos de conversaciones diferentes

- **WHEN** existen notificaciones pendientes de conversaciones diferentes
- **THEN** la ventana muestra un aviso separado para cada conversación

#### Scenario: Mensajes y acuerdos pendientes

- **WHEN** existen notificaciones pendientes de mensajes y de acuerdos
- **THEN** la ventana muestra los mensajes agrupados por conversación y cada acuerdo como un aviso independiente

#### Scenario: Cerrar la ventana

- **WHEN** el usuario cierra la ventana o activa un área fuera de ella
- **THEN** la ventana se cierra y las notificaciones conservan su estado no leído

### Requirement: Avisos contextuales del MVP

El sistema SHALL generar avisos visibles para mensajes nuevos recibidos y acuerdos confirmados. El texto SHALL identificar el tipo de evento y utilizar el nombre público o alias disponible, sin mostrar correo electrónico ni datos sensibles.

#### Scenario: Mensaje nuevo recibido

- **WHEN** llega un mensaje nuevo de otra persona
- **THEN** el usuario recibe un aviso que indica que tiene un mensaje nuevo y quién lo envió

#### Scenario: Acuerdo confirmado

- **WHEN** un acuerdo queda confirmado
- **THEN** cada participante recibe un aviso que indica que el acuerdo fue confirmado y con quién

#### Scenario: Mensaje propio

- **WHEN** el usuario envía un mensaje
- **THEN** el sistema no genera para ese mismo usuario un aviso de mensaje recibido

#### Scenario: Preferencia in-app desactivada

- **WHEN** el usuario tiene desactivada la preferencia general de notificaciones in-app
- **THEN** el sistema no muestra la campanita ni avisos in-app nuevos para ese usuario

### Requirement: Navegación y lectura desde un aviso

Cada aviso SHALL permitir abrir la conversación relacionada. Activar un aviso SHALL marcar como leídas las notificaciones que representa y SHALL navegar a la conversación correspondiente. Abrir una conversación SHALL marcar como leídas las notificaciones de mensajes pendientes de esa conversación.

#### Scenario: Abrir un aviso de mensaje

- **WHEN** el usuario activa un aviso de mensaje
- **THEN** el sistema marca como leídas las notificaciones representadas y abre la conversación relacionada

#### Scenario: Abrir un aviso de acuerdo

- **WHEN** el usuario activa un aviso de acuerdo confirmado
- **THEN** el sistema marca como leído ese aviso y abre la conversación donde se registró el acuerdo

#### Scenario: Abrir la conversación directamente

- **WHEN** el usuario entra directamente a una conversación con mensajes pendientes
- **THEN** las notificaciones de mensajes pendientes de esa conversación quedan marcadas como leídas y la campanita se actualiza

### Requirement: Actualización y deduplicación de avisos

El sistema SHALL actualizar el estado de avisos cuando recibe eventos nuevos mientras la aplicación está abierta y SHALL conservar la deduplicación existente para no presentar dos veces el mismo evento persistido.

#### Scenario: Aviso recibido con la aplicación abierta

- **WHEN** llega un mensaje o se confirma un acuerdo mientras el usuario tiene abierta la aplicación
- **THEN** la campanita y su contador se actualizan sin recargar manualmente la página

#### Scenario: Evento repetido

- **WHEN** el mismo evento se entrega más de una vez
- **THEN** se muestra una sola notificación para ese evento

### Requirement: Alcance acotado de la interfaz

El sistema SHALL mantener los avisos integrados en la interfaz existente y no SHALL crear una ruta o sección independiente `/notifications`. Esta capacidad no incluye notificaciones por correo, push, recordatorios temporales ni navegación a un mensaje individual.

#### Scenario: Acceso desde la interfaz principal

- **WHEN** el usuario utiliza la campanita o un aviso
- **THEN** la interacción ocurre desde la interfaz actual y el destino es una conversación de `/messages`

#### Scenario: Funcionalidad fuera de alcance

- **WHEN** se evalúa el MVP de esta capacidad
- **THEN** no se exige una bandeja independiente, correo, push, recordatorio programado ni salto a un mensaje exacto
