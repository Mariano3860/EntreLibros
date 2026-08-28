# Base de datos

PostgreSQL es la persistencia principal; PostGIS se usa para datos geográficos cuando el entorno lo habilita. El esquema se crea en orden mediante `backend/migrations/`.

## Migraciones vigentes

| Migración | Responsabilidad |
| --- | --- |
| 001 | Esquema inicial de libros |
| 002 | Usuarios |
| 003 | Idioma de usuario |
| 004 | Ubicación/PostGIS de usuarios |
| 005 | Campos adicionales de libros |
| 006 | Publicaciones/listings |
| 007 | Rincones comunitarios |
| 008 | Mensajes de contacto |
| 009 | Estados de publicación |
| 010 | Conversaciones y mensajes |
| 011 | Acuerdos |
| 012 | Reservas asociadas a acuerdos/listings |
| 013 | Corrección del índice de reservas |
| 014 | Bloqueos entre usuarios |
| 015 | Usuario y semilla del bot de mensajería |

El contenido exacto de cada migración es la autoridad. No edites una migración ya aplicada: agrega otra numerada y prueba upgrade desde una base existente.

## Mensajería y bot

La tabla de conversaciones relaciona participantes; los mensajes conservan contenido, autor, secuencia y, cuando corresponde, `client_key` para deduplicar reintentos. `015` crea el usuario bot con email técnico `bot@entrelibros.local` y rol bot. El backend crea de forma idempotente la conversación del bot para cada usuario al listar conversaciones o al usar el flujo correspondiente.

La persistencia se realiza antes de emitir el evento en tiempo real. Por eso la carga inicial de `GET /api/messages` y la apertura de la conversación del bot pueden reconstruir el historial aunque el navegador haya perdido una conexión.

## Operación segura

```bash
npm run migrate
```

Ejecuta migraciones con el backend apuntando a la base correcta. No compartas dumps con datos personales, no uses credenciales en documentación y verifica el estado antes de aplicar cambios en entornos compartidos.
