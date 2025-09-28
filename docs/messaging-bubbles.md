# Burbujas de acuerdos en el chat

Esta sección resume las tarjetas disponibles dentro del wrapper de mensajes para acompañar el cierre de intercambios.

## Propuesta de acuerdo

- **Objetivo:** permitir que la persona que inicia el acuerdo proponga punto de encuentro (RdL o espacio público), barrio/ciudad, día y horario, junto con el libro involucrado.
- **Cuándo usarla:** cuando una de las partes envía una propuesta concreta para encontrarse.
- **Interfaz:** se muestra con tono de advertencia (warning/secondary) y ofrece dos acciones: confirmar o proponer cambio. Ambos textos están traducidos vía `community.messages.agreement.actions`.

## Confirmación de acuerdo

- **Objetivo:** dejar asentado que la otra persona confirmó la propuesta con los mismos datos clave.
- **Cuándo usarla:** cuando la contraparte acepta la propuesta y confirma el encuentro.
- **Interfaz:** utiliza el tono de éxito (success/primary) y refuerza quién confirmó el acuerdo.

## Consideraciones transversales

- **i18n:** todos los labels y acciones se resuelven mediante `community.messages.agreement.*`, disponibles en ES/EN.
- **Tema:** ambas burbujas heredan forma, espaciado y sombras del wrapper, respetando light/dark y tokens `primary`/`secondary`.
- **Privacidad:** solo se expone barrio/ciudad y nombre del RdL o espacio público, nunca direcciones exactas.
