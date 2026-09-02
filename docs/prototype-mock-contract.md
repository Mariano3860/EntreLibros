# Contrato del modo demo

Fecha de referencia: 2026-09-02.

Este documento describe el dataset determinista que permite revisar la interfaz sin PostgreSQL. El modo demo es aislado, reinicia su estado al recargar y no representa datos de usuarios ni persistencia del backend.

## Activación

```env
PUBLIC_API_USE_MOCKS=true
```

La variable se resuelve al iniciar o construir el frontend. El valor `mock` en `document.documentElement.dataset.apiMode` confirma que MSW está activo. Para validar datos reales, omite la variable o usa `false`.

## Datos y acciones

El catálogo demo contiene perfiles, libros, historias, Rincones, conversaciones, acuerdos, estadísticas y contenido de ayuda. Sus IDs y orden son estables para que las comprobaciones visuales sean repetibles.

Las acciones soportadas cubren, según la pantalla, publicación de una historia, edición de perfil, envío de mensajes, adjuntos de libros, propuestas, periodo estadístico, preguntas frecuentes y consultas de soporte. Las mutaciones viven en memoria y desaparecen al recargar.

El modo demo también debe cubrir estados de carga, vacío y error. El estado vacío no inventa actividad y el error ofrece reintento. Los datos demo deben identificarse como tales y no mezclarse con respuestas de la API real.

## Recursos visuales

Los recursos estables están en `frontend/public/prototype/`. Son SVG locales para evitar variaciones de red y mantener una composición reproducible. El mapa y los gráficos son composiciones de la interfaz; no implican que exista un proveedor cartográfico o analítico externo.

## Límite

MSW no sirve para verificar PostgreSQL, migraciones, autorización, cookies, Socket.IO real, latencia ni recuperación tras reinicio. Esas comprobaciones deben ejecutarse con el modo real y una base aislada.
