# Checklist de navegador del MVP

Fecha de ejecucion: 2026-09-03.

Esta checklist usa API real (`PUBLIC_API_USE_MOCKS=false`) y el dataset sintetico
de [`backend/scripts/seed-demo-dataset.sql`](../backend/scripts/seed-demo-dataset.sql).
Las cuentas de demo no contienen datos personales reales y no deben usarse fuera
de una base local aislada.

## Entorno

- Backend: `http://localhost:4000`, PostgreSQL/PostGIS migrado y Socket.IO activo.
- Frontend: `http://localhost:3000`, `PUBLIC_API_BASE_URL` apuntando a `/api` real.
- Dataset: dos usuarios, dos publicaciones, un Rincon, una conversacion, un
  acuerdo, notificaciones, eventos y un resultado.
- Comprobacion de modo: `document.documentElement.dataset.apiMode` debe ser `real`.

## Resultado observado

| Recorrido | Resultado | Evidencia observable |
| --- | --- | --- |
| Comunidad real | OK | Feed con Alma/Bruno y sugerencias enlazadas a `/profile/:id`. |
| Perfil publico | OK | Alias, ciudad e intereses visibles; no aparecen correo ni coordenadas. |
| Reporte | OK parcial | El formulario abre con categoria conducta y motivo; el envio queda pendiente de una sesion autenticada propietaria. |
| Mapa/listado | OK | Rincon sintetico en listado y mapa; detalle con zona, horario, normas y actividad sin calle ni altura. |
| Metricas | OK | Panel con periodo, publicaciones, contactos, acuerdos, confirmaciones y ultima actualizacion. |
| Recarga | OK | Las rutas cargan desde API real despues de navegar y recargar. |
| Mensajeria/acuerdo | Automatizado | Persistencia, autorizacion, concurrencia, outcome y deduplicacion cubiertos por Vitest de backend; falta completar la sesion manual de dos usuarios. |
| Vacio/error | Automatizado | Estados y reintentos cubiertos por pruebas de frontend/backend; falta captura manual archivada. |
| Teclado/contraste/responsive | Pendiente | Requiere revision manual en los viewport definitivos. |
| Socket.IO y contador | Automatizado/parcial | Eventos e invalidacion cubiertos por pruebas; falta evidencia manual del punto rojo. |

## Pasos para repetir

1. Ejecutar migraciones sobre una base aislada.
2. Ejecutar `psql "$DATABASE_URL" -f backend/scripts/seed-demo-dataset.sql`.
3. Arrancar backend y frontend con `PUBLIC_API_USE_MOCKS=false`.
4. Abrir `/community`, seguir el enlace a un perfil, abrir `/map` y seleccionar
   el Rincon desde listado y pin.
5. Abrir `/stats`, cambiar entre 7, 30 y 90 dias y comprobar la fecha de
   actualizacion.
6. Con dos sesiones autenticadas, iniciar contacto desde publicacion y perfil,
   enviar la plantilla, recargar, proponer/confirmar un acuerdo y registrar ambos
   resultados. No copiar correo, direccion, tokens ni coordenadas en capturas.
7. Repetir en viewport desktop y responsive, con teclado y en ambos idiomas.

## Politica de evidencia

Las capturas finales deben tener fecha, entorno y ruta visibles, usar solamente el
dataset sintetico y ocultar tokens, cookies, correos, direcciones y coordenadas.
El repositorio no incluye capturas binarias en este corte; por eso la matriz deja
7.6 abierta hasta archivar las imagenes de entrega y enlazarlas aqui.
