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

**Respuesta 200**

```json
{
  "message": "¡Gracias por tu mensaje! Te responderemos lo antes posible."
}
```

**Errores**

- `400 Bad Request` o `500 Internal Server Error` con el campo `message` describiendo el problema.

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
