# Matriz de experiencia pública y autenticación

Última verificación: 2026-09-05.

Esta matriz resume el comportamiento implementado en `frontend/src/routes`,
`AuthContext`, `BaseLayout`, `Sidebar` y las páginas de descubrimiento. Las
rutas públicas permiten lectura; las acciones de escritura o contacto pasan
por `useAuthRequired`.

| Superficie | Visitante | Fuente de lectura | Acciones que requieren autenticación |
| --- | --- | --- | --- |
| `/`, `/home` | Pública | Home público, recomendaciones y actividad comunitaria | Contactar, guardar/favorito y acciones sociales |
| `/books`, `/books/trade`, `/books/sale` | Pública | `fetchBooks` con filtros públicos; incluye detalle bibliográfico, dueño, precio, estado e intención | Publicar, buscar un libro, contactar, guardar/favorito y proponer intercambio |
| `/books/seeking` | No se expone como pestaña visitante; acceso directo vuelve a `/books` | `fetchBooks({ type: "want" })` solamente para la pestaña autenticada | Toda la pestaña pertenece al contexto de la cuenta autenticada |
| `/books/mine`, `/books/new` | Privada | `fetchUserBooks` y flujo de publicación | La ruta completa requiere sesión |
| `/community` | Lectura pública de feed, comentarios, perfiles, rincones y libros | `fetchCommunityFeed` y consultas públicas relacionadas | Publicar, comentar, reaccionar, seguir, mensajear y proponer intercambio |
| `/map` | Consulta pública del mapa, rincones y detalles | Consulta pública de rincones/publicaciones y detalle seleccionado | Crear o editar rincón, publicar, contactar y participar de intercambios |
| `/profile/:id` | Perfil público de otra persona | `fetchPublicProfile` sin payload privado | Contactar, reportar y acciones sociales |
| `/messages`, `/stats`, `/profile` | Privada | Consultas del usuario autenticado | La ruta completa requiere sesión |
| `/login`, `/register`, `/contact` | Pública | Formularios y contenido de ayuda/contacto | No aplica |

## Regla específica del catálogo

Una publicación `want` sigue perteneciendo a una persona: `book_listings.user_id`
es obligatorio y referencia a `users(id)`. La cuenta propietaria puede exponer
esa intención dentro del catálogo autenticado, pero un visitante no recibe una
vista agregada de “Buscando”, tarjetas `want` dentro de Todos ni el filtro
`want`. Esto separa la lectura de libros públicos de las pestañas que
representan el contexto de una cuenta.

## Verificaciones

- La suite de `BooksPage` comprueba las tres pestañas públicas y la
  normalización de `/books/seeking`.
- `AuthRequiredContext` comprueba foco inicial, ciclo de Tab, Escape, retorno de
  foco y retorno seguro a login/registro.
- La suite frontend completa y la verificación visual manual cubren las
  regresiones de las superficies públicas.
