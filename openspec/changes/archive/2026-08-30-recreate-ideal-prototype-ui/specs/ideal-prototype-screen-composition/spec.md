## Purpose

Define the observable anatomy, content density, block relationships and responsive behavior required for every screen to match its exact quadrant in the supplied ideal prototype.

## ADDED Requirements

### Requirement: Inicio reference composition

Inicio SHALL reproduce the upper-left quadrant of `Screens/Prototipo ideal/img.png` as a personalized editorial dashboard rather than a generic feed.

#### Scenario: Authenticated Inicio

- **WHEN** Mariano opens Inicio with the reference mock session
- **THEN** the first content block SHALL be a wide hero with a reading-room background, dark overlay, `¡Bienvenido de nuevo, Mariano!`, teal name emphasis, supporting copy and `Explorar libros` CTA; below it SHALL be one row of four KPI cards for `134 Libros intercambiados hoy`, `52 Casitas activas`, `1 Usuarios activos` and `1 Libros publicados`, each with its own accent icon/treatment.

#### Scenario: Inicio lower content

- **WHEN** the hero and KPIs are visible
- **THEN** the next region SHALL show `Recomendados para vos` with the five prototype books —`Ecos del Viento Norte`, `El mapa de las luciérnagas`, `Cartas para otro verano`, `La biblioteca sin tiempo` and `Bajo la misma constelación`— in a compact horizontal rail with navigation, alongside `Actividad reciente` with the visible events and `Ver toda la actividad` action.

### Requirement: Explorar reference composition

Explorar SHALL reproduce the upper-right quadrant of `img.png` as a catalog workspace with a dominant search toolbar and a dense book rail.

#### Scenario: Catalog initial state

- **WHEN** the user opens `/books`
- **THEN** the screen SHALL show `Explorar libros`, its subtitle, a wide search field, `Filtros`, `Publicar un libro`, tabs with `Todos` selected, and five visible cards for the reference books with cover, title, author, availability badge, condition, price and `A la venta` or `Intercambio` action.

#### Scenario: Catalog controls

- **WHEN** the user searches, selects `Mis libros`, `Disponibles para intercambio`, `Buscando` or `A la venta`, opens Filtros, publishes a book or uses the rail controls
- **THEN** the content SHALL update or open the corresponding flow, the active state SHALL remain visible, and no `Ver todos` or arrow control SHALL be inert.

### Requirement: Comunidad reference composition

Comunidad SHALL reproduce the lower-left quadrant of `img.png` as a social reading feed with a stories strip, composer and discovery sidebar.

#### Scenario: Community initial state

- **WHEN** the user opens Comunidad with reference data
- **THEN** the top strip SHALL show circular stories including `Tu historia` with add affordance, `Red tea`, `Harry Potter`, `Club de poesía`, `Nueva casita`, `Lectores BA` and `Ficción total`; below it SHALL show the composer and a visible post, while the right column SHALL show `Rincones cerca de vos` with two nearby entries, `Ver mapa`, mini map and `Sugerencias para vos`.

#### Scenario: Community composer

- **WHEN** the user activates Foto / Video, Ofrecer libro, Proponer intercambio, Encuesta or Publicar
- **THEN** the UI SHALL expose the social-story flow with text, optional media and optional linked book; Publicar SHALL not open the book-publication flow, and a successful mock submission SHALL appear in the feed or show explicit success feedback.

### Requirement: Mensajes reference composition

Mensajes SHALL reproduce the lower-right quadrant of `img.png` as a two-column workspace with a list and a rich selected conversation.

#### Scenario: Conversation initial state

- **WHEN** the user opens Mensajes
- **THEN** the left column SHALL include the title, compose action, search field and visible conversations such as Bot, Lucia, Club de Lectura BA, Sofia, Diego and Ana with avatar, preview, time and unread indicators; the conversation column SHALL show Lucia's avatar/name, online state and header actions.

#### Scenario: Rich conversation

- **WHEN** the Lucia conversation is selected
- **THEN** the history SHALL show recent bubbles and the proposal card for `Ecos del Viento Norte` with cover, author, condition, exchange icon and `Ver propuesta`, and the composer SHALL remain anchored at the bottom with add, message, emoji/location/attach and send affordances.

#### Scenario: Conversation interaction

- **WHEN** the user sends a message, attaches a book, proposes an exchange or changes conversation
- **THEN** the selected state and history SHALL update in place, the newest content SHALL be reachable at the bottom, and loading/empty/error feedback SHALL remain inside the affected region.

### Requirement: Mapa reference composition

Mapa SHALL reproduce the upper-left quadrant of `img_1.png` as a filter rail beside a dominant dark map.

#### Scenario: Map initial state

- **WHEN** the user opens `/map` with reference map data
- **THEN** the rail SHALL show `Mapa de rincones`, subtitle, search field, chips for `Rincones de libros`, `Publicaciones cercanas`, `Abiertos ahora` and `Actividad reciente`, distance set around `2 km` with the visible scale labels, category buttons for Todo/Cafés/Bibliotecas/Parques/Librerías/Más, and `Actividad en tu zona`; the map SHALL show dark cartography, colored pins, cluster counts, blue user location and the selected `Café Literario` detail card.

#### Scenario: Map interaction

- **WHEN** the user changes distance, categories, map filters, `Mi ubicación` or a pin
- **THEN** visible pins, cluster counts, selected detail and rail state SHALL update, the map SHALL remain dark and expanded, the user's position SHALL be distinguishable, and the create-corner action SHALL remain visible and usable.

### Requirement: Estadísticas reference composition

Estadísticas SHALL reproduce the upper-right quadrant of `img_1.png` as a community analytics dashboard with the same relative two-row block arrangement.

#### Scenario: Statistics initial state

- **WHEN** the user opens Estadísticas with reference data
- **THEN** the header SHALL show `Estadísticas de la comunidad`, subtitle, period selector and `Exportar`; the first row SHALL show four KPI cards with `2.843 Intercambios`, `1.327 Casitas activas`, `5.891 Usuarios activos` and `7.642 Libros publicados`, each with trend text and accent.

#### Scenario: Statistics charts and rankings

- **WHEN** the KPI row is visible
- **THEN** the next regions SHALL include the weekly exchange line chart with current/previous legend and tooltip state, the new-publications bar chart with day labels/count, `Rincones más activos`, `Mapa de actividad` and `Top contribuyentes` with ranked rows and visible summary values.

#### Scenario: Statistics controls

- **WHEN** the user changes the period or activates Exportar
- **THEN** chart series, totals or feedback SHALL update visibly without replacing charts with empty placeholders or changing the dashboard hierarchy.

### Requirement: Perfil reference composition

Perfil SHALL reproduce the lower-left quadrant of `img_1.png` as a personal reading dashboard.

#### Scenario: Profile hero and metrics

- **WHEN** Mariano opens Perfil
- **THEN** the page SHALL show a wide reading-room cover, circular portrait, `Mariano`, `@mariano_lector`, location, join date, description and `Editar perfil`; below it SHALL show interest chips and the four summary metrics `146 Intercambios`, `23 Reseñas`, `58 Seguidores` and `41 Siguiendo`.

#### Scenario: Profile lower dashboard

- **WHEN** the profile hero is visible
- **THEN** the lower row SHALL contain `Preferencias` with compact setting rows, `Objetivo de lectura` with progress and streak values, and `Logros` with circular achievement badges and `Ver todos` action, while long descriptions remain contained.

### Requirement: Centro de ayuda reference composition

Centro de ayuda SHALL render at `/contact` and reproduce the lower-right quadrant of `img_1.png` as a support dashboard.

#### Scenario: Help initial state

- **WHEN** the user opens `/contact`
- **THEN** the page SHALL show `Centro de ayuda`, supporting copy, editorial hero with question illustration, help search field, category cards for Cuenta, Publicaciones, Intercambios, Mensajes, Casitas and Seguridad, an FAQ list and a right panel offering chat en vivo and sending a message.

#### Scenario: Help interaction

- **WHEN** the user searches, expands an FAQ, starts chat or sends a consultation
- **THEN** the affected content SHALL expand, filter or show a visible feedback state without collapsing unrelated categories or losing the support panel.

### Requirement: Responsive and content-safe reflow

All eight compositions SHALL preserve their visual order and essential actions below the desktop comparison viewport, while handling variable content without clipping or unbounded growth.

#### Scenario: Narrow viewport

- **WHEN** any reference route is opened on a narrow viewport
- **THEN** the sidebar, multi-column regions, book rails, map rail, chat list, charts and help panels SHALL collapse or scroll in a documented order, with no horizontal page overflow and with usable touch targets.

#### Scenario: Long or missing content

- **WHEN** a title, author, username, description, image, chart series or list is longer, missing or empty
- **THEN** the affected card/panel SHALL keep its geometry, wrap or truncate intentionally, or show a local empty/error state without covering a neighboring title, action, footer or map label.

### Requirement: Route-level visual acceptance

Each reference route SHALL be considered complete only when its rendered app viewport can be compared against its assigned prototype quadrant and all visible blocks and primary actions are present.

#### Scenario: Desktop evidence

- **WHEN** a route is presented for acceptance
- **THEN** it SHALL have a captured desktop comparison showing the same shell, main block order, approximate proportions, content density, assets/crops, colors and controls as its assigned quadrant.

#### Scenario: State evidence

- **WHEN** a route is presented for acceptance
- **THEN** its loading, empty, error, focus, interaction and reduced-motion states SHALL be checked without allowing those states to erase the visual shell or replace the prototype with generic placeholders.
