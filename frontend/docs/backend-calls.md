# Llamadas al Backend

Este documento describe los endpoints que el backend de EntreLibros deberá exponer. Cada sección incluye método, ruta, payload de ejemplo y posibles respuestas.

## Autenticación

### `POST /auth/login`

Inicia sesión de un usuario válido.

**Request**

```json
{
  "email": "user@entrelibros.com",
  "password": "correcthorsebatterystaple"
}
```

**Respuesta 200**

```json
{
  "user": {
    "id": "1",
    "email": "user@entrelibros.com",
    "role": "user"
  },
  "message": "auth.success.login"
}
```

La cookie `sessionToken` se envía en la cabecera `Set-Cookie` para mantener la sesión.

**Errores comunes**

- `401 Unauthorized` cuando las credenciales no son válidas:
  ```json
  {
    "error": "InvalidCredentials",
    "message": "auth.errors.invalid_credentials"
  }
  ```

### `POST /auth/logout`

Cierra la sesión activa.

**Request**: requiere la cookie `sessionToken` válida.

**Respuesta 200**

```json
{
  "message": "Successfully logged out",
  "timestamp": "2024-02-20T15:00:00Z"
}
```

El backend debe invalidar la cookie de sesión.

### `GET /auth/me`

Devuelve la información del usuario autenticado.

**Request**: requiere la cookie `sessionToken`.

**Respuesta 200**

```json
{
  "id": "u_1",
  "email": "demo@entrelibros.app",
  "roles": ["user"]
}
```

**Respuesta 401**

```json
{ "error": "Unauthorized" }
```

### `POST /auth/register`

Registra un nuevo usuario.

**Request**

```json
{
  "name": "Jane Doe",
  "email": "new@entrelibros.com",
  "password": "secreta"
}
```

**Respuesta 201**

```json
{
  "user": {
    "id": "2",
    "email": "new@entrelibros.com",
    "role": "user"
  },
  "message": "auth.success.register"
}
```

**Errores comunes**

- `409 Conflict` si el email ya existe:
  ```json
  {
    "error": "EmailExists",
    "message": "auth.errors.email_exists"
  }
  ```

## Formularios y contacto

### `POST /contact/submit`

Envía el formulario de contacto.

**Request**

```json
{
  "name": "María Pérez",
  "email": "maria@example.com",
  "message": "Quisiera más información sobre la plataforma."
}
```

**Respuesta 201**

```json
{
  "message": "contact.success.submitted",
  "contact": {
    "id": 42,
    "name": "María Pérez",
    "email": "maria@example.com",
    "message": "Quisiera más información sobre la plataforma.",
    "createdAt": "2025-11-05T12:34:56.000Z",
    "updatedAt": "2025-11-05T12:34:56.000Z"
  }
}
```

**Errores**

- `400 Bad Request` o `500 Internal Server Error` con claves de i18n en el campo `message` describiendo el problema.

## Libros

### `GET /books`

Obtiene el listado público de libros disponibles.

**Respuesta 200**

```json
[
  {
    "title": "1984",
    "author": "George Orwell",
    "coverUrl": "https://covers.openlibrary.org/b/id/7222246-L.jpg"
  }
]
```

### `GET /books/home`

Obtiene publicaciones públicas para el carrusel de Inicio. Si existe una sesión, ordena primero los libros de lectores que el usuario sigue y después completa con publicaciones públicas recientes de otras personas. No incluye publicaciones propias ni privadas. Acepta `limit` (máximo `5`) y `offset` para renovar el carrusel sin mostrar más de cinco libros a la vez.

**Respuesta 200**

```json
{
  "items": [{ "id": "1", "title": "Matisse en Bélgica" }],
  "page": {
    "limit": 5,
    "offset": 0,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### `GET /books/mine`

Devuelve los libros publicados por el usuario autenticado.

**Respuesta 200**

```json
[
  {
    "id": "1",
    "title": "Matisse en Bélgica",
    "author": "Carlos Argan",
    "coverUrl": "https://covers.openlibrary.org/b/id/9875161-L.jpg",
    "condition": "bueno",
    "status": "available",
    "isForSale": true,
    "price": 15000
  }
]
```

### `GET /user/activity`

Requiere sesión y devuelve la actividad persistida del usuario autenticado.
Incluye publicaciones ofrecidas y publicaciones asociadas a acuerdos completados.

```json
[
  {
    "id": "listing:42",
    "bookTitle": "Dune",
    "action": "offered",
    "coverUrl": "https://example.com/cover.jpg",
    "timestamp": "2026-08-30T10:00:00.000Z"
  }
]
```

### `GET /messages/{conversationId}/books`

Requiere sesión y pertenencia a la conversación. Devuelve por separado las
publicaciones disponibles propias y las publicaciones públicas disponibles de
la contraparte. `PUBLIC_API_USE_MOCKS=true` solo aplica a pruebas o demo explícita.

```json
{
  "myBooks": [
    { "id": "42", "title": "Dune", "author": "Frank Herbert", "coverUrl": "" }
  ],
  "theirBooks": []
}
```

## Comunidad

### `GET /community/stats`

Estadísticas agregadas de la comunidad.

**Respuesta 200**

```json
{
  "kpis": {
    "exchanges": 134,
    "activeHouses": 52,
    "activeUsers": 318,
    "booksPublished": 2140
  },
  "trendExchanges": [65, 80, 55, 90, 70, 40, 85],
  "trendNewBooks": [30, 45, 35, 60, 50, 40, 55]
}
```

### `GET /community/feed`

Listado paginado de actividad de la comunidad.

**Query params**

- `page` (opcional, por defecto `0`)
- `size` (opcional, por defecto `8`)

**Respuesta 200**
Arreglo de elementos que varían según el campo `type` (`book`, `swap`, `sale`, `seeking`, etc.):

```json
[
  {
    "id": "uuid",
    "user": "Ana",
    "avatar": "https://example.com/avatar.png",
    "time": "hace 2h",
    "likes": 5,
    "type": "book",
    "title": "Dune",
    "author": "Frank Herbert",
    "cover": "https://picsum.photos/seed/1/600/400"
  }
]
```

### `POST /community/stories`

Crea una historia de Comunidad con texto, imagen opcional y una publicación propia vigente opcional.

```json
{
  "body": "Recomendación de lectura",
  "imageUrl": "data:image/jpeg;base64,...",
  "bookListingId": "5"
}
```

La respuesta `201` devuelve un elemento `story` compatible con `GET /community/feed`.

### `GET /community/activity`

Última actividad breve de usuarios.

**Respuesta 200**

```json
[{ "id": "uuid", "user": "Lucía", "avatar": "https://example.com/avatar.png" }]
```

### `GET /community/suggestions`

Usuarios sugeridos para seguir.

**Respuesta 200**

```json
[{ "id": "uuid", "user": "Pedro", "avatar": "https://example.com/avatar.png" }]
```

### `GET /user/profile` y `PATCH /user/profile`

Requieren sesión autenticada. `GET` devuelve el perfil propio, incluida la calle privada. `PATCH` acepta `alias`, `description`, `profilePhoto` (URL HTTPS o imagen JPG/PNG/WebP en base64 de hasta 5 MB), `interests`, `country`, `city`, `neighborhood`, `street`, `profileVisibility` y `locationVisibility` (`none`, `country`, `city` o `neighborhood`). La respuesta mantiene los campos privados porque pertenece al usuario autenticado.

### `GET /user/profile/:id`

Devuelve la proyección pública del perfil cuando es público. La ubicación respeta `locationVisibility`: país, ciudad o barrio se agregan de forma progresiva y las coordenadas se redondean; `street` nunca se incluye.

### `GET /community/discovery`

Requiere sesiÃ³n autenticada. Devuelve historias recientes para la tira superior, lectores relevantes por cercanÃ­a o intereses compartidos y libros publicados que coinciden con los intereses del usuario.

**Respuesta 200**

```json
{
  "stories": [
    {
      "id": "42",
      "storyId": "7",
      "user": "Clara",
      "avatar": "/logo.svg",
      "body": "Una historia",
      "time": "hace 2 h",
      "isFollowing": false
    }
  ],
  "suggestions": [
    {
      "id": "42",
      "user": "Clara",
      "avatar": "/logo.svg",
      "reason": "similar_interests",
      "commonInterests": ["fiction"],
      "isFollowing": false
    }
  ],
  "recommendedBooks": [
    {
      "id": "9",
      "title": "La casa de los espÃ­ritus",
      "author": "Isabel Allende",
      "cover": "https://example.com/cover.jpg",
      "owner": { "id": "42", "user": "Clara" },
      "commonInterests": ["fiction"],
      "isFollowing": false
    }
  ]
}
```

### `POST /community/follows/:id` y `DELETE /community/follows/:id`

Requieren sesiÃ³n autenticada. Crean o eliminan el seguimiento de otro perfil pÃºblico. Ambas respuestas incluyen `{ "following": boolean, "userId": string }`; seguir dos veces es idempotente.
