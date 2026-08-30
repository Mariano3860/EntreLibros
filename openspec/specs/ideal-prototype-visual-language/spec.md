# ideal-prototype-visual-language Specification

## Purpose
Define the shared visual contract required to reproduce the dark editorial EntreLibros prototype consistently, including the shell, surfaces, media, controls, typography, iconography and accessible states.

## Requirements

### Requirement: Prototype shell anatomy

The authenticated application SHALL render a stable shell matching the prototype's anatomy: a narrow left sidebar with the EntreLibros logo, primary navigation, a separated lower action group and a signed-in user summary; the page content SHALL occupy the remaining canvas without browser chrome being treated as application UI.

#### Scenario: Desktop shell geometry

- **WHEN** an authenticated user opens any reference route in the desktop comparison viewport
- **THEN** the sidebar SHALL keep one consistent width and vertical structure across all screens, the main canvas SHALL begin beside it, and the sidebar SHALL not cover, push off-screen or vertically misalign the main content.

#### Scenario: Sidebar content and selection

- **WHEN** the user navigates among Inicio, Explorar, Comunidad, Mapa, Mensajes, Estadísticas, Perfil and Centro de ayuda
- **THEN** the sidebar SHALL show those destinations in the prototype order, keep Ajustes/Ayuda/Cerrar sesión in the lower group, show the current user summary at the bottom, and apply the teal selected treatment to exactly the active destination.

### Requirement: Dark editorial canvas and surfaces

The canonical visual theme SHALL match the prototype's blue-green dark canvas, layered dark panels, thin low-contrast outlines, restrained elevation, compact radii and teal primary actions, with semantic accent colors reserved for metrics, map states and statuses.

#### Scenario: Layered page

- **WHEN** a screen renders a page background, content panel, card, input and overlay together
- **THEN** each layer SHALL remain distinguishable by tone, border or elevation, and no native white control, flat black void or unbounded shadow SHALL break the visual hierarchy.

#### Scenario: Density and alignment

- **WHEN** a desktop reference route is rendered with the prototype dataset
- **THEN** the content SHALL preserve the prototype's compact-but-breathable density, consistent horizontal gutters, repeated card gaps, aligned headings and intentional empty space rather than using unrelated spacing values per page.

### Requirement: Typography and information hierarchy

Headings, highlighted names, subtitles, metadata, badges, prices, counts and actions SHALL use a predictable type hierarchy matching the prototype, with the most important content visually dominant and secondary content visibly quieter.

#### Scenario: Personalized heading

- **WHEN** Inicio renders the welcome message
- **THEN** the greeting SHALL give the user's name the teal emphasis shown in the prototype while the supporting description and CTA remain legible and subordinate.

#### Scenario: Card hierarchy

- **WHEN** a book, activity, story, message, statistic, ranking or support item is rendered
- **THEN** its title, supporting metadata, status/count and primary action SHALL appear in a stable order, SHALL wrap or truncate intentionally, and SHALL not compete at the same visual weight.

### Requirement: Shared controls and state treatments

Buttons, icon buttons, inputs, selects, tabs, chips, badges, toggles, cards, menus, modals and feedback regions SHALL use the prototype's compact proportions and SHALL expose distinct hover, pressed, selected, focus-visible, disabled, loading, empty, error and success treatments.

#### Scenario: Primary action

- **WHEN** the user views or activates a primary action such as Publicar un libro, Publicar, Ver mapa, Editar perfil, Exportar, Iniciar chat or Enviar consulta
- **THEN** the action SHALL have a clear filled/teal treatment, a usable hit area, a visible interaction state and a result or feedback state; it SHALL not remain a decorative or inert pill.

#### Scenario: Secondary and icon action

- **WHEN** the user views or activates Filtros, carousel arrows, search, phone/video/info, map controls, FAQ controls or composer icons
- **THEN** the control SHALL retain the prototype's compact secondary treatment, have an accessible name, show focus/pressed feedback and preserve the surrounding layout.

### Requirement: Editorial media and asset fidelity

Hero backgrounds, book covers, avatars, story circles, map previews and uploaded media SHALL be treated as first-class visual assets and SHALL preserve the prototype's aspect ratio, crop, radius, overlay and contrast.

#### Scenario: Available prototype asset

- **WHEN** an original or recoverable asset exists for a visible prototype region
- **THEN** the application SHALL use that asset or a faithful local copy with a stable URL rather than substituting a generic random image.

#### Scenario: Missing prototype asset

- **WHEN** the original asset cannot be recovered
- **THEN** the application SHALL use a stable local fallback or an approved crop with the same visual role, aspect ratio, crop and contrast, and SHALL record the substitution in the asset matrix.

#### Scenario: Contained non-square media

- **WHEN** a vertical, wide or unusually long image appears in a card, story, feed, hero or mini map
- **THEN** the image SHALL remain inside its allocated region and SHALL never cover a title, badge, action, map label or neighboring panel.

### Requirement: Accessible theme and interaction states

The prototype visual language SHALL remain usable with keyboard navigation, visible focus, reduced motion, long text, missing media and both theme attributes, while dark mode remains the canonical visual target.

#### Scenario: Keyboard and focus

- **WHEN** a keyboard user tabs through a reference route
- **THEN** focus SHALL follow the visual/action order, remain visible against every dark surface and provide an accessible name for icon-only controls.

#### Scenario: Dark form state

- **WHEN** a form control is focused, invalid, disabled, loading or successful in dark mode
- **THEN** its label, value, border, feedback and focus ring SHALL remain readable without relying solely on color or causing layout jumps.

#### Scenario: Reduced motion

- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** decorative entrances, hover movement and transitions SHALL be minimized or removed while selection, focus, loading and success/error feedback remain clear.
