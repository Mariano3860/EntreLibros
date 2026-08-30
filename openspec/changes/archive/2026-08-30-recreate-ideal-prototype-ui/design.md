## Context

La aplicación parte del estado base después del rollback de la spec anterior. Ya existen rutas para `/`, `/home`, `/books`, `/community`, `/map`, `/messages`, `/stats`, `/profile` y `/contact`, junto con shell autenticado, servicios tipados, React Query, módulos SCSS y handlers MSW por dominio. La referencia visual está en los dos collages de `Screens/Prototipo ideal/`: `img.png` contiene Inicio, Explorar, Comunidad y Mensajes; `img_1.png` contiene Mapa, Estadísticas, Perfil y Centro de ayuda.

Los collages incluyen chrome de navegador y no exponen metadatos del viewport original. La comparación se hará contra el viewport de la aplicación, no contra el chrome; se fijará un viewport desktop de QA de 1440×900 como baseline reproducible y se conservará la proporción interna de los cuadrantes. Las imágenes del prototipo muestran sólo modo oscuro, que será el target visual primario.

La API real no tiene todavía todos los recursos necesarios para representar gráficos, rankings, historias enriquecidas, actividad detallada, soporte y perfil extendido. MSW será una capa de demo explícita, con datos declarativos estables y contratos suficientemente completos para que una futura spec de backend pueda reemplazarla.

## Goals / Non-Goals

**Goals:**

- Obtener una reconstrucción visual de alta fidelidad, revisada lado a lado, de las ocho pantallas y no sólo un conjunto de estilos más coherentes.
- Fijar la geometría, orden, densidad, contenido visible, recursos, estados y acciones de cada cuadrante antes de considerar completado un grupo.
- Mantener consistencia de entidades y acciones entre pantallas mediante view models y fixtures compartidos.
- Permitir que todas las acciones visibles se puedan demostrar con MSW sin crear deuda en la API real.
- Entregar capturas comparativas desktop y narrow, incluyendo dark canónico, light de compatibilidad, loading, empty, error, teclado y reduced motion.

**Non-Goals:**

- No implementar todavía las migraciones, tablas, repositorios, endpoints reales, persistencia de historias/estadísticas/soporte, autenticación nueva ni eventos Socket.IO.
- No reproducir el chrome del navegador que aparece alrededor de cada cuadrante.
- No sustituir el prototipo por una reinterpretación, una librería de componentes genérica o placeholders de gráficos/mapa.
- No afirmar equivalencia píxel a píxel si faltan las fuentes o assets originales; en ese caso se exige un fallback local o crop registrado y visualmente equivalente.

## Decisions

### 1. La matriz de cuadrantes será la fuente de verdad visual

Antes de implementar se creará una matriz por ruta con: cuadrante de origen, viewport, shell, bloques visibles, orden, proporción de columnas, textos/valores de referencia, asset esperado, acción primaria y estados que deben capturarse. Se crearán recortes de referencia de cada cuadrante para no comparar mentalmente el collage completo ni confundir browser chrome con UI.

Usar una matriz explícita es preferible a aceptar frases como “un dashboard con cards”, porque esas frases permitieron que la spec anterior derivara en una UI distinta aun cuando estuviera prolija.

### 2. El shell se congelará antes de las ocho páginas

La implementación comenzará por un canvas azul petróleo oscuro y una sidebar aproximadamente de 150 px en el viewport desktop de referencia. La sidebar tendrá logo, Inicio, Explorar, Comunidad, Mapa, Mensajes, Estadísticas, Perfil, divisor, Ajustes, Ayuda, Cerrar sesión y el resumen de Mariano; el main tendrá gutters y una grilla que no cambie entre rutas. La selección será teal translúcida y las superficies usarán bordes finos, elevación sobria y radios pequeños/medios.

Los valores definitivos de color, tipografía, gaps y tamaños se tomarán de muestras de las láminas y se congelarán como tokens antes de construir las páginas. Las páginas no podrán introducir valores que contradigan esa escala salvo para una proporción propia del cuadrante.

### 3. Cada pantalla tendrá bloques de presentación explícitos

Se construirán variantes de presentación orientadas a los bloques observables: hero editorial, KPI strip, book rail/card, activity panel, story strip, social composer, feed card, nearby-corners panel, conversation layout, proposal card, map filter rail, map detail card, chart card, ranking card, profile dashboard y help center. Los servicios y componentes de dominio se reutilizarán sólo cuando permitan cumplir la anatomía; de lo contrario se crearán variantes sin duplicar reglas de negocio.

La secuencia de páginas será: Inicio/Explorar, Comunidad/Mensajes, Mapa/Estadísticas y Perfil/Centro de ayuda. Después de cada pareja se tomará una captura y se corregirá la comparación antes de continuar.

### 4. Los datos se separarán de la composición

Se definirá un catálogo declarativo compartido con Mariano, Lucia, Bot, libros de referencia, historias, Rincones, mensajes, propuestas, métricas, series, rankings, perfil y FAQs. Los IDs se reutilizarán entre respuestas, los timestamps serán fijos y las portadas/avatares no se generarán durante el render. Las páginas consumirán servicios/hooks y view models, no arrays de demostración privados.

Los handlers existentes se ampliarán cuando el servicio ya represente el dominio; para datos exclusivamente de demo se crearán handlers o adaptadores claramente etiquetados como demo. Las mutaciones mock mantendrán estado en memoria durante la sesión de la demo para que publicar, enviar, adjuntar, proponer y editar produzcan una consecuencia visible.

### 5. Los assets tendrán una cadena de sustitución controlada

Se intentará, en este orden: localizar el asset original en el repo, recuperar una URL observable estable, extraer un crop del prototipo para demo, y finalmente crear un fallback local con el mismo rol visual. Cada recurso tendrá nombre, fuente, proporción, tratamiento y estado `exacto`/`crop`/`fallback` en el manifest. Nunca se utilizará un `faker.image` o una URL aleatoria para un elemento que deba conservar la geometría de una captura.

Los crops se usarán sólo para reproducir una región visual puntual, nunca como captura completa de la aplicación. El texto superpuesto seguirá siendo HTML accesible y las portadas seguirán siendo tarjetas navegables.

### 6. Gráficos y mapa conservarán la anatomía del prototipo

Los gráficos de Estadísticas se resolverán con SVG/CSS o primitivas ya disponibles, manteniendo leyendas, ejes, tooltip/estado seleccionado, valores, barras y líneas visibles. No se aceptará sustituirlos por texto o bloques grises. El mapa conservará el renderer existente, pero recibirá fondo oscuro/fallback estable, pines teal/naranjas, clusters, ubicación propia, rail y tarjeta de Café Literario con sus metadatos.

### 7. Responsive será reflow, no una versión distinta

La referencia desktop define la geometría principal. En tablet y narrow se mantendrán los mismos bloques y el mismo orden: sidebar colapsable, rails desplazables o apilados, tarjetas en carrusel/lista, chat con lista antes del detalle, mapa debajo del rail y paneles de ayuda/estadísticas apilados. Se evitará ocultar acciones primarias sólo para hacer entrar la captura y se preservará la contención de medios y textos.

### 8. La aceptación será incremental y obligatoria

Cada grupo de páginas tendrá una captura de la ruta real en el viewport de QA, una comparación con el recorte objetivo y una lista de diferencias corregidas. La revisión final no podrá marcar el cambio completo si falta una de las ocho capturas, si una acción importante no responde, si los estados sólo existen en tests o si queda un bloque principal como placeholder.

## Risks / Trade-offs

- **[Risk]** El collage no conserva el viewport, fuente o asset original. **→ Mitigation:** fijar 1440×900 como baseline reproducible, comparar proporciones del viewport de aplicación y registrar crops/fallbacks en un manifest.
- **[Risk]** La amplitud de ocho dashboards puede producir componentes nuevos difíciles de mantener. **→ Mitigation:** compartir shell, tokens, primitives y view models; mantener la composición específica por pantalla y no duplicar servicios de dominio.
- **[Risk]** Datos mock demasiado detallados pueden confundirse con contrato productivo. **→ Mitigation:** aislarlos en MSW/demo, etiquetar campos no respaldados por API y entregar un inventario de recursos/operaciones para el backend posterior.
- **[Risk]** La comparación visual puede quedarse subjetiva. **→ Mitigation:** usar recortes por cuadrante, valores/textos enumerados, checkpoints por grupo y captura obligatoria por ruta.
- **[Risk]** Un mapa o asset remoto cambia o falla. **→ Mitigation:** controlar recursos críticos localmente, mantener geometría independiente del recurso y probar fallback/loading/error.
- **[Risk]** La búsqueda de literalidad puede romper contenido real más largo. **→ Mitigation:** mantener el dataset mock alineado a la captura y definir reglas explícitas de wrap/truncamiento/reflow para contenido variable.

## Migration Plan

1. Crear la matriz de cuadrantes, el viewport de QA, el inventario de assets y el catálogo de textos/valores.
2. Congelar tokens visuales y reconstruir el shell; capturar una ruta vacía para validar coordenadas, tema y navegación.
3. Crear view models y fixtures compartidos; ampliar MSW para lecturas y mutaciones de demo con estados controlables.
4. Implementar Inicio y Explorar, capturar y corregir; luego Comunidad y Mensajes, capturar y corregir; después Mapa y Estadísticas; finalmente Perfil y Centro de ayuda.
5. Implementar reflow responsive, accesibilidad, reduced motion y estados loading/empty/error sin cambiar la anatomía desktop.
6. Ejecutar pruebas, build y matriz manual de ocho capturas. Registrar diferencias restantes, assets sustituidos y contrato mock para la futura OpenSpec backend.
7. Si hay que revertir, eliminar sólo los componentes, estilos, fixtures y documentación de este cambio; no tocar backend, migraciones ni datos persistidos.

## Open Questions

No quedan decisiones abiertas que cambien el alcance. Si un asset o fuente original no aparece, se aplicará la cadena de sustitución definida y se registrará como tal en la matriz.
