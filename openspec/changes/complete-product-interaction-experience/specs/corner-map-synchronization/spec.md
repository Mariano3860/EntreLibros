## Purpose

Sincronizar los rincones mostrados en Comunidad y Mapa para que ubicación, selección, detalle y alcance geográfico representen la misma información verificable.

## ADDED Requirements

### Requirement: Mini mapa comunitario conectado
El mini mapa de Comunidad SHALL representar rincones reales de la misma fuente que el mapa principal, incluyendo pines seleccionables y un enlace que abra `/map` con el rincón seleccionado preservado.

#### Scenario: Abrir rincón desde Comunidad
- **WHEN** una persona selecciona un pin o un rincón del mini mapa y activa ver mapa
- **THEN** navega a `/map` centrado en ese rincón y ve su detalle seleccionado

### Requirement: Selección y detalle enriquecido de rincón
El mapa principal SHALL centrar y aproximar el viewport al activar ver rincón desde un listado, pin o publicación relacionada. SHALL mostrar un panel de detalle dentro del mapa, alineado a `img_1.png`, con imagen principal más prominente, nombre, distancia, disponibilidad, horario y acciones pertinentes.

#### Scenario: Ver rincón desde una publicación
- **WHEN** una persona activa ver rincón para una publicación con rincón asociado
- **THEN** el mapa aproxima el rincón asociado y abre el panel de detalle correspondiente

#### Scenario: Rincón sin imagen
- **WHEN** el rincón seleccionado no tiene imagen principal
- **THEN** el panel usa un fallback visual local sin alterar la altura ni ocultar los datos esenciales

### Requirement: Radio geográfico efectivo y visible
El mapa SHALL ofrecer radios discretos de 1 km, 5 km, 30 km, 50 km y sin límite. Para un radio finito SHALL mostrar un perímetro azul-celeste centrado en la ubicación aproximada de la persona y SHALL limitar pines, listados y rincones seleccionables a ese radio.

#### Scenario: Cambio de radio
- **WHEN** una persona cambia el radio de 5 km a 30 km
- **THEN** el perímetro se actualiza y el rail y los pines muestran únicamente rincones dentro de 30 km

#### Scenario: Sin ubicación disponible
- **WHEN** no hay permiso o coordenadas de ubicación
- **THEN** el sistema explica el fallback, no inventa una ubicación precisa y mantiene un comportamiento consistente para el radio elegido

