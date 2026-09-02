# Solución de problemas

## La aplicación no conecta

1. Comprueba que el backend escucha en `http://localhost:4000` y el frontend en `http://localhost:3000`.
2. Revisa que Rsbuild proxifique `/api` y `/socket.io` al backend.
3. Si cambiaste `.env` o `.env.local`, reinicia el frontend.
4. Comprueba que `document.documentElement.dataset.apiMode` sea `real` o `mock` según corresponda.

## `/messages` está vacío

1. Confirma sesión y cookie en el navegador.
2. Revisa `GET /api/messages` en Network.
3. Ejecuta `npm run migrate` si el backend devuelve un error de esquema.
4. En modo real, confirma que la migración `015_seed_messaging_bot.sql` se aplicó.
5. En modo demo, recuerda que los mensajes no persisten después de recargar.

## El mensaje no aparece después de recargar

Comprueba que se emitió `conversation:message`, que el backend no registró un error SQL y que el usuario pertenece a la conversación. El mensaje debe persistirse antes de emitirse por Socket.IO.

## El punto rojo no se actualiza

Revisa el `unreadCount` de `GET /api/messages`, el listado de notificaciones y los eventos Socket.IO. Abrir la conversación debe avanzar el cursor de lectura y marcar los avisos relacionados como leídos.

## El mapa no centra o filtra bien

Comprueba el permiso de geolocalización, la zona del perfil, el radio seleccionado y la respuesta de la API. Sin permiso, la aplicación debe mostrar el fallback sin inventar una ubicación exacta.

## Las migraciones fallan

Detén el proceso, revisa la conexión y el hash de migraciones aplicadas. No edites archivos ya aplicados; crea una migración nueva y prueba sobre una base aislada. Consulta [`recovery-baseline.md`](recovery-baseline.md).
