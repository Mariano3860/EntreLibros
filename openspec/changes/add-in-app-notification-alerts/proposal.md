## Why

EntreLibros ya persiste notificaciones y muestra un punto rojo en la sección de Mensajes, pero el usuario no recibe contexto inmediato sobre lo ocurrido ni una forma clara de llegar al chat desde el aviso. Esto deja incompleta la experiencia de HU-5.3 y dificulta comprobar mensajes y acuerdos en el MVP.

## What Changes

- Agregar una campanita flotante visible únicamente cuando existan notificaciones in-app pendientes.
- Mostrar un contador con la cantidad de avisos pendientes.
- Abrir una ventana desplegable con los avisos pendientes al hacer clic en la campanita.
- Agrupar los mensajes pendientes por conversación y mostrar los acuerdos como avisos individuales.
- Mostrar avisos breves para mensajes nuevos y acuerdos confirmados.
- Permitir cerrar la ventana sin marcar avisos como leídos.
- Marcar el aviso como leído y abrir la conversación al hacer clic sobre él.
- Mantener el punto rojo de Mensajes como señal persistente y marcar como leídas las notificaciones de una conversación al abrirla.
- Respetar la preferencia general de notificaciones in-app.
- Mantener la deduplicación existente y evitar avisos para mensajes enviados por el propio usuario.
- Mantener fuera de este cambio la ruta `/notifications`, las notificaciones por email o push, los recordatorios de acuerdos y la navegación hasta un mensaje exacto.

## Capabilities

### New Capabilities

- `in-app-notifications`: avisos visuales agrupados para mensajes y eventos de acuerdos dentro de la aplicación.

### Modified Capabilities

<!-- No hay especificaciones principales equivalentes en openspec/specs/. -->

## Impact

- Frontend: componente global de campanita y ventana de avisos, agrupación visual, navegación a `/messages` y sincronización del estado leído/no leído.
- Backend: reutilización y, si fuera necesario, ampliación mínima del contrato existente de notificaciones y sus datos de destino; no se agrega un centro independiente.
- Tiempo real: integración con los eventos existentes de mensajería para que el aviso pueda aparecer mientras la aplicación está abierta.
- Preferencias: conexión de la visibilidad de avisos con la preferencia general in-app ya persistida.
- Pruebas: contratos de API, componentes, estados de agrupación y flujo manual con dos usuarios.
- Entrega: la implementación se dividirá en dos ramas sucesivas. La primera rama tendrá su propia PR y debe ser mergeada por el usuario antes de crear la segunda. Cada rama tendrá commits propios y una descripción de PR en español.
