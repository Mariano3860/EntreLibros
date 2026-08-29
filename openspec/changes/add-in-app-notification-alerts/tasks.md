## 1. Primera fase: campanita y avisos de mensajes

- [x] 1.1 Crear explícitamente la rama `feature/in-app-message-notifications` a partir de la rama que contenga esta OpenSpec y verificar con `git branch --show-current` que el trabajo no se realiza sobre `main`.
- [x] 1.2 Revisar el contrato persistido de notificaciones y confirmar con pruebas que esta primera fase no necesita una migración de base de datos ni una ruta `/notifications`.
- [x] 1.3 Preparar el modelo visual de notificaciones de mensajes usando el identificador de conversación, el nombre público disponible, el estado leído/no leído y la cantidad de eventos agrupados; verificar tipos de frontend y pruebas del modelo.
- [x] 1.4 Implementar la campanita flotante autenticada con visibilidad condicional y contador total de avisos pendientes; verificar los estados sin avisos, con un aviso y con varios avisos.
- [x] 1.5 Implementar la ventana desplegable de avisos de mensajes con agrupación por conversación, scroll para todos los grupos, cierre explícito y cierre por clic externo; verificar teclado, accesibilidad y que abrirla no marque avisos como leídos.
- [x] 1.6 Implementar el clic de un aviso de mensaje para marcar el grupo correspondiente como leído y abrir la conversación de `/messages`; verificar que el contador, la campanita y el punto rojo se actualicen.
- [x] 1.7 Integrar la actualización del aviso con los eventos de mensajería y la consulta persistida existente, conservando deduplicación y recuperación por consulta periódica; verificar que un mensaje recibido con la aplicación abierta actualice la señal sin recarga manual.
- [x] 1.8 Ejecutar las pruebas específicas y generales del frontend, corregir regresiones y realizar la comprobación manual con dos usuarios y dos conversaciones; documentar el resultado en la descripción de la PR.
- [x] 1.9 Hacer commits claros y concisos en `feature/in-app-message-notifications`, crear una PR con descripción en español en formato GitHub y detener el trabajo hasta que el usuario fusione esa PR.

## 2. Puerta de merge de la primera fase

- [x] 2.1 Verificar que la primera PR esté publicada, que su rama de destino sea la rama acordada por el usuario y que no se haya realizado ningún merge desde el agente; continuar solo después de la confirmación del usuario de que la PR fue fusionada.

## 3. Segunda fase: acuerdos y preferencia in-app

- [x] 3.1 Después de la confirmación del merge de la primera fase, crear explícitamente la rama `feature/in-app-agreement-notifications` desde la rama actualizada y verificar que el trabajo no se realiza sobre `main`.
- [x] 3.2 Integrar en la ventana existente los avisos individuales de acuerdos confirmados, usando el nombre público o alias y el destino de la conversación; verificar que convivan correctamente con grupos de mensajes.
- [x] 3.3 Conectar la preferencia general de notificaciones in-app con la visibilidad de la campanita y los avisos, incorporando un control visible solo si el flujo existente de perfil permite alojarlo sin crear una nueva sección; verificar activación y desactivación.
- [x] 3.4 Completar la actualización en tiempo real para mensajes y acuerdos, invalidando o actualizando la consulta persistida sin duplicar eventos; verificar reconexión, entrega repetida y actualización del contador.
- [x] 3.5 Verificar que cancelar o cerrar la ventana no marque avisos como leídos y que activar un aviso marque únicamente las notificaciones que representa antes de abrir la conversación.

## 4. Verificación y entrega de la segunda fase

- [x] 4.1 Ejecutar las pruebas de frontend y backend afectadas, los typechecks, los formateadores y la validación de OpenSpec; corregir todos los errores reales y registrar cualquier warning preexistente.
- [x] 4.2 Realizar la comprobación manual con mensajes nuevos, varios mensajes de una conversación, conversaciones distintas, acuerdos confirmados, preferencia desactivada y recarga de la aplicación.
- [x] 4.3 Hacer commits claros y concisos en `feature/in-app-agreement-notifications`, crear una PR con descripción en español en formato GitHub y detener el trabajo para que el usuario realice el merge final.
