# Medición reproducible del mapa

Esta medición cubre la consulta representativa de `GET /api/map` con búsqueda
textual, radio de 50 km, centro de referencia y las tres capas habilitadas.
El test crea dentro de una transacción 100 Rincones sintéticos y 10
publicaciones; los datos se revierten al terminar y no contienen información
personal real.

## Cómo repetirla

Desde la raíz, con PostgreSQL/PostGIS de test accesible:

```bash
npm run test:backend
```

La prueba dedicada es
`backend/tests/routes/map.performance.test.ts`. Para ejecutarla sin el resto
de la suite, después de aplicar las migraciones:

```powershell
$env:DOTENV_CONFIG_PATH = '.env.test'
node -r dotenv/config ../node_modules/vitest/vitest.mjs --run tests/routes/map.performance.test.ts
```

El test descarta una primera solicitud de calentamiento, mide 10 solicitudes
HTTP consecutivas y registra p50, p95, media y desviación estándar. El criterio
de aceptación es p95 menor que 2.000 ms.

## Resultado registrado

- Fecha: 2026-09-02.
- Entorno: Windows NT 10.0.26200.0, ASUS Vivobook S 14 S5406SA, 31,5 GB de
  RAM y 8 procesadores lógicos.
- Runtime: Node v22.19.0 y npm 10.9.3.
- Datos: 100 Rincones y 10 publicaciones sintéticas, una transacción aislada,
  radio de 50 km, centro `(-34.6037, -58.3816)` y búsqueda `Benchmark corner`.
- Muestra: 10 solicitudes luego del calentamiento.
- p50: 18,69 ms.
- p95: 25,51 ms.
- Media: 19,32 ms.
- Desviación estándar: 2,22 ms.
- Estado: cumple el objetivo de dos segundos; no fue necesario agregar una
  migración de índices para esta carga.

La medición describe esta máquina, esta carga y la base local de test. No
representa un SLA de producción ni sustituye una prueba con el volumen final.
