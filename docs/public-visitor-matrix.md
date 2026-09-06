# Matriz de experiencia pública y autenticación

Última verificación: 2026-09-06.

Esta matriz resume el comportamiento implementado en `frontend/src/routes`,
`AuthContext`, `BaseLayout`, `Sidebar` y las páginas de descubrimiento. Las
rutas públicas permiten lectura; las acciones de escritura o contacto pasan
por `useAuthRequired`.

| Superficie                              | Visitante                                                             | Fuente de lectura                                                                                                                                                                                           | Acciones que requieren autenticación                                          |
| --------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `/`, `/home`                            | Pública                                                               | Home público, recomendaciones y actividad comunitaria                                                                                                                                                       | Contactar, guardar/favorito y acciones sociales                               |
| `/books`, `/books/trade`, `/books/sale`, `/books/seeking` | Privada                                                               | `fetchBookRelations` sobre `/api/books/relations`; solo devuelve relaciones activas de la cuenta autenticada: ofertas de intercambio/venta y demandas `want` | La ruta completa requiere sesión; publicar, buscar, contactar y proponer intercambio |
| `/books/mine`                            | Privada; tras autenticarse normaliza a `/books`                       | Ruta de compatibilidad que conserva el acceso histórico sin ser una quinta pestaña                                                                                                                                 | La ruta completa requiere sesión                                              |
| `/books/new`                             | Privada                                                               | Flujo autenticado de publicación                                                                                                                                                                             | La ruta completa requiere sesión                                              |
| `/books/:id`                             | Detalle público de una publicación                                   | `getBookById` y `BookDetailModal`; no convierte el índice personal en catálogo visitante                                                                                                                       | Contactar y acciones sobre la publicación                                     |
| `/community`                            | Lectura pública de feed, comentarios, perfiles, rincones y libros     | `fetchCommunityFeed` y consultas públicas relacionadas                                                                                                                                                      | Publicar, comentar, reaccionar, seguir, mensajear y proponer intercambio      |
| `/map`                                  | Consulta pública del mapa, rincones y detalles                        | Consulta pública de rincones/publicaciones y detalle seleccionado                                                                                                                                           | Crear o editar rincón, publicar, contactar y participar de intercambios       |
| `/profile/:id`                          | Perfil público de otra persona                                        | `fetchPublicProfile` sin payload privado                                                                                                                                                                    | Contactar, reportar y acciones sociales                                       |
| `/messages`, `/stats`, `/profile`       | Privada                                                               | Consultas del usuario autenticado                                                                                                                                                                           | La ruta completa requiere sesión                                              |
| `/login`, `/register`, `/contact`       | Pública                                                               | Formularios y contenido de ayuda/contacto                                                                                                                                                                   | No aplica                                                                     |

## Regla específica del catálogo

Una publicación `want` sigue perteneciendo a una persona: `book_listings.user_id`
es obligatorio y referencia a `users(id)`. `/api/books/relations` acota primero
por esa cuenta y solo considera relaciones activas. `Todos` une ofertas con
intercambio o venta y demandas `want` sin duplicar un listing; un listing con
ambos modos cuenta una vez en `Todos` y aparece en ambas pestañas específicas.
Las superficies públicas usan `/api/books` o el detalle `/api/books/:id` y no
reciben la lista personal ni sus demandas privadas.

## Verificaciones

- La suite de `BooksPage` comprueba las cuatro pestañas personales, la
  normalización de `/books/mine`, filtros, paginación y que un visitante no
  carga relaciones personales.
- La suite de API comprueba autorización, propiedad, estados activos,
  deduplicación y conteos `9/3/2/4`; el detalle público conserva su consulta
  independiente.
- `AuthRequiredContext` comprueba foco inicial, ciclo de Tab, Escape, retorno de
  foco y retorno seguro a login/registro.
- La suite frontend completa y la verificación visual manual cubren las
  regresiones de las superficies públicas.
