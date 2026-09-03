# Diseño futuro de recomendaciones

Este documento describe una evolución posterior al MVP. Las sugerencias que hoy aparecen en Comunidad son reglas descriptivas existentes y no un modelo automático.

## Entradas y privacidad

- Intereses declarados, modalidad buscada, disponibilidad, distancia aproximada por barrio/ciudad y actividad agregada.
- Nunca se usarán correo, calle, altura, coordenadas exactas, contenido de mensajes ni motivos de reportes.
- La salida se limitará a publicaciones o perfiles que ya sean visibles para la persona según las mismas reglas de privacidad y bloqueo del descubrimiento.

## Eventos e interfaz propuesta

La futura interfaz consumiría un contrato versionado similar a `GET /api/community/recommendations?limit=10`, con `reason`, `scoreBucket` no numérico y referencias a entidades públicas. Los eventos mínimos serían `recommendation_impression`, `recommendation_open` y `recommendation_contact`, todos deduplicados por usuario, entidad y sesión, con retención agregada.

La implementación debe poder sustituir las reglas por un módulo de ranking sin cambiar las rutas de publicación, perfil o mapa. El servicio no debe escribir recomendaciones dentro de las entidades de negocio.

## Evaluación

Se medirían cobertura, apertura, contacto posterior, acuerdos confirmados y tasa de exclusión por privacidad por periodo y zona aproximada. Se compararían reglas base y modelo mediante una prueba controlada, con estado `sin datos` cuando el denominador sea insuficiente.

No hay modelo automático, endpoint productivo ni métrica de recomendación habilitados en esta entrega.
