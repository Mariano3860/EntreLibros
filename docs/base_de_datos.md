# Base de datos

PostgreSQL es la persistencia principal y PostGIS se utiliza para consultas
geograficas. Las migraciones de `backend/migrations/` se ejecutan en orden y son
acumulativas: nunca se edita una migracion aplicada; una correccion se agrega en
un archivo numerado nuevo.

## Migraciones vigentes

| Migracion | Responsabilidad                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------- |
| 001-006   | Esquema inicial, usuarios, idioma, ubicacion y publicaciones.                                           |
| 007-009   | Rincones, mensajes de contacto y estados de publicacion.                                                |
| 010-013   | Conversaciones, acuerdos, reservas e indices.                                                           |
| 014-018   | Bloqueos, bot, privacidad, vencimientos y propietario de Rincon.                                        |
| 019-020   | Notificaciones, intereses y ubicacion estructurada.                                                     |
| 021-025   | Historias, seguimiento, demo y reparacion de conversaciones.                                            |
| 026-030   | Foto y privacidad de perfil, likes, comentarios, consentimientos y revision editorial.                  |
| 031       | Resultados privados por participante para acuerdos.                                                     |
| 032       | Reportes autenticados con categoria, estado, canal y plazo.                                             |
| 033       | Eventos append-only para funnel y metricas.                                                             |
| 034       | Compatibilidad de reportes y creacion segura de tablas nuevas.                                          |
| 035       | Borradores privados por autor y conversacion, con revision, adjuntos tipados e indice de actualizacion. |

El SQL de cada archivo es la autoridad sobre el esquema real. Antes de migrar una
base compartida, realiza una copia verificable y prueba la actualizacion sobre una
base aislada.

## Entidades principales

- Usuarios: credenciales hash, perfil, idioma, intereses, zona y preferencias.
- Publicaciones: libro, metadata bibliografica, condicion, modalidad,
  disponibilidad, consentimientos, imagenes y revision editorial.
- Rincones: propietario, datos comunitarios, ubicacion protegida, visibilidad,
  consentimiento, actividad y revision editorial.
- Mensajeria: participantes, mensajes secuenciales, cursor, idempotencia,
  adjuntos tipados y borradores privados por autor/conversacion.
- Acuerdos: estado, versiones, participantes, publicaciones, datos protegidos del
  encuentro y outcomes privados por participante.
- Comunidad: historias, seguimiento, likes y comentarios.
- Notificaciones: destinatario, tipo, evento, datos minimos, lectura y preferencias.
- Reportes: denunciante interno, objetivo, motivo, estado, canal, plazo e idempotencia.
- Analitica: evento, actor opcional, entidad, metadata minima, fecha y clave unica.

## Mensajeria y bot

La migracion `015_seed_messaging_bot.sql` crea el usuario bot. El backend obtiene
una conversacion por usuario de forma idempotente y persiste las respuestas antes
de emitirlas por Socket.IO. Los adjuntos `book`, `swap` y `agreement` se validan
contra la conversacion, las publicaciones y sus propietarios.

`message_drafts` mantiene como maximo un borrador activo por autor y
conversacion. Su `revision` evita sobrescribir cambios obsoletos y su adjunto
JSONB acepta libros, intercambios y propuestas de acuerdo; el envio vuelve a
validar la disponibilidad y elimina el borrador en la misma transaccion del
mensaje. No existe una migracion de rollback automatica: probar restauracion y
reversion sobre una copia aislada antes de operar sobre una base compartida.

## Operacion

```bash
npm run migrate
```

Para el recorrido reproducible, carga solamente en una base aislada:

```bash
psql "$DATABASE_URL" -f backend/scripts/seed-demo-dataset.sql
```

No compartas dumps con datos personales ni credenciales en documentacion o tickets.
