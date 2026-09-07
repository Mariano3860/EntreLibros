## 1. Baseline y contrato de implementación

- [ ] 1.1 Registrar una captura manual del `/map` actual con el dataset sintético y ejecutar `frontend/tests/pages/map/MapPage.test.tsx`, `MapPage.real.test.tsx`, `MapCanvas.test.tsx` y `backend/tests/routes/map.api.test.ts`; verificar que el baseline quede guardado como evidencia antes de tocar la composición.
- [x] 1.2 Repetir la búsqueda estática de rutas, imports directos/indirectos, lazy imports, tests, mocks/MSW, scripts, documentación y consumidores externos de todos los componentes del área `frontend/src/components/map`; verificar que cada eliminación posterior tenga una lista de consumidores vacía.
- [x] 1.3 Confirmar el proveedor/estilo oscuro de teselas, su URL, atribución, límites y fallback; verificar que la decisión quede documentada, no requiera secretos públicos y cumpla la política del proveedor antes de fijarla en la aplicación.
- [x] 1.4 Definir el modelo visual común de categorías/temas entre mock y API real y documentar la semántica de `recentActivity`; verificar con pruebas que no se envían categorías de catálogo que el backend no puede interpretar ni se afirma una ventana temporal inexistente.

## 2. Modelo de pantalla y textos

- [x] 2.1 Extraer los modelos de presentación de Rincón, publicación, actividad y selección sin duplicar el contrato de `MapResponse`; verificar con typecheck que la adaptación conserve ids, coordenadas públicas, distancias nulas y estados.
- [x] 2.2 Centralizar en i18n los títulos, estados, etiquetas, aria-labels, errores, vacío, truncamiento, ubicación denegada y acciones del nuevo mapa en español e inglés; verificar que no queden textos funcionales hardcodeados en la nueva superficie y que las traducciones mantengan las mismas claves.
- [x] 2.3 Resolver la búsqueda de zona: conectar sugerencias geocodificadas solo si la respuesta actual es adecuada para recentrar una exploración, o dejar búsqueda textual explícita si no lo es; verificar que una sugerencia no exponga una dirección privada y que texto libre no cambie el centro.

## 3. Shell y panel de exploración

- [x] 3.1 Reemplazar la grilla fija de `MapPage` por un shell relativo map-dominant que use el alto/ancho disponible de `BaseLayout`; verificar visualmente que el mapa sea la superficie principal y que no aparezca una columna de detalle vacía.
- [x] 3.2 Adaptar `FilterRail` como el único panel de exploración con búsqueda, radio, temas válidos, disponibilidad, capa de actividad y estado de consulta; verificar búsqueda, radio, temas, toggles, carga y cierre desde pruebas de componente.
- [x] 3.3 Integrar `Mi ubicación`, estado de consulta, truncamiento, `Crear rincón` y el acceso a filtros como controles flotantes dentro del shell; verificar autenticación, fallback territorial, preservación del radio y apertura del `PublishCornerModal`.
- [x] 3.4 Aplicar profundidad visual con variables existentes (`surface`, `surface-raised`, teal, orange, bordes y sombras) y eliminar el espacio muerto del layout anterior; verificar Stylelint, ambos temas y una revisión manual comparada con `maps_prototipe.png`.
- [x] 3.5 Implementar panel colapsable/drawer y tarjeta inferior para tablet y anchos intermedios, reservando zonas para controles y mapa; verificar en viewport desktop, tablet y móvil que no haya scroll horizontal ni controles tapados.

## 4. Cartografía y pines

- [ ] 4.1 Cambiar la capa base clara teñida por CSS por la configuración oscura aprobada, manteniendo atribución visible y estado diferenciable de error/carga; verificar el atributo de tema, el fallback y la revisión manual con red degradada o teselas no disponibles.
- [x] 4.2 Rediseñar pines de Rincones, publicaciones, actividad, selección y ubicación con SVG/`divIcon` o equivalente y tokens semánticos existentes; verificar hit areas, nombres accesibles, contraste, estados no basados únicamente en color y privacidad de coordenadas.
- [x] 4.3 Implementar prioridad visual determinista para alta densidad y selección sin instalar clustering en esta iteración; verificar que los resultados limitados del API continúen siendo descubribles al acercar/mover y registrar como follow-up la necesidad de una dependencia si la medición lo exige.
- [x] 4.4 Conservar los controladores de bbox, radio, recentrado y `flyTo` al modificar `MapCanvas`; verificar que `map-viewport-catalog` siga pasando para modo sin límite, radios numéricos, cambios rápidos de viewport y coordenadas aproximadas.

## 5. Selección y actividad

- [x] 5.1 Convertir la tarjeta resumen y el detalle lateral en una única superficie de selección para Rincones y publicaciones; verificar que pin, tarjeta, foco, URL `corner` y encuadre representen únicamente el último elemento seleccionado.
- [x] 5.2 Reutilizar o extraer el contenido productivo de `CornerDetailsPanel` dentro del estado expandido de la tarjeta, conservando carga, error, retry, edición, pausa/reactivación y reporte; verificar que no se rendericen headings ni datos duplicados en paralelo.
- [x] 5.3 Limpiar la información de la tarjeta para usar solo campos existentes y eliminar el rating fijo `4,8` y afirmaciones no respaldadas; verificar vacío de imagen, distancia desconocida, actividad ausente, detalle de horario/reglas y navegación a `/books/:id`.
- [x] 5.4 Rediseñar la actividad cercana para presentar señales verificables (`MapActivityPoint`, `lastSignalAt`, publicaciones vinculadas y métricas cargadas en detalle); verificar estado con actividad, estado sin actividad y que el feed global sin coordenadas no se use como actividad local.
- [x] 5.5 Mantener el flujo de crear/editar/reporte y la invalidación de datos después de publicar o actualizar un Rincón; verificar que el mapa se refresque sin perder el estado visual válido ni mostrar la ubicación exacta.

## 6. Pruebas de comportamiento y navegador

- [x] 6.1 Actualizar `MapPage` mock/real para cubrir renderizado, búsqueda, filtros válidos, radio, vacío/error, selección y cambio/cierre de selección, URL, truncamiento y actividad; verificar la suite de páginas completa.
- [ ] 6.2 Ampliar `MapCanvas` para cubrir tesela/atribución/tema, pines semánticos, selección, ubicación, controles, bbox, foco, movimiento reducido y estado de alta densidad; verificar la suite de componente sin depender de una red cartográfica real.
- [ ] 6.3 Mantener o ampliar las pruebas backend/API de bbox, radio, categorías, `openNow`, actividad, límites, orden, publicaciones, privacidad y rendimiento; verificar `map.api.test.ts`, `map.performance.test.ts` y cualquier contrato modificado.
- [x] 6.4 Agregar un spec Playwright dedicado a `/map` usando el entorno y dataset E2E sintéticos; verificar mapa visible, filtros, búsqueda, selección/cambio, `Mi ubicación`, `Crear rincón`, actividad, vacío, recarga y ausencia de coordenadas privadas.
- [ ] 6.5 Agregar escenarios Playwright responsive y de accesibilidad práctica para abrir/cerrar el drawer, operar con teclado, cerrar selección, usar `prefers-reduced-motion` y evitar solapamientos; verificar al menos desktop y un viewport intermedio.
- [ ] 6.6 Ejecutar revisión manual con API real en la checklist de navegador, ambos temas, permisos de ubicación, error de consulta, error de teselas, actividad vacía y dataset con varias publicaciones; verificar que la experiencia conserve el mismo comportamiento funcional observable.

## 7. Variantes sin consumidores y documentación

- [x] 7.1 Después de migrar las responsabilidades, eliminar `MapHeader` y su test si la auditoría estática confirma que siguen sin consumidores productivos; verificar imports, build y `rg` sin referencias residuales.
- [x] 7.2 Reutilizar `CreateCornerFab` únicamente si queda montado dentro del shell y aporta una acción única; si no, eliminarlo junto con su estilo/test tras verificar que `Crear rincón` sigue cubierto. No eliminar `ProposeMeetingModal` ni primitives comunes sin nueva evidencia de que pertenecen exclusivamente a este flujo.
- [x] 7.3 Actualizar `docs/tfg-browser-checklist.md`, `docs/recovery-baseline.md`, `docs/estado-actual.md`, `docs/roadmap.md` y `docs/backlog.md` con layout, proveedor/atribución, variables, estados y procedimiento real; verificar enlaces relativos, comandos y que no se documenten capacidades futuras como disponibles.

## 8. Verificación final

- [ ] 8.1 Ejecutar `git diff --check`, format, lint, Stylelint, typecheck, suites frontend/backend, build y pruebas E2E; verificar que `npm run verify:ci` termine correctamente.
- [x] 8.2 Revisar manualmente el diff contra `proposal.md`, `design.md` y `specs/map-exploration-experience/spec.md`; verificar que no haya cambios fuera de alcance en mensajería, acuerdos, persistencia, contratos ajenos o comportamiento funcional no justificado.
- [x] 8.3 Ejecutar `openspec validate --change redesign-map-exploration-experience --strict` y confirmar `git status --short`; verificar que todos los artifacts estén completos y que el change quede listo para revisión antes de aplicar.
