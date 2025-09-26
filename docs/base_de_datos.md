# Esquema de base de datos

## Diagrama de clases (Mermaid)

El siguiente diagrama resume las entidades principales de EntreLibros y cómo se relacionan. Se incluyen usuarios, libros, publicaciones, rincones de libros, mensajes, acuerdos, imágenes, géneros y sugerencias de libros. Al visualizar este archivo en GitHub se renderiza el diagrama en formato Mermaid.

```mermaid
classDiagram
    %% Definición de clases con atributos principales
    class Usuario {
        +usuarioId: int
        +nombre: string
        +email: string
        +zona: string
        +fechaRegistro: datetime
    }
    class Libro {
        +libroId: int
        +titulo: string
        +autor: string
        +editorial: string
        +isbn: string
        +anioPublicacion: int
    }
    class Genero {
        +generoId: int
        +nombre: string
    }
    class Publicacion {
        +publicacionId: int
        +estadoEjemplar: string
        +modalidad: string
        +precio: decimal
        +zonaEncuentro: string
        +fechaPublicacion: datetime
        +fechaExpiracion: datetime
    }
    class RinconDeLibros {
        +rinconId: int
        +nombre: string
        +ambito: string
        +ciudad: string
        +barrio: string
        +referencia: string
        +ubicacion: Point
        +estado: string
        +fechaAlta: datetime
    }
    class Mensaje {
        +mensajeId: int
        +contenido: string
        +fechaHora: datetime
        +leido: bool
    }
    class Acuerdo {
        +acuerdoId: int
        +fechaHoraEncuentro: datetime
        +puntoEncuentro: Point
        +estado: string
        +confirmado: bool
    }
    class Imagen {
        +imagenId: int
        +url: string
        +tipo: string
    }
    class SugerenciaLibro {
        +sugerenciaId: int
        +motivo: string
        +fechaSugerencia: datetime
    }

    %% Relaciones entre clases con cardinalidades
    Usuario "1" -- "0..*" Publicacion : **publica/autor** >
    Usuario "1" -- "0..*" RinconDeLibros : **registra** >
    Usuario "0..*" -- "0..*" Acuerdo : **participa** >
    Mensaje "*" -- "1" Usuario : **remitente**
    Mensaje "*" -- "1" Usuario : **destinatario**
    Libro "1" -- "0..*" Publicacion : **título de / ejemplar de** >
    Genero "1" -- "0..*" Libro : **clasifica** >
    Publicacion "0..1" -- "1" Acuerdo : **cerrada en** >
    RinconDeLibros "0..*" -- "0..1" Acuerdo : **lugarEncuentro** >
    Publicacion "1" -- "1" Imagen : **fotoEjemplar**
    RinconDeLibros "1" -- "1" Imagen : **fotoRDL**
    Usuario "1" -- "0..*" SugerenciaLibro : **recibe** >
    Libro "1" -- "0..*" SugerenciaLibro : **esSugerido** >
## Tablas principales

### `users`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador del usuario |
| `name` | TEXT | Nombre público |
| `email` | TEXT UNIQUE | Correo de autenticación |
| `password_hash` | TEXT | Hash de la contraseña |
| `role` | TEXT | Perfil del usuario (`user`, `admin`, etc.) |
| `language` | TEXT | Idioma preferido |
| `bio` | TEXT | Información de perfil |
| `location` | GEOGRAPHY(Point,4326) | Coordenadas del usuario |
| `search_radius` | INTEGER | Radio de búsqueda en metros |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización |

### `books`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador interno |
| `title` | TEXT | Título del libro |
| `isbn` | TEXT | Código ISBN |
| `authors` | TEXT | Autores principales |
| `publisher` | TEXT | Editorial |
| `published_year` | INTEGER | Año de publicación |
| `description` | TEXT | Descripción o sinopsis |
| `verified` | BOOLEAN | Indica si la ficha fue validada |
| `created_at` | TIMESTAMPTZ | Fecha de registro |

### `book_images`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador |
| `book_id` (FK→`books.id`) | INTEGER | Libro asociado |
| `url` | TEXT | Ruta a la imagen |
| `is_primary` | BOOLEAN | Marca la imagen principal |
| `metadata` | JSONB | Información adicional |
| `created_at` | TIMESTAMPTZ | Fecha de carga |

### `publications`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador |
| `user_id` (FK→`users.id`) | INTEGER | Autor de la publicación |
| `book_id` (FK→`books.id`) | INTEGER | Libro referenciado |
| `status` | ENUM('draft','pending','verified','rejected') | Estado de la publicación |
| `type` | ENUM('offer','request','exchange') | Tipo de interacción |
| `description` | TEXT | Detalle del ejemplar |
| `condition` | TEXT | Estado físico |
| `location` | GEOGRAPHY(Point,4326) | Ubicación opcional del intercambio |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización |
| `verified_at` | TIMESTAMPTZ | Fecha de verificación |
| `verified_by` (FK→`users.id`) | INTEGER | Usuario verificador |

### `publication_stats`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `publication_id` (PK/FK→`publications.id`) | INTEGER | Publicación asociada |
| `views` | INTEGER | Cantidad de vistas |
| `likes` | INTEGER | Reacciones positivas |
| `messages_count` | INTEGER | Mensajes recibidos |
| `swaps_completed` | INTEGER | Intercambios concretados |
| `updated_at` | TIMESTAMPTZ | Última actualización |

### `publication_images`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador |
| `publication_id` (FK→`publications.id`) | INTEGER | Publicación asociada |
| `url` | TEXT | Ruta a la imagen |
| `is_primary` | BOOLEAN | Marca la imagen principal |
| `metadata` | JSONB | Información adicional |
| `created_at` | TIMESTAMPTZ | Fecha de carga |

### `conversations`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador |
| `publication_id` (FK→`publications.id`, opcional) | INTEGER | Publicación sobre la que se conversa |
| `created_at` | TIMESTAMPTZ | Fecha de inicio |
| `status` | ENUM('open','closed','archived') | Estado de la conversación |
| `last_message_at` | TIMESTAMPTZ | Último mensaje |

### `messages`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador |
| `conversation_id` (FK→`conversations.id`) | INTEGER | Conversación asociada |
| `sender_id` (FK→`users.id`) | INTEGER | Usuario remitente |
| `recipient_id` (FK→`users.id`) | INTEGER | Usuario destinatario |
| `content` | TEXT | Mensaje enviado |
| `created_at` | TIMESTAMPTZ | Fecha de envío |
| `read_at` | TIMESTAMPTZ | Fecha de lectura |

### `book_corners`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador |
| `name` | TEXT | Nombre del Rincón |
| `owner_user_id` (FK→`users.id`) | INTEGER | Propietario |
| `location` | GEOGRAPHY(Point,4326) | Ubicación del Rincón |
| `description` | TEXT | Información adicional |
| `created_at` | TIMESTAMPTZ | Fecha de registro |

### `genres`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador |
| `name` | TEXT | Nombre del género |

### `user_genres`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` (FK→`users.id`) | INTEGER | Usuario |
| `genre_id` (FK→`genres.id`) | INTEGER | Género asociado |

### `book_suggestions`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` (PK) | SERIAL | Identificador |
| `user_id` (FK→`users.id`) | INTEGER | Quien sugiere |
| `title` | TEXT | Título del libro sugerido |
| `authors` | TEXT | Autores |
| `isbn` | TEXT | Código ISBN |
| `status` | ENUM('pending','approved','rejected') | Estado de la sugerencia |
| `created_at` | TIMESTAMPTZ | Fecha de registro |

### Tablas auxiliares futuras
- `notifications`
- `swaps`
- `follows` / `favorites`
- `audit_logs`

## Relaciones principales
- Usuarios ↔ Publicaciones: 1‑N
- Publicaciones ↔ Libros: N‑1
- Publicaciones ↔ Estadísticas: 1‑1
- Publicaciones ↔ Imágenes de publicación: 1‑N
- Publicaciones ↔ Conversaciones: 1‑N (opcional)
- Conversaciones ↔ Mensajes: 1‑N
- Usuarios ↔ Mensajes: N‑N a través de `conversations`
- Libros ↔ Imágenes de libro: 1‑N
- Usuarios ↔ Rincones de libros: 1‑N
- Usuarios ↔ Géneros: N‑N
- Sugerencias ↔ Usuarios: N‑1

## Proyección a futuro
- Escalabilidad geográfica con `ST_ClusterKMeans` y consultas de proximidad
- Migraciones secuenciales para control de versiones
- Tablas de auditoría y consentimientos (RGPD)
- Internacionalización de textos y catálogos
- Búsqueda *full‑text* con índices GIN y `tsvector`
- Tablas de eventos para análisis y métricas
- Sistema de reportes y acciones de moderación
- Sugerencias de libros basadas en cercanía y gustos
