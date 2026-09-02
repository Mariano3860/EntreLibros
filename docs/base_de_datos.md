# Base de datos

La migracion 027 agrega likes unicos por usuario para listings e historias, comentarios con un unico destino y orden estable, y borrado en cascada al eliminar la publicacion asociada.

PostgreSQL es la persistencia principal; PostGIS se usa para datos geográficos cuando el entorno lo habilita. El esquema se crea en orden mediante `backend/migrations/`.

## Migraciones vigentes

| Migración | Responsabilidad                              |
| --------- | -------------------------------------------- |
| 001       | Esquema inicial de libros                    |
| 002       | Usuarios                                     |
| 003       | Idioma de usuario                            |
| 004       | Ubicación/PostGIS de usuarios                |
| 005       | Campos adicionales de libros                 |
| 006       | Publicaciones/listings                       |
| 007       | Rincones comunitarios                        |
| 008       | Mensajes de contacto                         |
| 009       | Estados de publicación                       |
| 010       | Conversaciones y mensajes                    |
| 011       | Acuerdos                                     |
| 012       | Reservas asociadas a acuerdos/listings       |
| 013       | Corrección del índice de reservas            |
| 014       | Bloqueos entre usuarios                      |
| 015       | Usuario y semilla del bot de mensajería      |
| 016       | Privacidad de perfil                         |
| 017       | Vencimiento de publicaciones                 |
| 018       | Propietario de Rincón comunitario            |
| 019       | Notificaciones                               |
| 020       | Intereses y ubicación de perfil              |
| 021       | Historias de Comunidad                       |
| 022       | Seguimiento y datos demo de Comunidad        |
| 023       | Intereses persistentes y búsquedas de libros |
| 024       | Conversaciones demo para intercambios        |
| 025       | Corrección de duplicados demo de mensajería  |
| 026       | Foto y ubicación estructurada de perfil      |

La migraciÃ³n `022_create_community_following_and_demo_data.sql` crea `user_follows` y carga una semilla reproducible de lectores pÃºblicos con intereses, ubicaciÃ³n, libros disponibles e historias para validar el descubrimiento. Los perfiles privados o bloqueados quedan fuera de las sugerencias.

La migración `023_create_book_discovery_interests.sql` agrega intereses idempotentes sobre publicaciones ajenas y evita duplicar búsquedas activas del mismo libro por usuario.
La migración `026_add_profile_photo_and_location_details.sql` agrega foto, país y calle privada al perfil, y sustituye la visibilidad histórica `private` por los niveles `none`, `country`, `city` y `neighborhood`.
La migración `024_seed_messaging_exchange_conversations.sql` crea conversaciones entre `user2@entrelibros.com` y los lectores demo que tienen publicaciones públicas vigentes, para validar el selector de libros del interlocutor al proponer un intercambio. La migración `025_repair_messaging_exchange_seed.sql` conserva la conversación demo más antigua por pareja y elimina únicamente duplicados vacíos de la semilla.
El contenido exacto de cada migración es la autoridad. No edites una migración ya aplicada: agrega otra numerada y prueba upgrade desde una base existente.

La migración `021_create_community_stories.sql` agrega historias sociales con texto, imagen opcional y referencia opcional a una publicación propia vigente. Los adjuntos de mensajería reutilizan el JSONB existente de `messages.attachment_metadata`: las variantes `book`, `swap` y `agreement` se validan en la capa de aplicación y no requieren una tabla adicional.

## Mensajería y bot

La tabla de conversaciones relaciona participantes; los mensajes conservan contenido, autor, secuencia y, cuando corresponde, `client_key` para deduplicar reintentos. `015` crea el usuario bot con email técnico `bot@entrelibros.local` y rol bot. El backend crea de forma idempotente la conversación del bot para cada usuario al listar conversaciones o al usar el flujo correspondiente.

La persistencia se realiza antes de emitir el evento en tiempo real. Por eso la carga inicial de `GET /api/messages` y la apertura de la conversación del bot pueden reconstruir el historial aunque el navegador haya perdido una conexión.

## Operación segura

```bash
npm run migrate
```

Ejecuta migraciones con el backend apuntando a la base correcta. No compartas dumps con datos personales, no uses credenciales en documentación y verifica el estado antes de aplicar cambios en entornos compartidos.
