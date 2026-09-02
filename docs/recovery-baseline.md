# Recuperación y validación del entorno

Esta guía reúne el procedimiento actual para comprobar que EntreLibros arranca, conserva datos y funciona en navegador real. Las pruebas automatizadas no sustituyen la revisión de cookies, proxy, caché, permisos de ubicación ni Socket.IO.

## Puesta en marcha

1. Instala Node `>=22.19.0 <23`, npm y PostgreSQL/PostGIS.
2. Configura las variables del backend en un archivo `.env` local.
3. Ejecuta las migraciones sobre una base aislada:

   ```bash
   npm run migrate
   ```

4. Levanta backend y frontend:

   ```bash
   npm run dev
   ```

5. Usa `PUBLIC_API_USE_MOCKS=false` u omite la variable para validar persistencia real.

## Checklist de navegador

- La aplicación abre en `http://localhost:3000` y las peticiones `/api` llegan al backend.
- El inicio de sesión conserva la cookie y las rutas protegidas rechazan una sesión ausente.
- El modo real aparece como `real` en `document.documentElement.dataset.apiMode`.
- Crear o editar un Rincón y publicar un libro produce respuestas correctas y los datos sobreviven a una recarga.
- El mapa respeta permisos, radio y ubicación aproximada.
- Mensajes, adjuntos y acuerdos se guardan, se reciben por Socket.IO y se reconstruyen al recargar.
- El punto rojo y el contador de Mensajes aumentan con un mensaje entrante y desaparecen al leerlo.
- Los estados de carga, vacío y error son distinguibles y ofrecen reintento cuando corresponde.

## Comprobacion manual de edicion de Rincones

- Crea o usa un Rincon aprobado con una cuenta propietaria y abre `/map` con `PUBLIC_API_USE_MOCKS=false`.
- Selecciona el Rincon y pulsa `Ver rincon`. Debe aparecer el panel a la derecha del mapa con foto, nombre, anfitrion, zona aproximada, horario, normas, actividad y estado.
- Como propietario, comprueba `Editar rincon`, cambia nombre, normas, horario o visibilidad, guarda y recarga. Los cambios deben persistir.
- Desde el mismo panel pausa y reactiva el Rincon. El estado debe cambiar y la accion debe conservarse despues de recargar.
- Como otra cuenta o invitado, comprueba que el detalle sigue siendo visible pero no aparecen los controles de propietario.
- En todos los casos confirma que nunca aparecen calle, altura, contacto interno ni coordenadas exactas.

## Calidad y recuperación

Antes de revisar una entrega ejecuta:

```bash
npm run test:backend
npm run test:frontend
npm run typecheck -w backend
npm run typecheck -w frontend
npm run build -w backend
npm run build -w frontend
```

Para una base compartida, realiza un backup verificable antes de migrar y conserva su ubicación fuera del repositorio. Comprueba la restauración sobre una base aislada, valida tablas, migraciones y PostGIS, y registra fecha, entorno y resultado. Nunca edites una migración aplicada; crea una migración acumulativa para corregir el esquema.

Si una migración falla, detén el proceso, conserva el error, restaura la copia aislada o aplica una corrección numerada después de entender la causa. No borres datos para hacer pasar una prueba.

## Datos de prueba

Usa cuentas y publicaciones sintéticas. No copies usuarios reales, correos, direcciones, tokens ni dumps al repositorio o a capturas. La semilla del bot se crea con `015_seed_messaging_bot.sql`; el modo demo con MSW no reemplaza esta verificación.
