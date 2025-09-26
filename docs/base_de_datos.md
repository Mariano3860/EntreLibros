# Esquema de base de datos

## Diagrama de clases (Mermaid)

> El diagrama representa el **modelo físico**: cada “clase” es una **tabla real** y cada atributo es una **columna real**. Incluye cardinalidades, composiciones y tablas puente para M:N.

```mermaid
classDiagram
%% =========================
%% PHYSICAL MODEL (TABLE = CLASS)
%% =========================

class users {
  +id: serial PK
  +name: text
  +email: text (unique)
  +password_hash: text
  +role: text
  +language: text
  +bio: text
  +location: geography(Point,4326)
  +search_radius: integer
  +created_at: timestamptz
  +updated_at: timestamptz
}

class books {
  +id: serial PK
  +title: text
  +isbn: text
  +authors: text
  +publisher: text
  +published_year: integer
  +description: text
  +verified: boolean
  +created_at: timestamptz
}

class book_images {
  +id: serial PK
  +book_id: integer FK -> books.id
  +url: text
  +is_primary: boolean
  +metadata: jsonb
  +created_at: timestamptz
}

class publications {
  +id: serial PK
  +user_id: integer FK -> users.id
  +book_id: integer FK -> books.id
  +status: enum{draft,pending,verified,rejected}
  +type: enum{offer,request,exchange}
  +description: text
  +condition: text
  +location: geography(Point,4326)
  +created_at: timestamptz
  +updated_at: timestamptz
  +verified_at: timestamptz
  +verified_by: integer FK -> users.id
}

class publication_stats {
  +publication_id: integer PK/FK -> publications.id
  +views: integer
  +likes: integer
  +messages_count: integer
  +swaps_completed: integer
  +updated_at: timestamptz
}

class publication_images {
  +id: serial PK
  +publication_id: integer FK -> publications.id
  +url: text
  +is_primary: boolean
  +metadata: jsonb
  +created_at: timestamptz
}

class conversations {
  +id: serial PK
  +publication_id: integer FK -> publications.id (nullable)
  +created_at: timestamptz
  +status: enum{open,closed,archived}
  +last_message_at: timestamptz
}

class messages {
  +id: serial PK
  +conversation_id: integer FK -> conversations.id
  +sender_id: integer FK -> users.id
  +recipient_id: integer FK -> users.id
  +content: text
  +created_at: timestamptz
  +read_at: timestamptz
}

class book_corners {
  +id: serial PK
  +name: text
  +owner_user_id: integer FK -> users.id
  +location: geography(Point,4326)
  +description: text
  +created_at: timestamptz
}

class genres {
  +id: serial PK
  +name: text
}

class user_genres {
  +user_id: integer FK -> users.id
  +genre_id: integer FK -> genres.id
}

class book_suggestions {
  +id: serial PK
  +user_id: integer FK -> users.id
  +title: text
  +authors: text
  +isbn: text
  +status: enum{pending,approved,rejected}
  +created_at: timestamptz
}

%% =========================
%% RELATIONSHIPS (CARDINALITIES)
%% =========================

users "1" --> "0..*" publications : creates
publications "*" --> "1" books : refers_to

publications "1" *-- "1" publication_stats : has_stats

books "1" *-- "0..*" book_images : has_covers
publications "1" *-- "0..*" publication_images : has_photos

users "1" --> "0..*" book_corners : owns

publications "0..1" --> "0..*" conversations : discussed_in
conversations "1" *-- "0..*" messages : contains
messages "*" --> "1" users : sender
messages "*" --> "1" users : recipient

users "1" --> "0..*" user_genres : prefers
genres "1" --> "0..*" user_genres : tag

users "1" --> "0..*" book_suggestions : suggests

%% =========================
%% ENUMS (dependency «use» for type coupling)
%% =========================
class publication_status <<enumeration>> {
  draft
  pending
  verified
  rejected
}
class publication_type <<enumeration>> {
  offer
  request
  exchange
}
class conversation_status <<enumeration>> {
  open
  closed
  archived
}
class book_suggestion_status <<enumeration>> {
  pending
  approved
  rejected
}

publications ..> publication_status : «use»
publications ..> publication_type : «use»
conversations ..> conversation_status : «use»
book_suggestions ..> book_suggestion_status : «use»
```

---

## Tablas principales

### `users`

| Campo           | Tipo                  | Descripción                                |
| --------------- | --------------------- | ------------------------------------------ |
| `id` (PK)       | SERIAL                | Identificador del usuario                  |
| `name`          | TEXT                  | Nombre público                             |
| `email`         | TEXT UNIQUE           | Correo de autenticación                    |
| `password_hash` | TEXT                  | Hash de la contraseña                      |
| `role`          | TEXT                  | Perfil del usuario (`user`, `admin`, etc.) |
| `language`      | TEXT                  | Idioma preferido                           |
| `bio`           | TEXT                  | Información de perfil                      |
| `location`      | GEOGRAPHY(Point,4326) | Coordenadas del usuario                    |
| `search_radius` | INTEGER               | Radio de búsqueda en metros                |
| `created_at`    | TIMESTAMPTZ           | Fecha de creación                          |
| `updated_at`    | TIMESTAMPTZ           | Última actualización                       |

### `books`

| Campo            | Tipo        | Descripción                     |
| ---------------- | ----------- | ------------------------------- |
| `id` (PK)        | SERIAL      | Identificador interno           |
| `title`          | TEXT        | Título del libro                |
| `isbn`           | TEXT        | Código ISBN                     |
| `authors`        | TEXT        | Autores principales             |
| `publisher`      | TEXT        | Editorial                       |
| `published_year` | INTEGER     | Año de publicación              |
| `description`    | TEXT        | Descripción o sinopsis          |
| `verified`       | BOOLEAN     | Indica si la ficha fue validada |
| `created_at`     | TIMESTAMPTZ | Fecha de registro               |

### `book_images`

| Campo                     | Tipo        | Descripción               |
| ------------------------- | ----------- | ------------------------- |
| `id` (PK)                 | SERIAL      | Identificador             |
| `book_id` (FK→`books.id`) | INTEGER     | Libro asociado            |
| `url`                     | TEXT        | Ruta a la imagen          |
| `is_primary`              | BOOLEAN     | Marca la imagen principal |
| `metadata`                | JSONB       | Información adicional     |
| `created_at`              | TIMESTAMPTZ | Fecha de carga            |

### `publications`

| Campo                         | Tipo                                          | Descripción                        |
| ----------------------------- | --------------------------------------------- | ---------------------------------- |
| `id` (PK)                     | SERIAL                                        | Identificador                      |
| `user_id` (FK→`users.id`)     | INTEGER                                       | Autor de la publicación            |
| `book_id` (FK→`books.id`)     | INTEGER                                       | Libro referenciado                 |
| `status`                      | ENUM('draft','pending','verified','rejected') | Estado de la publicación           |
| `type`                        | ENUM('offer','request','exchange')            | Tipo de interacción                |
| `description`                 | TEXT                                          | Detalle del ejemplar               |
| `condition`                   | TEXT                                          | Estado físico del libro ofrecido   |
| `location`                    | GEOGRAPHY(Point,4326)                         | Ubicación opcional del intercambio |
| `created_at`                  | TIMESTAMPTZ                                   | Fecha de creación                  |
| `updated_at`                  | TIMESTAMPTZ                                   | Última actualización               |
| `verified_at`                 | TIMESTAMPTZ                                   | Fecha de verificación (moderación) |
| `verified_by` (FK→`users.id`) | INTEGER                                       | Usuario verificador (moderador)    |

### `publication_stats`

| Campo                                      | Tipo        | Descripción              |
| ------------------------------------------ | ----------- | ------------------------ |
| `publication_id` (PK/FK→`publications.id`) | INTEGER     | Publicación asociada     |
| `views`                                    | INTEGER     | Cantidad de vistas       |
| `likes`                                    | INTEGER     | Reacciones positivas     |
| `messages_count`                           | INTEGER     | Mensajes recibidos       |
| `swaps_completed`                          | INTEGER     | Intercambios concretados |
| `updated_at`                               | TIMESTAMPTZ | Última actualización     |

### `publication_images`

| Campo                                   | Tipo        | Descripción               |
| --------------------------------------- | ----------- | ------------------------- |
| `id` (PK)                               | SERIAL      | Identificador             |
| `publication_id` (FK→`publications.id`) | INTEGER     | Publicación asociada      |
| `url`                                   | TEXT        | Ruta a la imagen          |
| `is_primary`                            | BOOLEAN     | Marca la imagen principal |
| `metadata`                              | JSONB       | Información adicional     |
| `created_at`                            | TIMESTAMPTZ | Fecha de carga            |

### `conversations`

| Campo                                                 | Tipo                             | Descripción                          |
| ----------------------------------------------------- | -------------------------------- | ------------------------------------ |
| `id` (PK)                                             | SERIAL                           | Identificador                        |
| `publication_id` (FK→`publications.id`, **opcional**) | INTEGER                          | Publicación sobre la que se conversa |
| `created_at`                                          | TIMESTAMPTZ                      | Fecha de inicio                      |
| `status`                                              | ENUM('open','closed','archived') | Estado de la conversación            |
| `last_message_at`                                     | TIMESTAMPTZ                      | Fecha/hora del último mensaje        |

### `messages`

| Campo                                     | Tipo        | Descripción           |
| ----------------------------------------- | ----------- | --------------------- |
| `id` (PK)                                 | SERIAL      | Identificador         |
| `conversation_id` (FK→`conversations.id`) | INTEGER     | Conversación asociada |
| `sender_id` (FK→`users.id`)               | INTEGER     | Usuario remitente     |
| `recipient_id` (FK→`users.id`)            | INTEGER     | Usuario destinatario  |
| `content`                                 | TEXT        | Contenido del mensaje |
| `created_at`                              | TIMESTAMPTZ | Fecha de envío        |
| `read_at`                                 | TIMESTAMPTZ | Fecha de lectura      |

### `book_corners`

| Campo                           | Tipo                  | Descripción                     |
| ------------------------------- | --------------------- | ------------------------------- |
| `id` (PK)                       | SERIAL                | Identificador                   |
| `name`                          | TEXT                  | Nombre del Rincón               |
| `owner_user_id` (FK→`users.id`) | INTEGER               | Propietario (usuario)           |
| `location`                      | GEOGRAPHY(Point,4326) | Ubicación geográfica del Rincón |
| `description`                   | TEXT                  | Reglas/información adicional    |
| `created_at`                    | TIMESTAMPTZ           | Fecha de registro               |

### `genres`

| Campo     | Tipo   | Descripción       |
| --------- | ------ | ----------------- |
| `id` (PK) | SERIAL | Identificador     |
| `name`    | TEXT   | Nombre del género |

### `user_genres`

| Campo                       | Tipo    | Descripción      |
| --------------------------- | ------- | ---------------- |
| `user_id` (FK→`users.id`)   | INTEGER | Usuario          |
| `genre_id` (FK→`genres.id`) | INTEGER | Género preferido |

### `book_suggestions`

| Campo                     | Tipo                                  | Descripción             |
| ------------------------- | ------------------------------------- | ----------------------- |
| `id` (PK)                 | SERIAL                                | Identificador           |
| `user_id` (FK→`users.id`) | INTEGER                               | Usuario que sugiere     |
| `title`                   | TEXT                                  | Título sugerido         |
| `authors`                 | TEXT                                  | Autores sugeridos       |
| `isbn`                    | TEXT                                  | ISBN sugerido           |
| `status`                  | ENUM('pending','approved','rejected') | Estado de la sugerencia |
| `created_at`              | TIMESTAMPTZ                           | Fecha de registro       |

---

## Relaciones principales (resumen)

* **users 1–N publications**: un usuario crea muchas publicaciones; cada publicación tiene un solo autor.
* **publications N–1 books**: una publicación referencia un libro del catálogo; un libro puede estar en muchas publicaciones.
* **publications 1–1 publication_stats**: cada publicación posee su registro de estadísticas (misma PK).
* **books 1–N book_images** y **publications 1–N publication_images**: composición; las imágenes dependen de su padre.
* **users 1–N book_corners**: un usuario registra varios *book_corners*.
* **publications 0..1–N conversations**: una conversación puede estar asociada a una publicación (opcional).
* **conversations 1–N messages**: una conversación contiene muchos mensajes.
* **messages → users**: cada mensaje tiene `sender_id` y `recipient_id`.
* **users M–N genres**: se resuelve con **user_genres**.
* **users 1–N book_suggestions**: un usuario puede registrar muchas sugerencias.

---

## Explicación del modelo de datos

### Entidades principales y propósito

* **users**: personas usuarias, datos de autenticación/perfil y ubicación aproximada (granularidad barrio/ciudad por diseño).
* **books**: catálogo normalizado de obras (evita duplicidad entre publicaciones).
* **publications**: anuncios de “ofrezco/busco/intercambio” de un libro; guarda estado, tipo, descripción, condición y ubicación opcional del encuentro.
* **publication_stats**: métricas mínimas ligadas 1:1 a la publicación (misma clave).
* **book_images / publication_images**: imágenes de portadas y de ejemplares reales, respectivamente (composición).
* **conversations / messages**: mensajería 1:1 organizada por conversación; `publication_id` en `conversations` es **opcional** para soportar chats generales o desde ficha.
* **book_corners**: Rincones de Libros registrados por usuarios (puntos físicos con `geography(Point,4326)`).
* **genres / user_genres**: taxonomía y preferencias (M:N mediante tabla puente).
* **book_suggestions**: sugerencias de títulos (flujo simple de aprobación).

### Relaciones M:N y cómo se resuelven

* **users ↔ genres** → **user_genres** (tabla de unión).
* Mensajería entre usuarios se modela con `conversations` + `messages` (en lugar de una tabla directa user↔user).
* Si en el futuro un **book** necesitara múltiples géneros, se agregaría `book_genres` como tabla puente (hoy cada libro usa un género principal implícito en `books` o se infiere por negocio).

### Simplificaciones de diseño

* **Composición** para imágenes y `publication_stats` (dependen del padre).
* **`conversations.publication_id` nullable** para soportar ambos casos (chat general o sobre una publicación).
* **PostGIS** se representa físicamente como `geography(Point,4326)`; en el diagrama se deja explícito.
* **Enums** se muestran como `enum{...}` y se etiquetan con dependencia «use» para dejar claro el acople de tipo.

---

## Proyección a futuro (alineada al repo)

* **swaps/acuerdos**: cuando se implemente la tabla de acuerdos, se documentará como `swaps` (1–1 con `publications` y 2 participantes).
* **notifications**, **audit_logs**, **follows/favorites**: tablas auxiliares para notificaciones, auditoría y capa social.
* **búsqueda full-text** y **métricas de eventos** (tsvector/GIN; tabla de eventos) para enriquecer discovery y tableros.

---
