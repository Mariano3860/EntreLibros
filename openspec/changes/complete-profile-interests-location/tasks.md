## 1. Preparación y contrato existente

- [ ] 1.1 Revisar el esquema actual de usuarios, perfiles, ubicación y proyección pública; documentar qué campos o relaciones pueden reutilizarse.
- [ ] 1.2 Revisar el formulario de perfil, sus tipos, servicios y traducciones para definir los puntos de integración sin crear una pantalla nueva.
- [ ] 1.3 Definir y documentar el catálogo inicial breve de intereses de libros y el catálogo territorial de ciudades/barrios compatible con el MVP.

## 2. Persistencia y API

- [ ] 2.1 Diseñar la migración aditiva necesaria para intereses y zona general, incluyendo compatibilidad con usuarios existentes y sin almacenar dirección exacta.
- [ ] 2.2 Implementar la persistencia de intereses, ciudad y barrio con validación de pertenencia ciudad-barrio.
- [ ] 2.3 Ampliar lectura y actualización del perfil autenticado para cargar y guardar intereses y zona general.
- [ ] 2.4 Actualizar la proyección pública para respetar ubicación privada, ciudad o barrio y excluir siempre datos exactos.
- [ ] 2.5 Agregar pruebas de API para guardado, edición, valores inválidos, perfiles existentes y los tres niveles de visibilidad.

## 3. Formulario y presentación

- [ ] 3.1 Agregar al formulario de perfil la selección predefinida de intereses, permitiendo guardar con menos de tres y mostrando la recomendación correspondiente.
- [ ] 3.2 Agregar selectores de ciudad y barrio, limpiar o invalidar el barrio al cambiar de ciudad y exigir ciudad para guardar la zona.
- [ ] 3.3 Mostrar intereses y zona pública según la respuesta sanitizada del perfil, sin exponer dirección ni coordenadas exactas.
- [ ] 3.4 Incorporar traducciones en español neutro e inglés para etiquetas, recomendaciones, validaciones y estados de error.
- [ ] 3.5 Agregar pruebas del formulario y de la presentación pública para carga, edición, error y privacidad.

## 4. Verificación y entrega

- [ ] 4.1 Ejecutar tests de backend y frontend, typechecks, lint, Stylelint, formateadores y builds; corregir regresiones reales y registrar warnings preexistentes.
- [ ] 4.2 Verificar manualmente un perfil nuevo, un perfil existente, cero/uno/tres intereses, ciudad sin barrio, ciudad con barrio, cambio de ciudad y las tres visibilidades.
- [ ] 4.3 Confirmar que no se agregaron recomendaciones, geolocalización ni exposición de dirección exacta fuera del alcance.
- [ ] 4.4 Actualizar `docs/backlog.md` y la documentación de estado del MVP con el alcance implementado y sus límites.
- [ ] 4.5 Crear una rama explícita para la implementación, hacer commits incrementales y abrir una PR en español sin realizar el merge desde el agente.
