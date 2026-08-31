## Purpose

Mantener las recomendaciones de Inicio útiles, sociales y visualmente densas sin convertir el rail de libros en un catálogo completo.

## ADDED Requirements

### Requirement: Rail de recomendaciones limitado y renovable
La página de Inicio SHALL mostrar exactamente hasta cinco libros por conjunto de recomendaciones. El rail SHALL ofrecer controles compactos, accesibles y coherentes con `img.png` para avanzar, retroceder o renovar el conjunto sin navegar a otra ruta ni añadir una segunda barra de herramientas.

#### Scenario: Avance a otro conjunto
- **WHEN** una persona activa el control siguiente o renovar y existen más recomendaciones elegibles
- **THEN** el rail muestra un conjunto distinto de hasta cinco libros y conserva el foco en el control activado

#### Scenario: Conjunto incompleto
- **WHEN** existen menos de cinco recomendaciones elegibles
- **THEN** el rail muestra únicamente las disponibles y no rellena las posiciones con duplicados ni placeholders ficticios

### Requirement: Priorización social de recomendaciones
El sistema SHALL ordenar primero publicaciones públicas y activas de perfiles seguidos que sean elegibles para la persona, y después publicaciones públicas relevantes de otros perfiles. No SHALL incluir publicaciones propias, privadas, vencidas, bloqueadas o inaccesibles.

#### Scenario: Recomendaciones de perfiles seguidos
- **WHEN** una persona sigue a lectores con publicaciones elegibles
- **THEN** esas publicaciones aparecen antes que las recomendaciones de perfiles no seguidos dentro de los conjuntos renovables

### Requirement: Detalle sin redirección desde Inicio
El sistema SHALL abrir el detalle del libro seleccionado desde Inicio en un modal contextual y SHALL conservar la ruta `/home` al abrirlo y cerrarlo.

#### Scenario: Apertura del detalle
- **WHEN** una persona selecciona una card de recomendación
- **THEN** ve el detalle del libro en un modal y la URL no cambia a `/books` ni a `Mis libros`

