# Solución de problemas

## `/messages` vacío o muestra error

1. Comprueba sesión/cookies y que el backend esté escuchando en `4000`.
2. Revisa `GET /api/messages` en Network: un `500` requiere mirar el log del backend y ejecutar `npm run migrate`.
3. Si usas mocks, confirma `document.documentElement.dataset.apiMode === 'mock'`; si es `undefined`, reinicia Rsbuild y revisa la variable `PUBLIC_API_USE_MOCKS`.
4. Si usas modo real, confirma `false` u omisión de la variable, migración `015` aplicada y respuesta JSON válida.

## El bot no aparece

Ejecuta `npm run migrate`, cierra sesión y vuelve a entrar. La identidad persistente depende del usuario bot creado por `015_seed_messaging_bot.sql`; “Conversación 1” indica un fallback o datos anteriores, no la identidad esperada.

## El mensaje no vuelve tras recargar

Confirma que el mensaje se envió por `conversation:message`, que el backend no registró error SQL y que la conversación autorizada es la del usuario actual. El modo mock puede responder visualmente sin escribir en PostgreSQL.

## Cambios de `.env` no tienen efecto

Las variables públicas se incrustan en build/dev. Detén y reinicia Rsbuild, limpia la pestaña/caché si hace falta y vuelve a comprobar `dataset.apiMode`. No uses `PUBLIC_API_USE_MOCKS` como configuración secreta.

## Socket.IO o proxy

En dev, `/api` y `/socket.io` deben llegar al backend `http://localhost:4000`. Un frontend servido directamente desde otro origen necesita proxy/CORS y cookies configurados de forma coherente.
