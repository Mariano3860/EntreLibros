## Context

La aplicación ya tiene notificaciones persistentes para mensajes y acuerdos, una API autenticada para listarlas y marcarlas como leídas, deduplicación por evento y un punto rojo integrado en Mensajes. El frontend consulta ese estado mediante React Query y la mensajería utiliza Socket.IO. La propuesta agrega una forma visible y contextual de consumir esa infraestructura sin crear un centro de notificaciones independiente.

## Goals / Non-Goals

**Goals:**

- Presentar una campanita flotante solo cuando existan avisos pendientes.
- Mostrar un contador y una ventana desplazable con avisos agrupados.
- Agrupar mensajes por conversación y mantener acuerdos como eventos individuales.
- Abrir la conversación correspondiente y sincronizar el estado leído/no leído.
- Actualizar la señal mientras la aplicación está abierta.
- Mantener textos públicos breves y sin datos sensibles.

**Non-Goals:**

- Crear una ruta o página `/notifications`.
- Diseñar notificaciones por correo o push.
- Crear recordatorios programados de acuerdos.
- Navegar hasta un mensaje individual o resaltarlo.
- Agregar preferencias avanzadas por tipo de evento.
- Implementar moderación, reputación u otras capacidades del MVP.

## Decisions

### 1. La campanita será un acceso contextual global

La campanita deberá vivir en el layout autenticado que comparten las pantallas. Esto permite que el usuario reciba el aviso desde cualquier sección sin duplicar el componente en cada página.

Alternativa descartada: una nueva página de notificaciones. Se descarta porque contradice el alcance acordado y agrega navegación que no aporta al MVP.

### 2. La ventana mostrará un modelo visual derivado del contrato persistido

La interfaz usará las notificaciones existentes como fuente de verdad. Para la presentación, agrupará los eventos de mensaje por conversación y conservará separados los eventos de acuerdos. El grupo mantendrá la referencia a la conversación para que todas sus notificaciones puedan marcarse como leídas al activarlo.

Alternativa descartada: almacenar grupos nuevos en la base. El agrupamiento es una decisión de presentación y no necesita otro modelo persistente.

### 3. Abrir la ventana no implica leer

La ventana solo permite inspeccionar los avisos. La lectura ocurrirá al activar un aviso o al abrir directamente la conversación, de acuerdo con la semántica ya implementada para mensajes.

Esto evita que el usuario pierda un aviso por abrir accidentalmente la campanita.

### 4. La navegación tendrá como único destino la conversación

Los avisos conservarán el identificador de conversación y abrirán `/messages` con esa conversación seleccionada. No se agrega todavía un contrato de anclaje a mensaje o evento individual.

### 5. La actualización combinará persistencia y tiempo real

La API persistida seguirá siendo la fuente de verdad para el contador, la agrupación y el estado leído. Los eventos Socket.IO podrán invalidar o actualizar la consulta de notificaciones mientras la aplicación está abierta, evitando depender únicamente del intervalo de consulta periódica.

Alternativa descartada: mantener solo polling. El polling conserva tolerancia ante reconexiones, pero por sí solo retrasa la aparición del aviso y no cumple una experiencia inmediata.

### 6. La preferencia general controla la superficie in-app

La preferencia existente de notificaciones in-app se aplicará a la campanita y a los avisos visibles. No se agregan preferencias separadas para mensajes, acuerdos o recordatorios en este cambio.

### 7. La entrega se divide en dos ramas con una pausa explícita

La primera fase se implementará en una rama nueva creada al comenzar el trabajo. Incluirá la superficie de campanita, contador, ventana, agrupamiento de mensajes y navegación a conversaciones. Al terminar, se harán commits en esa rama, se abrirá una PR en español y el agente se detendrá hasta que el usuario la fusione.

La segunda fase se iniciará únicamente después de esa fusión, creando otra rama explícita. Incluirá la integración visual de acuerdos confirmados, la preferencia general visible si corresponde y la actualización final de los estados en tiempo real. También terminará con commits y una PR en español para que el usuario haga el merge.

## Risks / Trade-offs

- **[Avisos desactualizados]** → Mantener la consulta persistida como fuente de verdad, invalidarla después de marcar como leído y conservar polling como recuperación.
- **[Duplicación visual]** → Usar la clave de evento persistida y agrupar únicamente en la capa de presentación.
- **[Demasiados avisos]** → Mostrar todos los grupos en una ventana desplazable, sin limitar silenciosamente la cantidad.
- **[Información privada en el aviso]** → Usar solo nombre público o alias y claves de traducción; nunca correo ni datos de ubicación.
- **[Interacción fuera de la ventana]** → Cerrar por botón o clic externo sin modificar el estado leído.
- **[Cambios de contrato]** → Reutilizar `conversationId`/`entityId` existentes y modificar la API solo si una prueba demuestra que falta un dato para navegar.

## Migration Plan

1. Crear la rama de la primera fase a partir de la rama que contenga la OpenSpec.
2. Implementar y verificar la superficie de avisos de mensajes.
3. Crear la PR de la primera fase con descripción en español y detenerse para el merge del usuario.
4. Después del merge, crear una segunda rama desde la rama actualizada.
5. Implementar la fase de acuerdos, preferencia y cierre de actualización en tiempo real.
6. Crear la segunda PR en español y detenerse para el merge del usuario.

No se requiere una migración de base de datos prevista para esta OpenSpec. Si durante la implementación apareciera una necesidad real de modificar el contrato persistido, deberá detenerse el trabajo y revisarse el alcance antes de agregar una migración.

## Open Questions

No quedan preguntas de producto bloqueantes. Los detalles de ubicación exacta del componente, estilos, estrategia de invalidación de React Query y composición del evento Socket.IO pertenecen a la implementación y deben mantenerse dentro de los límites de esta especificación.
