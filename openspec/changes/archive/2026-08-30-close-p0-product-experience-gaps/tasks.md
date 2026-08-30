## 1. Contratos y fuentes de datos

- [x] 1.1 Auditar los endpoints, DTOs, queries y estados actuales de catálogo, actividad, Comunidad, mapa, mensajería y logout; verificar el inventario contra `rg` y dejar identificadas las respuestas que se pueden reutilizar sin inventar contratos.
- [x] 1.2 Definir los estados de carga, vacío, error y modo demo para cada recorrido P0, con claves i18n sincronizadas en español e inglés; verificar que no queden mensajes visibles hardcodeados.
- [x] 1.3 Confirmar la política de ubicación propia y pública, incluyendo el radio de 1–25 km y la precisión del indicador; verificarla contra las especificaciones y `docs/recovery-baseline.md`.

## 2. Persistencia y API

- [x] 2.1 Reemplazar las fuentes mock de feed, estadísticas, actividad y sugerencias comunitarias por consultas a usuarios, publicaciones, Rincones y acuerdos persistidos, conservando paginación y proyección pública; verificar con pruebas de servicio e integración que no se devuelvan fixtures en modo real.
- [x] 2.2 Implementar la proyección autenticada de “Mi actividad” a partir de publicaciones ofrecidas y acuerdos intercambiados/completados, con tipos de evento, estado y fecha; verificar autorización, estado vacío y resultados con una cuenta que tenga dos publicaciones.
- [x] 2.3 Completar el contrato de disponibilidad de libros para mensajería, diferenciando libros propios elegibles y libros públicos elegibles de la contraparte; verificar respuestas autorizadas, vacías y de error con pruebas de API.
- [x] 2.4 Validar en backend que adjuntos y propuestas de intercambio solo referencien publicaciones visibles, pertenecientes a la parte correcta y aún disponibles; verificar rechazo de IDs ajenos, retirados o inexistentes.
- [x] 2.5 Si la auditoría confirma que faltan columnas necesarias para fechas o estados de actividad, agregar una migración nueva y actualizar `docs/base_de_datos.md`; verificarla sobre una base fresca y no editar migraciones aplicadas.

## 3. Catálogo, inicio y publicación

- [x] 3.1 Conectar “Explorar libros” de inicio con el listado público real, incluyendo libros de otros usuarios, estados de carga/vacío/error e invalidación después de publicar; verificarlo con pruebas de `HomePage` y hooks.
- [x] 3.2 Convertir `/books` en la ruta canónica del listado completo y agregar “Todos” como primera pestaña activa por defecto; hacer funcionales ambos enlaces “Ver todos” y verificar navegación, selección activa, filtros y rutas de detalle/publicación.
- [x] 3.3 Separar en la interfaz el catálogo público de “Mis libros” y conectar “Mis libros” con `/api/books/mine`; verificar que una cuenta con dos libros vea ambos y que otra cuenta no los reciba como resultados propios.
- [x] 3.4 Reemplazar el arreglo local de actividad de inicio por la proyección persistida y aplicar el nombre “Mi actividad” cuando la sección muestre eventos; verificar eventos de oferta/intercambio y ausencia de contenido ficticio.
- [x] 3.5 Corregir tokens y estilos de inputs, textos, botones, validaciones y estados del flujo de publicación para tema oscuro y claro; verificar contraste y legibilidad en `PublishBookModal` mediante pruebas de componente y revisión visual.

## 4. Comunidad y mapas

- [x] 4.1 Hacer que el botón “Publicar” de Comunidad abra el flujo existente de publicación y que sus errores sean visibles; verificar navegación o apertura del modal desde `CommunityFeedPage`.
- [x] 4.2 Corregir el contenedor de imágenes de Rincones para relaciones de aspecto largas, reservando el área del nombre y acciones; verificarlo con imágenes cuadradas, verticales y panorámicas en pruebas de componente.
- [x] 4.3 Reparar el mini mapa para que renderice base/capas, contenido autorizado y sus tres controles, diferenciando carga, vacío y error; verificar cada control y los estados con pruebas de `CornersMiniMap`/Comunidad.
- [x] 4.4 Implementar la inicialización de ubicación de `/map` con permiso del navegador, fallback visible sin permiso y marcador privado de posición propia; verificar centrado, indicador, rechazo y ausencia de coordenadas exactas en la respuesta pública.
- [x] 4.5 Corregir el slider de distancia para que su valor controlado alimente la consulta, alcance 25 km y pinte todo el track hasta el extremo derecho; verificar valores límite, filtrado de resultados y estilo en `FilterRail` y `MapPage`.

## 5. Mensajería e intercambios

- [x] 5.1 Hidratar cada conversación real con los libros propios y los libros elegibles de la contraparte, propagando carga, error y vacío a los modales; verificar que “Adjuntar Libro” muestre los dos libros de una cuenta configurada y no una lista mockeada.
- [x] 5.2 Posicionar el historial al último mensaje después de seleccionar una conversación, cargar historial o recibir un mensaje nuevo; verificarlo con pruebas de `Messages` y una conversación larga.
- [x] 5.3 Conectar “Adjuntar Libro” con la selección de una publicación real y “Proponer un intercambio” con libros elegibles de ambas partes; verificar envío válido, bloqueo sin opciones y reintento ante fallo de carga.
- [x] 5.4 Mantener la validación final de disponibilidad al persistir una propuesta y actualizar la vista tras éxito/error; verificar que una publicación retirada entre la carga del modal y el envío no genere un acuerdo inválido.

## 6. Sesión, regresión y documentación

- [x] 6.1 Incorporar un modal de confirmación de logout con cancelar y confirmar; verificar que cancelar conserve la sesión y que confirmar invalide la sesión y redirija a login mediante pruebas de hook/componente.
- [x] 6.2 Actualizar handlers MSW y fixtures únicamente para escenarios de prueba/demo explícita, sin usarlos como fallback del modo real; verificar `PUBLIC_API_USE_MOCKS=false` en pruebas de arranque y `true` en las pruebas aisladas que lo necesiten.
- [x] 6.3 Ejecutar `npm run test:backend`, `npm run test:frontend`, typecheck, lint, stylelint, builds y `git diff --check`; verificar que todas las suites y validaciones canónicas pasen.
- [ ] 6.4 Realizar la validación manual de navegador con servicios reales y mocks desactivados siguiendo `docs/recovery-baseline.md`, incluyendo inicio, `/books`, publicación, Comunidad, `/map`, `/messages` y logout; registrar cualquier desvío restante.
- [x] 6.5 Actualizar `docs/backlog.md`, `docs/estado-actual.md`, `docs/roadmap.md`, README/documentos técnicos, OpenAPI y migraciones si corresponde; verificar rutas, variables `PUBLIC_*`, enlaces y estado final del cambio OpenSpec.

## 7. Correcciones confirmadas en la revisión de producto

- [x] 7.1 Auditar y corregir el conjunto “Todos” para que una sesión vea la unión del catálogo público y sus propios libros, sin filtrar libros privados de otras personas; agregar prueba de regresión con `user2`.
- [x] 7.2 Crear persistencia y contrato para historias de Comunidad con texto, imagen opcional y libro enlazado; reemplazar el acceso a publicación de libro por el compositor y actualizar el feed real.
- [x] 7.3 Simplificar el mini mapa a un único control de navegación, mantenerlo arriba a la derecha y retirar estados/acciones engañosos.
- [x] 7.4 Hacer reactivo el centrado de Leaflet ante la ubicación autorizada; conservar fallback visible y marcador privado.
- [x] 7.5 Ajustar la rail de distancia y mantener el mapa siempre expandido, sin una sección condicional de Rincones o detalle.
- [x] 7.6 Persistir el adjunto de libro como metadata tipada del mensaje, mapearlo a tarjeta al recargar y mostrar errores de envío.
