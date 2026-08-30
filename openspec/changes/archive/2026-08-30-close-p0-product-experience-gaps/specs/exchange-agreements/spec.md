## Purpose

Permitir que una propuesta de intercambio se construya con publicaciones reales, autorizadas y disponibles, evitando selectores vacíos o datos ficticios cuando la persona sí tiene libros.

## ADDED Requirements

### Requirement: Libros reales para proponer intercambios

El flujo de propuesta SHALL cargar los libros propios elegibles y las publicaciones de la contraparte que puedan ser solicitadas, según autorización y disponibilidad. SHALL validar que los elementos seleccionados sigan disponibles al enviar la propuesta.

#### Scenario: Propuesta con libros disponibles

- **WHEN** una persona abre “Proponer un intercambio” y ambas partes tienen publicaciones elegibles
- **THEN** los selectores muestran esas publicaciones reales y permiten formar una propuesta válida

#### Scenario: Ninguna publicación elegible

- **WHEN** no existe una publicación elegible para alguna de las partes
- **THEN** el flujo explica qué falta y no muestra libros ficticios ni permite enviar una propuesta inválida

### Requirement: Error de carga distinguible

Si no se pueden cargar los libros para una propuesta, el flujo SHALL mostrar un error con posibilidad de reintento y SHALL diferenciarlo del estado vacío legítimo.

#### Scenario: Fallo al cargar libros

- **WHEN** la consulta de publicaciones falla al abrir el selector
- **THEN** se muestra un error de carga y una acción de reintento, sin presentar una lista vacía como si no hubiera libros
