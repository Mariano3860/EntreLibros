## Purpose

Hacer que Comunidad soporte interacciones sociales persistentes y relevantes, sin presentar historias propias como contenido de terceros ni perder la composición del prototipo ideal.

## ADDED Requirements

### Requirement: Me gusta persistente
Una persona autenticada SHALL poder dar y quitar un único me gusta a cada publicación comunitaria visible. El contador SHALL reflejar el total persistido y las actualizaciones SHALL respetar bloqueos, visibilidad y autorización.

#### Scenario: Alternar me gusta
- **WHEN** una persona activa dos veces el control de me gusta de una publicación
- **THEN** la primera acción registra el me gusta y la segunda lo elimina sin crear duplicados

### Requirement: Comentarios y compartidos
Una persona autenticada SHALL poder publicar comentarios en publicaciones permitidas y compartir un enlace canónico de la publicación. Los comentarios SHALL conservar autor, fecha y orden estable; compartir SHALL dar feedback incluso cuando el navegador no admita la API nativa.

#### Scenario: Publicar comentario
- **WHEN** una persona envía un comentario no vacío en una publicación permitida
- **THEN** el comentario aparece en el hilo con su identidad pública y sigue visible tras recargar

#### Scenario: Compartir con fallback
- **WHEN** una persona activa compartir en un navegador sin API de compartido nativa
- **THEN** el sistema copia o expone el enlace canónico y confirma la acción sin perder el contexto del feed

### Requirement: Tira de historias relevante
La tira superior de Comunidad SHALL excluir a la persona autenticada como story de contenido. SHALL mostrar historias recientes de perfiles seguidos y perfiles relevantes permitidos, y ofrecer la creación de historia mediante una acción separada.

#### Scenario: Historia propia separada
- **WHEN** una persona abre Comunidad con historias disponibles
- **THEN** no ve su propio avatar como elemento de la tira y puede iniciar una nueva historia desde un control de creación separado

#### Scenario: Sin historias elegibles
- **WHEN** no existen historias de perfiles elegibles
- **THEN** la tira muestra un estado vacío compacto y mantiene disponible la acción de crear historia

