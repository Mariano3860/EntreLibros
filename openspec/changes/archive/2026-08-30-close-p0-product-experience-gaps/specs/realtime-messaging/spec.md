## Purpose

Hacer que la mensajería 1:1 presente el estado más reciente de cada conversación y permita seleccionar libros reales del usuario para acciones de intercambio, con estados claros de carga, vacío y error.

## ADDED Requirements

### Requirement: Conversación abierta en el mensaje más reciente

Al abrir una conversación, el cliente SHALL posicionar el historial en el mensaje más reciente disponible, incluyendo después de cargar o actualizar mensajes, sin obligar a la persona a desplazarse manualmente hasta el final.

#### Scenario: Apertura de chat con historial

- **WHEN** una persona abre una conversación que contiene varios mensajes
- **THEN** la vista muestra inicialmente el último mensaje y el compositor queda disponible al final

### Requirement: Adjuntar libros propios desde el chat

La acción “Adjuntar Libro” SHALL cargar las publicaciones reales y elegibles del usuario autenticado. SHALL mostrar carga, error y vacío de forma diferenciada, y no SHALL mostrar una selección ficticia cuando la API real falla.

#### Scenario: Usuario con libros al adjuntar

- **WHEN** una persona autenticada tiene publicaciones elegibles y selecciona “Adjuntar Libro”
- **THEN** puede ver y seleccionar sus libros reales para asociarlos al mensaje

#### Scenario: Usuario sin libros al adjuntar

- **WHEN** la persona no tiene publicaciones elegibles
- **THEN** el selector muestra un estado vacío explicativo y no una lista mockeada

### Requirement: Adjunto de libro persistido

Al confirmar un libro, “Adjuntar Libro” SHALL crear un mensaje persistido con metadata tipada del libro seleccionado y SHALL renderizar la tarjeta del libro en el historial. Si falla el envío, SHALL mostrar un error y no perder silenciosamente la acción.

#### Scenario: Adjuntar un libro disponible

- **WHEN** la persona selecciona una publicación elegible y confirma
- **THEN** el chat recibe un mensaje persistido que contiene la publicación y la tarjeta aparece al recargar el historial
