# Referencia visual del prototipo ideal

Esta matriz traduce las dos láminas de `Screens/Prototipo ideal/` a un contrato verificable. El viewport de aceptación es **1440 × 900 px de aplicación**, sin chrome del navegador. Cada lámina contiene cuatro cuadrantes en orden de lectura.

## Matriz de pantallas

| Lámina / cuadrante | Ruta | Orden de bloques | Composición objetivo |
| --- | --- | --- | --- |
| `img.png` · superior izquierdo | `/home` | hero, cuatro KPI, recomendaciones, actividad | sidebar 15%; main 85%; gutter 28–32 px; hero 28% de la altura útil; KPI 4 columnas; rail de 5 libros; actividad en panel inferior |
| `img.png` · superior derecho | `/books` | header, búsqueda/acciones, tabs, rail de libros | header 18%; tabs 7%; rail 58%; controles inferiores 8%; cards de relación aproximada 0,66 y cinco columnas |
| `img.png` · inferior izquierdo | `/community` | stories, composer, feed, rincones, mapa, sugerencias | main social 64%; aside 36%; gap 20–24 px; stories y composer en cards; media del post con `object-fit: cover` |
| `img.png` · inferior derecho | `/messages` | lista, header, conversación, propuesta, composer | lista 31%; chat 69%; header 72 px; mensajes con scroll propio; composer anclado al fondo |
| `img_1.png` · superior izquierdo | `/map` | rail de filtros, mapa, pines, detalle | rail 29%; mapa 71%; ambas regiones con igual altura; radio inicial 2 km; card de lugar superpuesta abajo |
| `img_1.png` · superior derecho | `/stats` | header, KPI, línea, barras, ranking, mapa, contribuyentes | KPI 4 columnas; grilla analítica 2 columnas; cards densas con gaps de 16–20 px |
| `img_1.png` · inferior izquierdo | `/profile` | portada, identidad, intereses, métricas, preferencias, objetivo, racha, logros | hero de ancho completo; métricas 4 columnas; cuerpo 2 columnas (principal 64%, aside 36%) |
| `img_1.png` · inferior derecho | `/contact` | hero/búsqueda, categorías, FAQ, soporte | hero centrado; categorías 6 columnas; cuerpo 2 columnas (FAQ 66%, soporte 34%) |

## Geometría común

- Sidebar fija: 216 px a 1440 px, con logo arriba y resumen de Mariano abajo.
- Main: margen izquierdo de 216 px, ancho restante, padding 28 px y máximo visual de 1224 px.
- Escala de separación: 6, 10, 14, 18, 24, 30 y 40 px. Cards hermanas usan 16–20 px; secciones mayores 24–30 px.
- Superficies: canvas azul petróleo, sidebar más profunda, cards azul grisáceo y bordes de baja luminosidad.
- Densidad: títulos de página 28–32 px; títulos de card 15–18 px; cuerpo 13–15 px; metadata 11–13 px.
- Scroll: el documento desplaza en Inicio, Explorar, Comunidad, Estadísticas, Perfil y Ayuda. Lista y conversación desplazan de forma independiente en Mensajes; rail y mapa permanecen sincronizados en Mapa.

## Contenido visible congelado

- Identidad: Mariano, `@mariano`, Palermo · Buenos Aires, miembro desde marzo de 2023.
- Libros: *Ecos del Viento Norte*, *El mapa de las luciérnagas*, *Cartas para otro verano*, *La biblioteca sin tiempo* y *Bajo la misma constelación*.
- Inicio: saludo `¡Bienvenido de nuevo, Mariano!`; KPI `134`, `52`, `1`, `1`.
- Comunidad: Tu historia, Red tea, Harry Potter, Club de poesía, Nueva casita, Lectores BA y Ficción total.
- Mensajes: Bot, Lucia, Club de Lectura BA, Sofia, Diego y Ana; propuesta de *Ecos del Viento Norte*.
- Mapa: 2 km, Todo, Cafés, Bibliotecas, Parques, Librerías y Más; lugar seleccionado Café Literario.
- Estadísticas: `2.843`, `1.327`, `5.891`, `7.642` y período Últimos 7 días.
- Perfil: métricas `146`, `23`, `58`, `41`; Preferencias, Objetivo de lectura, racha y Logros.
- Ayuda: Cuenta, Publicaciones, Intercambios, Mensajes, Casitas y Seguridad; FAQ y contacto por chat, consulta o email.

## Manifest de medios

| Recurso | Fuente / fallback | Relación y tratamiento |
| --- | --- | --- |
| Hero de Inicio | SVG local `prototype/reading-room.svg` | 16:5, cover, overlay azul oscuro a izquierda |
| Portadas (5) | SVG locales `prototype/books/*.svg` | 2:3, cover, color y título propios; fallback con iniciales |
| Avatar Mariano y comunidad | gradientes locales + inicial/foto estable | 1:1, cover, aro por estado |
| Media del post | SVG local `prototype/community-reading.svg` | 16:8, cover, texto siempre fuera de la imagen |
| Portada de Perfil | SVG local `prototype/profile-cover.svg` | 16:4, cover, overlay inferior |
| Mapa | renderer Leaflet existente; fallback CSS oscuro | superficie oscura, calles de bajo contraste, pines por categoría |
| Gráficos | SVG/CSS semántico | `viewBox` adaptable, leyendas HTML, color no es el único indicador |
| Ilustración de Ayuda | SVG local `prototype/help.svg` | 4:3, contenida, decorativa |
| Iconos | set SVG existente + símbolos tipográficos accesibles | 18–22 px, `aria-label` en controles sin texto |

Los SVG locales son sustituciones intencionales mientras no exista un asset original separado de las láminas. No se usan URLs aleatorias ni faker para medios visibles.
