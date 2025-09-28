# Flujo de mensajería orientado a acuerdos

Este documento resume el flujo conversacional diseñado para coordinar intercambios de libros dentro del chat 1:1 de EntreLibros. El objetivo es reducir la fricción al cerrar acuerdos, mantener la privacidad (solo barrio/ciudad) y asegurar que todas las acciones relevantes ocurran dentro del mismo hilo.

## Tipos de burbuja

Cada mensaje se construye a partir del componente `BubbleBase`, que garantiza alineación por rol (yo/otra persona/sistema), tonos accesibles en temas claro/oscuro y uso de los tokens cromáticos existentes.

| Tipo de burbuja | Uso | Contenido principal | Acciones |
| --- | --- | --- | --- |
| **Texto libre / Plantilla** | Conversación inicial o aclaraciones. | Mensaje plano, puede indicar si proviene de una plantilla. | — |
| **Propuesta de acuerdo** | Enviar lugar (Rincón de Libros o espacio público), barrio/ciudad, horario y libro. | Tarjeta estructurada con los tres datos clave. | `Confirmar` y `Proponer cambio`. |
| **Confirmación de acuerdo** | Aceptar una propuesta. | Sello "Confirmado por…" + detalles del acuerdo vigente. | — |
| **Recordatorio automático** | Avisos programados antes del encuentro (día anterior y mismo día). | Mensaje informativo + resumen del acuerdo vigente. | — |
| **Reprogramación** | Sugerir un nuevo horario/lugar conservando el contexto previo. | Nota del remitente, detalles originales y propuesta nueva. | `Aceptar` y `Sugerir otro`. |
| **Cancelación** | Cancelar el acuerdo con un motivo breve. | Motivo y referencia al acuerdo cancelado. | — |
| **Seguimiento post-encuentro** | Preguntar si se concretó el intercambio. | Pregunta del sistema + botones `Sí`/`No` y recordatorio de los datos. | `Sí` y `No`. |
| **Consejo de seguridad** | Primer recordatorio de buenas prácticas. | Recomendación para reunirse en espacio público o Rincón de Libros. | — |

## Comportamientos clave del flujo

1. **Inicio rápido**: la conversación puede comenzar con texto libre o a través del botón de plantillas que inyecta atajos traducibles (interés, disponibilidad, propuesta de lugar).
2. **Ciclo del acuerdo**: Propuesta → Confirmación → Recordatorios → Seguimiento post-encuentro. Todos los pasos quedan visibles en el hilo.
3. **Gestión de cambios**:
   - **Reprogramar**: muestra contexto del acuerdo original y la propuesta nueva; al confirmarse, reemplaza la versión anterior sin borrar el historial.
   - **Cancelar**: notifica el motivo y deja el historial listo para proponer otro encuentro.
4. **Automatismos del sistema**: consejos de seguridad, recordatorios y seguimiento se originan con rol `system`, centrados en el hilo y diferenciados por tono.
5. **Privacidad por diseño**: solo se muestran el nombre del espacio (Rincón de Libros o lugar público) y el barrio/ciudad. Nunca se pide ni se expone dirección exacta ni datos personales.

## Buenas prácticas de tono y accesibilidad

- Mensajes claros, neutrales y corteses. Se evita lenguaje agresivo o ambiguo.
- Contraste adecuado en ambos temas gracias a los tonos `primary`, `secondary`, `success`, `info`, `warning` y `neutral` definidos en el wrapper.
- Etiquetas y botones traducibles (ES/EN) mediante `common.community.messages.chat.*`.
- `BubbleBase` incorpora roles accesibles (`role="group"`) y variantes pensadas para lectores de pantalla.

## Dataset de conversación mock

`frontend/src/components/messages/Messages.mock.ts` contiene tres conversaciones fijas:

- **Flujo feliz completo** (Samuel): cubre desde plantilla inicial hasta seguimiento post-encuentro, con recordatorios automáticos y reprogramación.
- **Propuesta pendiente** (Laura): ejemplo de negociación en curso, con reprogramación manual antes de confirmar.
- **Acuerdo cancelado** (Pablo): incluye recordatorio y cancelación con motivo para mantener el historial claro.

Estas conversaciones se usan en la UI mock para validar visualmente todos los estados requeridos.

## Referencias técnicas

- Componentes de burbuja en `frontend/src/components/messages/bubbles/`.
- Wrapper genérico: `BubbleBase` maneja alineación, tonos, acciones y meta-información.
- Estilos compartidos: `BubbleBase.module.scss`, `BubbleContent.module.scss` y `Messages.module.scss`.
- Traducciones: `common.community.messages.chat` (ES/EN).

Mantener este documento actualizado al agregar nuevas variantes garantiza coherencia entre producto, diseño y desarrollo.
