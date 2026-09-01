## Resumen de la funcionalidad `/map`

El mini mapa de `/community` consume el contrato de rincones reales y navega al mapa completo con `corner` y `radius` en la URL. Por ejemplo, `/map?radius=5&corner=<id>` abre el rincón seleccionado; si no está visible con los filtros actuales, el mapa conserva esos filtros y muestra el estado correspondiente.

`/map` ofrece radios geográficos discretos de 1, 5, 30 y 50 km, además de “Sin límite”. El valor se refleja en `radius`; si se elige “Sin límite”, el parámetro se elimina. Con permiso de ubicación, el frontend envía el centro aproximado autorizado y la API aplica el mismo radio a rincones, publicaciones, actividad y lista lateral usando distancia geográfica. Sin permiso, el mapa mantiene el radio elegido en la interfaz, no dibuja un perímetro ni inventa un centro preciso y muestra el fallback de Buenos Aires.

La ruta `/map` funciona como hub territorial para descubrir Rincones de Libros, publicaciones cercanas y señales de actividad. El mock se apoya en `msw` y genera datos deterministas a partir de la semilla `2048`. El panel lateral permanece como bloque placeholder hasta definir el detalle definitivo.

### Cómo probar el mapa en desarrollo

1. Levanta el frontend con `npm run dev` (desde `frontend/`).
2. Asegúrate de tener los mocks activos (`npm run dev` ya inicia `msw`).
3. Navega a `http://localhost:3000/map`.
4. Usa los chips superiores para activar/desactivar capas y el rail para afinar filtros (radio, temas, actividad). El perímetro azul-celeste aparece al compartir la ubicación y se ajusta al radio elegido.
5. Para simular estados vacíos o errores en tests puedes sobrescribir el handler `mapHandler` desde `msw`.

### Eventos de analítica

Los siguientes eventos se registran con el helper `track`:

| Evento                      | Cuándo se dispara                                                     | Propiedades       |
| --------------------------- | --------------------------------------------------------------------- | ----------------- |
| `map.view_opened`           | Al montar la página                                                   | `locale`          |
| `map.filter_changed`        | Cada vez que cambia un filtro (search, capas, distancia, temas, etc.) | `filter`, `value` |
| `pin.opened`                | Al seleccionar un pin                                                 | `type`, `id`      |
| `cta.create_corner_clicked` | Al pulsar el FAB “Crear rincón”                                       | —                 |
| `time.to.first.pin`         | Primer render con pins disponibles                                    | `milliseconds`    |

### Consideraciones de privacidad

- Solo se muestran barrio/ciudad y un punto de referencia del anfitrión.
- No se muestran inventarios ni direcciones exactas.
- El botón “Abrir referencia” abre un punto público, nunca un domicilio.
