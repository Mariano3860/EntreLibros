## Purpose

Restituir un chat orientado a intercambios que permita encontrar personas, filtrar conversaciones y usar libros y propuestas sin perder la composición del prototipo ideal.

## ADDED Requirements

### Requirement: Nueva conversación por identidad y afinidad

El diálogo de nueva conversación SHALL buscar personas por nombre y apellido, mostrar primero contactos seguidos y luego sugerencias elegibles, y no SHALL solicitar un identificador interno como interacción principal. Los resultados SHALL excluir a la persona actual, perfiles bloqueados e inaccesibles.

#### Scenario: Buscar contacto seguido

- **WHEN** una persona escribe parte del nombre de un perfil seguido
- **THEN** el selector muestra ese perfil por nombre visible y permite abrir o crear una conversación

### Requirement: Filtro de conversaciones no leídas

El control No leídos SHALL filtrar la lista de conversaciones a aquellas con mensajes pendientes para la persona actual. SHALL comunicar un estado vacío si no existen coincidencias y restaurar la lista completa al desactivarse.

#### Scenario: Activar filtro de no leídos

- **WHEN** una persona activa No leídos
- **THEN** la lista oculta conversaciones sin mensajes pendientes y conserva la conversación seleccionada solo si pertenece al resultado filtrado

### Requirement: Composer de intercambio completo

El menú del composer SHALL exponer acciones para insertar un emoji, adjuntar libro, explorar libros propios y de la contraparte, crear una burbuja de intercambio y proponer un acuerdo. Los adjuntos y propuestas SHALL mostrar una tarjeta contextual en la conversación y permanecer disponibles tras recargar; los emojis seleccionados SHALL insertarse en el borrador sin enviarse ni perder el foco del composer.

#### Scenario: Adjuntar libro propio

- **WHEN** una persona selecciona uno de sus libros elegibles en el composer
- **THEN** el mensaje se publica con una tarjeta de libro y la conversación muestra el adjunto sin romper el composer

#### Scenario: Proponer intercambio con ambos catálogos

- **WHEN** una persona abre la propuesta de intercambio
- **THEN** puede consultar sus libros y los de la otra persona, seleccionar la combinación permitida y enviar una propuesta visible como burbuja de acuerdo

#### Scenario: Insertar emoji desde el menú del composer

- **WHEN** una persona abre el menú `+` y selecciona un emoji
- **THEN** se abre un selector compacto, el emoji elegido se inserta en la posición del cursor del borrador, el selector se cierra y el mensaje queda listo para enviar

#### Scenario: Acciones seguras según el autor de la propuesta

- **WHEN** una propuesta o contrapropuesta queda pendiente en una burbuja del chat
- **THEN** quien la envió solo puede cancelarla, la otra persona puede aceptarla o rechazarla y la API rechaza confirmar o rechazar la versión creada por su propio actor

### Requirement: Burbujas de chat preservadas

El historial SHALL conservar burbujas de texto, adjuntos y acuerdos con estados de envío, lectura y error distinguibles, manteniendo scroll independiente y composer anclado según `img.png`.

#### Scenario: Recarga de conversación con adjuntos

- **WHEN** una persona vuelve a abrir una conversación que contiene texto, un libro adjunto y una propuesta
- **THEN** los tres tipos de burbuja se renderizan en orden cronológico y con sus acciones disponibles
