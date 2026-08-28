## Purpose

Define un catálogo y ciclo de publicaciones consistente, buscable y seguro desde la creación de un libro hasta el cierre o caducidad de su disponibilidad.

## ADDED Requirements

### Requirement: Propiedad y edición de publicaciones
Sólo el propietario autenticado o un moderador autorizado SHALL poder modificar el contenido, imágenes, ubicación o estado de una publicación.

#### Scenario: Edición por propietario
- **WHEN** el propietario actualiza una publicación válida
- **THEN** el sistema persiste los cambios, conserva la propiedad y devuelve la representación actualizada

### Requirement: Búsqueda paginada y filtrable
El catálogo SHALL permitir búsqueda y filtros documentados por texto, autor, ISBN, idioma, estado, distancia y tipo de intercambio, con paginación y límites estables.

#### Scenario: Búsqueda combinada
- **WHEN** un usuario combina texto, distancia y disponibilidad
- **THEN** recibe sólo resultados autorizados dentro de los filtros, junto con metadatos de paginación

### Requirement: Estados y caducidad coherentes
Una publicación SHALL seguir transiciones válidas entre borrador, disponible, reservada, intercambiada, retirada y caducada; el sistema MUST impedir acuerdos nuevos sobre estados no disponibles.

#### Scenario: Publicación caducada
- **WHEN** vence la disponibilidad configurada
- **THEN** la publicación deja de aparecer como intercambiable y el propietario puede renovarla explícitamente

### Requirement: Verificación autorizada
La marca de libro verificado MUST requerir un rol autorizado y SHALL conservar quién verificó, cuándo y sobre qué datos.

#### Scenario: Verificación por usuario común
- **WHEN** un usuario sin rol de verificación intenta verificar un libro
- **THEN** la petición se rechaza y el estado del libro no cambia

### Requirement: Imágenes y ubicación seguras
Las imágenes SHALL validarse por tipo, tamaño y cantidad, y la ubicación pública SHALL redondearse o agregarse según privacidad antes de aparecer en catálogo o mapa.

#### Scenario: Publicación pública geolocalizada
- **WHEN** se muestra una publicación con ubicación privada registrada
- **THEN** la respuesta pública contiene sólo la precisión consentida y no las coordenadas exactas originales
