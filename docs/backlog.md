# Backlog de producto

Ultima actualizacion: 2026-09-04.

El codigo, las migraciones, los contratos y las pruebas son la fuente de verdad.
La matriz completa y sus referencias estan en
[`tfg-mvp-trazabilidad.md`](tfg-mvp-trazabilidad.md).

## Implementado

- Descubrimiento unificado: mapa y listado real comparten consulta, filtros,
  radio, orden, seleccion y estados de carga/vacio/error.
- Contacto desde publicacion y perfil con conversacion reutilizable, bloqueo,
  plantilla traducible y adjunto de libro.
- Acuerdos con versionado, concurrencia, recordatorio in-app y resultado por
  participante sin publicar datos privados.
- Notificaciones contextuales, preferencias in-app, deduplicacion y contador
  persistente de no leidos.
- Reportes autenticados con categorias controladas, estado, canal y plazo.
- Metricas MVP persistentes, contrato de estadisticas, selector de periodo y
  estado sin datos.
- Diseno futuro de recomendaciones separado de las sugerencias actuales.
- Dataset reproducible con dos usuarios, publicaciones, Rincon, conversacion,
  acuerdo, notificaciones, eventos y resultado.
- Migraciones acumulativas 031-034, pruebas automatizadas, typecheck, lint,
  formato, build y contrato OpenAPI actualizado.
- Foto de perfil con recorte cuadrado confirmado, reemplazo repetido, persistencia
  segura y presentación consistente en Perfil y Comunidad.
- Búsqueda global de personas desde Publicaciones con consulta autenticada,
  resultados limitados, exclusiones de privacidad/bloqueo, seguimiento y modal
  responsive con historial local no sensible.
- Atribucion publica del usuario que publico cada libro recomendado y contacto
  reutilizable desde el detalle de Home, manteniendo separado el autor
  bibliografico.

## Prioridad P0

- [x] P0-01 Recorrido real persistente: dataset y checklist real con recarga.
- [x] P0-02 Rincones consistentes: pausa reversible, detalle, privacidad y
  autorizacion.
- [x] P0-03 Publicaciones validas: campos, consentimientos, disponibilidad y
  revision editorial minima.
- [x] P0-04 Privacidad territorial: proyecciones sin calle, altura ni coordenadas
  exactas.
- [x] P0-05 Descubrimiento unificado.
- [x] P0-06 Contacto desde el producto.
- [x] P0-07 Acuerdos cerrables.
- [x] P0-08 Notificaciones accionables.
- [x] P0-09 Reportes minimos.

## Prioridad P1

- [x] P1-01 Metricas minimas.
- [ ] P1-02 Seguridad de despliegue: falta rate limiting de aplicacion y evidencia
  de TLS/infraestructura.
- [ ] P1-03 Retencion, anonimización y revocacion integral; la minimizacion y los
  consentimientos de publicacion ya estan implementados.
- [x] P1-04 Rendimiento del mapa; resultado reproducible en
  [`performance-map.md`](performance-map.md).
- [ ] P1-05 Revision manual completa de accesibilidad, lenguaje, contraste y
  responsive.
- [ ] P1-06 Backup, restauracion, migracion de una base existente y rollback.
- [ ] P1-07 Capturas archivadas y cierre formal de evidencia de entrega.

## Fuera del MVP

Recomendacion automatica, email/push, MFA, recuperacion avanzada, almacenamiento
cloud, moderacion avanzada, reputacion, sanciones complejas, PWA/offline, API
publica e indicadores avanzados.

## Criterio de cierre

El MVP esta funcionalmente listo cuando el recorrido P0 pasa con API real y datos
persistentes. La entrega academica queda cerrada cuando tambien se archivan la
checklist de navegador, las capturas anonimizadas y la prueba de recuperacion.
