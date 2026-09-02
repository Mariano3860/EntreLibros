# Referencia visual

Este documento resume la composición visual que debe conservar la interfaz. Define jerarquía, densidad y comportamiento responsive; no fija datos de ejemplo ni sustituye los contratos de la API.

## Rutas principales

| Ruta | Estructura |
| --- | --- |
| `/home` | Hero, indicadores, recomendaciones y actividad |
| `/books` | Búsqueda, filtros, pestañas y tarjetas de libros |
| `/community` | Historias, compositor, feed, Rincones y actividad |
| `/messages` | Conversaciones, historial, acuerdos y compositor |
| `/map` | Filtros, mapa, pines y detalle |
| `/stats` | Indicadores, series y rankings |
| `/profile` | Identidad, intereses, métricas y preferencias |
| `/contact` | Categorías, preguntas frecuentes y soporte |

## Lenguaje visual

- Sidebar fija de aproximadamente 216 px en desktop y contenido principal con padding de 28 px.
- Canvas azul petróleo, sidebar más profunda, tarjetas azul grisáceas y bordes de bajo contraste.
- Títulos de página de 28–32 px, títulos de tarjeta de 15–18 px y metadata de 11–13 px.
- Espaciado consistente de 6, 10, 14, 18, 24, 30 y 40 px.
- Las tarjetas hermanas comparten ancho, radio, padding y separación.
- El mapa y sus filtros permanecen sincronizados; Mensajes mantiene lista y conversación con scroll independiente.

## Media y accesibilidad

Los recursos estables están en `frontend/public/prototype/`. Las imágenes deben estar contenidas, usar `object-fit` cuando corresponda y conservar el espacio del texto. Los controles sin texto necesitan nombre accesible; el foco, el contraste, el teclado y la reducción de movimiento deben funcionar en ambos temas.

## Validación

Revisa las rutas principales en desktop y viewport estrecho con datos reales y demo. Comprueba que los estados de carga, vacío y error respetan la misma jerarquía visual y que ninguna imagen cubre títulos, acciones o mensajes.
