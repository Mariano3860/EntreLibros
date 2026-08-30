## Purpose

Esta capacidad permite que cada usuario describa sus preferencias de lectura y su zona general para mejorar el contexto de la comunidad, las afinidades y la cercanía sin revelar una dirección exacta.

## ADDED Requirements

### Requirement: Selección de intereses de libros

El sistema SHALL permitir que el usuario seleccione intereses de libros desde un catálogo predefinido y SHALL mostrar los intereses seleccionados en su perfil. El catálogo SHALL usar etiquetas consistentes y no SHALL requerir texto libre.

#### Scenario: Seleccionar intereses predefinidos

- **WHEN** el usuario edita su perfil y selecciona uno o más intereses del catálogo
- **THEN** el sistema incorpora esos intereses al perfil y permite quitarlos antes de guardar

#### Scenario: Guardar menos de tres intereses

- **WHEN** el usuario guarda el perfil con cero, uno o dos intereses
- **THEN** el sistema permite guardar el perfil y muestra una recomendación para seleccionar al menos tres intereses

#### Scenario: Mostrar intereses en el perfil público

- **WHEN** otro usuario consulta un perfil que tiene intereses guardados
- **THEN** el sistema muestra los intereses de libros seleccionados sin exponer información privada adicional

### Requirement: Ciudad y barrio como zona general

El sistema SHALL requerir una ciudad para guardar la zona general del perfil y SHALL permitir seleccionar un barrio opcional perteneciente a esa ciudad. La selección SHALL realizarse mediante controles simples del formulario y no SHALL requerir mapa ni geolocalización.

#### Scenario: Guardar una ciudad sin barrio

- **WHEN** el usuario selecciona una ciudad y deja el barrio vacío
- **THEN** el sistema guarda la ciudad como zona general válida

#### Scenario: Guardar ciudad y barrio

- **WHEN** el usuario selecciona una ciudad y un barrio válido de esa ciudad
- **THEN** el sistema guarda ambos datos como zona general del perfil

#### Scenario: Intentar guardar sin ciudad

- **WHEN** el usuario intenta guardar un perfil sin seleccionar ciudad
- **THEN** el sistema impide el guardado y muestra que la ciudad es obligatoria

#### Scenario: Cambiar de ciudad

- **WHEN** el usuario cambia la ciudad seleccionada
- **THEN** el sistema limpia o invalida el barrio anterior para impedir guardar un barrio que no pertenece a la nueva ciudad

### Requirement: Visibilidad de la zona según privacidad

El sistema SHALL reutilizar la configuración de visibilidad de ubicación del perfil para decidir qué zona se muestra públicamente. La configuración privada SHALL ocultar ciudad y barrio; la configuración de ciudad SHALL mostrar únicamente ciudad; y la configuración de barrio SHALL mostrar ciudad y barrio cuando exista un barrio seleccionado.

#### Scenario: Ubicación privada

- **WHEN** otro usuario consulta un perfil cuya visibilidad de ubicación es privada
- **THEN** la respuesta pública no incluye ciudad ni barrio

#### Scenario: Visibilidad a nivel de ciudad

- **WHEN** otro usuario consulta un perfil cuya visibilidad de ubicación es ciudad
- **THEN** la respuesta pública incluye la ciudad y no incluye el barrio

#### Scenario: Visibilidad a nivel de barrio

- **WHEN** otro usuario consulta un perfil cuya visibilidad de ubicación es barrio
- **THEN** la respuesta pública incluye la ciudad y el barrio si el usuario lo seleccionó

### Requirement: Privacidad de ubicación exacta

El sistema SHALL mantener oculta la dirección exacta y no SHALL convertir la selección de zona general en una dirección, coordenada precisa, calle o altura visible para otros usuarios.

#### Scenario: Consultar un perfil público

- **WHEN** un usuario consulta la información pública de otro usuario
- **THEN** la respuesta no contiene calle, altura, dirección exacta ni coordenadas precisas derivadas del formulario de zona general

#### Scenario: Editar la zona general

- **WHEN** el usuario guarda ciudad o barrio
- **THEN** el sistema persiste únicamente la zona general necesaria para el perfil y la visibilidad definida

### Requirement: Persistencia y edición coherentes

El sistema SHALL cargar los intereses y la zona general existentes al abrir el formulario de perfil y SHALL conservarlos después de una edición exitosa y una nueva consulta del perfil.

#### Scenario: Cargar datos existentes

- **WHEN** el usuario abre su perfil con intereses, ciudad o barrio previamente guardados
- **THEN** el formulario muestra esos valores como seleccionados

#### Scenario: Editar y volver a consultar

- **WHEN** el usuario modifica intereses o zona y guarda correctamente
- **THEN** una nueva consulta del perfil devuelve los valores actualizados

#### Scenario: Error de guardado

- **WHEN** el servidor rechaza los datos del perfil
- **THEN** el sistema informa el error y no presenta los cambios rechazados como persistidos

### Requirement: Alcance acotado de afinidades y cercanía

El sistema SHALL guardar intereses y zona como datos de perfil preparados para futuras afinidades y ordenamiento por cercanía, pero este cambio SHALL NOT generar recomendaciones automáticas, coincidencias entre usuarios ni cálculo de distancias dentro del formulario de perfil.

#### Scenario: Perfil preparado para usos futuros

- **WHEN** el usuario guarda intereses y zona general válidos
- **THEN** esos datos quedan disponibles según las reglas de privacidad para futuras funcionalidades del producto

#### Scenario: Funcionalidad fuera de alcance

- **WHEN** el usuario edita intereses o zona
- **THEN** el sistema no muestra recomendaciones automáticas ni solicita compartir la ubicación actual
