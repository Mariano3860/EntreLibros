# Base de datos

PostgreSQL es la persistencia principal y PostGIS se utiliza para las consultas geográficas. Las migraciones de `backend/migrations/` se ejecutan en orden y son acumulativas: nunca se edita una migración aplicada; cualquier corrección debe agregarse en un archivo numerado nuevo.

## Migraciones vigentes

| Migración | Responsabilidad                                                           |
| --------- | ------------------------------------------------------------------------- |
| 001–006   | Esquema inicial, usuarios, idioma, ubicación y publicaciones              |
| 007–009   | Rincones, mensajes de contacto y estados de publicación                   |
| 010–013   | Conversaciones, acuerdos, reservas e índices                              |
| 014–018   | Bloqueos, bot, privacidad de perfil, vencimientos y propietario de Rincón |
| 019–020   | Notificaciones, intereses y ubicación estructurada de perfil              |
| 021–023   | Historias, seguimiento, datos demo e intereses de descubrimiento          |
| 024–025   | Conversaciones demo y reparación de duplicados                            |
| 026       | Foto, país, calle privada y niveles de visibilidad de perfil              |
| 027       | Likes únicos y comentarios de Comunidad                                   |
| 028       | Consentimientos de contenido, imagen y normas para publicaciones          |
| 029       | Estado y motivo de revisión editorial de publicaciones                    |
| 030       | Estado y motivo de revisión editorial de Rincones                         |

El contenido SQL de cada archivo es la autoridad sobre el esquema real. Antes de migrar una base compartida, realiza una copia verificable y prueba la actualización sobre una base aislada.

## Entidades principales

- **Usuarios:** credenciales hash, perfil, idioma, intereses, zona y preferencias de privacidad.
- **Publicaciones:** libro, metadata bibliográfica, condición, modalidad, disponibilidad, consentimientos, imágenes, intereses, vencimiento y revisión editorial (`pending`, `needs_correction`, `approved`, `rejected`).
- **Rincones:** propietario, datos comunitarios, ubicación protegida, visibilidad, consentimiento, fotos, métricas de actividad y revisión editorial.
- **Mensajería:** participantes, mensajes secuenciales, cursor de lectura, clave idempotente y adjuntos tipados.
- **Acuerdos:** estado vigente, versiones, participantes, publicaciones y datos protegidos del encuentro.
- **Comunidad:** historias, seguimiento, likes y comentarios con referencias a listings o historias.
- **Notificaciones:** destinatario, tipo, evento, datos mínimos, estado leído y preferencias in-app.

## Mensajería y bot

La migración `015_seed_messaging_bot.sql` crea el usuario bot. El backend obtiene una conversación por usuario de forma idempotente y persiste las respuestas antes de emitirlas por Socket.IO. Los adjuntos `book`, `swap` y `agreement` se almacenan en `messages.attachment_metadata` y se validan contra la conversación, las publicaciones y sus propietarios.

## Operación

```bash
npm run migrate
```

Ejecuta el comando con el backend apuntando a la base correcta. No compartas dumps con datos personales ni credenciales en documentación o tickets.
