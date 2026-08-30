## Purpose

Ofrecer una experiencia comunitaria y geográfica confiable, basada en actividad real, con controles visibles, imágenes contenidas y ubicación útil sin revelar más precisión de la autorizada.

## ADDED Requirements

### Requirement: Comunidad basada en actividad real

El feed de Comunidad, las personas participantes y los Rincones de Libros SHALL derivarse de datos persistidos y autorizados. La producción SHALL NOT presentar personas, publicaciones o actividad ficticias como si fueran reales; los mocks SHALL quedar limitados a pruebas o a un modo demo explícito.

#### Scenario: Nueva publicación comunitaria

- **WHEN** una publicación válida queda persistida y es visible para la comunidad
- **THEN** el feed puede mostrarla junto con su autor público y sus datos permitidos

#### Scenario: Fallo al cargar Comunidad

- **WHEN** la fuente real de Comunidad falla
- **THEN** la interfaz muestra un estado de error y no reemplaza la respuesta por una lista ficticia

### Requirement: Publicar desde Comunidad

El botón “Publicar” ubicado en la cabecera de Comunidad SHALL abrir un compositor de historia comunitaria, no el flujo de publicación de libros. La historia SHALL permitir texto, una imagen opcional y un libro enlazado opcional, y SHALL persistirse antes de aparecer en el feed. SHALL indicar errores de carga o persistencia.

#### Scenario: Acceso al compositor social

- **WHEN** una persona autenticada selecciona “Publicar” en Comunidad
- **THEN** se abre el compositor de historia y la persona puede escribir, adjuntar una imagen o enlazar un libro

#### Scenario: Historia persistida

- **WHEN** la persona envía una historia válida
- **THEN** la historia queda disponible en el feed con su autor y libro enlazado, si corresponde

### Requirement: Imágenes de Rincones contenidas

Las imágenes de Rincones SHALL mantenerse dentro del contenedor asignado sin cubrir el nombre, acciones ni metadatos del Rincón, independientemente de su relación de aspecto.

#### Scenario: Imagen vertical o larga

- **WHEN** un Rincón tiene una imagen vertical o con altura extensa
- **THEN** la imagen se recorta o adapta dentro de su área y el nombre permanece completamente visible

### Requirement: Mini mapa operativo

El mini mapa de Comunidad SHALL renderizar una base cartográfica o estado alternativo claramente explicado, mostrar el contenido autorizado disponible y ofrecer únicamente un control visible para ir al mapa completo, ubicado arriba a la derecha. SHALL distinguir carga, error y vacío.

#### Scenario: Mini mapa con Rincones

- **WHEN** existen Rincones visibles para el área mostrada
- **THEN** el mini mapa muestra la base y los elementos correspondientes, y el control permite abrir el mapa completo

#### Scenario: Mini mapa sin servicio cartográfico

- **WHEN** la base cartográfica o la consulta de Rincones no está disponible
- **THEN** el componente muestra un estado de error o vacío legible, sin quedar como un rectángulo blanco ambiguo

### Requirement: Mapa contextual y privacidad de ubicación

`/map` SHALL intentar centrar la vista en la ubicación disponible del usuario cuando exista permiso. Si no existe permiso o ubicación, SHALL usar un fallback documentado y visible. Cuando la ubicación propia se encuentre disponible, el mapa SHALL mostrar un indicador de posición con precisión limitada por la política de privacidad; nunca SHALL exponer una dirección exacta públicamente.

#### Scenario: Usuario con ubicación autorizada

- **WHEN** una persona abre `/map` y el navegador entrega una ubicación autorizada
- **THEN** el mapa se centra en esa zona y muestra un indicador de ubicación propia

#### Scenario: Usuario sin permiso de ubicación

- **WHEN** una persona abre `/map` sin permiso o sin una ubicación disponible
- **THEN** el mapa muestra el fallback previsto y una explicación accionable, sin fingir que Buenos Aires es la ubicación de la persona

### Requirement: Filtro de distancia hasta 25 km

El control de distancia SHALL aplicar el radio seleccionado a los resultados del mapa y SHALL permitir seleccionar todo el rango hasta 25 km, incluido el extremo derecho. La pista visual SHALL reflejar el valor seleccionado en toda su longitud y el filtro SHALL recalcular los resultados de forma observable.

#### Scenario: Radio máximo

- **WHEN** una persona mueve el control hasta 25 km
- **THEN** el control llega al extremo derecho, el relleno azul cubre el rango correspondiente y el mapa/listado muestra resultados dentro de 25 km

#### Scenario: Radio reducido

- **WHEN** una persona reduce el radio seleccionado
- **THEN** desaparecen o se excluyen los elementos fuera del nuevo radio y el valor visible coincide con el filtro aplicado
